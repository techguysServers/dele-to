"use client"

import type React from "react"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Eye, Shield, AlertTriangle, Clock, Key } from "lucide-react"
import Link from "next/link"
import { getSecureShare, getShareMetadata } from "../../actions/share"
import { SecureCrypto } from "../../../lib/crypto"
import { AccessTips } from "@/components/access-tips"
import { PasswordInput } from "@/components/password-input"

interface SecureShare {
  id: string
  title: string
  encryptedContent: string
  iv: string
  expiresAt: string
  maxViews: number
  currentViews: number
  requirePassword: boolean
}

interface ShareMetadata {
  id: string
  title: string
  expiresAt: string
  maxViews: number
  currentViews: number
  requirePassword: boolean
}

export default function ViewPage({ params }: { params: { id: string } }) {
  const [shareId, setShareId] = useState<string>("")
  const [share, setShare] = useState<SecureShare | null>(null)
  const [metadata, setMetadata] = useState<ShareMetadata | null>(null)
  const [decryptedContent, setDecryptedContent] = useState<string>("")
  const [password, setPassword] = useState("")
  const [showContent, setShowContent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)

  useEffect(() => {
    const initializePage = async () => {
      setIsClient(true)

      const id = params.id
      setShareId(id)

      if (id) {
        loadMetadata(id)
        loadEncryptionKey()
      }


    }

    initializePage()
  }, [params.id])

  const loadMetadata = async (id: string) => {
    try {
      const result = await getShareMetadata(id)

      if (result.success && result.data) {
        setMetadata(result.data as ShareMetadata)
      } else {
        // If metadata fails, try to get the full share data as a fallback
        const shareResult = await getSecureShare(id)

        if (shareResult.success && shareResult.data) {
          // Convert share data to metadata format
          const shareData = shareResult.data as any
          setMetadata({
            id: shareData.id,
            title: shareData.title,
            expiresAt: shareData.expiresAt,
            maxViews: shareData.maxViews,
            currentViews: shareData.currentViews,
            requirePassword: shareData.requirePassword,
          })
        } else {
          setError(result.error || "Impossible de charger les métadonnées du partage")
        }
      }
    } catch (error) {
      setError("Impossible de charger les métadonnées du partage")
    }
  }

  const loadEncryptionKey = async () => {
    if (typeof window !== "undefined") {
      const fullUrl = window.location.href
      const hashPart = window.location.hash
      let keyFromUrl = hashPart.substring(1) // Remove #

      // If no key in hash, try to extract from URL manually (in case fragment was lost)
      if (!keyFromUrl && fullUrl.includes("#")) {
        const urlParts = fullUrl.split("#")
        if (urlParts.length > 1) {
          keyFromUrl = urlParts[1]
        }
      }

      if (keyFromUrl) {
        try {
          const key = await SecureCrypto.importKey(keyFromUrl)
          setEncryptionKey(key)

          // *** VULNERABILITY FIX ***
          // After storing the key, remove it from the URL to prevent it from being
          // included in the Next.js router state and sent to the server.
          const urlWithoutHash = window.location.pathname + window.location.search
          window.history.replaceState({}, document.title, urlWithoutHash)
          
        } catch (error) {
          setError("Clé de chiffrement invalide ou corrompue dans l'URL")
        }
      } else {
        setError("Aucune clé de chiffrement trouvée dans l'URL. Assurez-vous d'utiliser le lien de partage complet.")
      }
    }
  }

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!encryptionKey) {
      setError("Clé de chiffrement non disponible")
      return
    }

    if (!shareId) {
      setError("Identifiant de partage non disponible")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await getSecureShare(shareId, password)

      if (result.success && result.data) {
        const shareData = result.data as SecureShare
        setShare(shareData)

        // Decrypt content client-side
        try {
          const decrypted = await SecureCrypto.decrypt(shareData.encryptedContent, encryptionKey, shareData.iv)

          setDecryptedContent(decrypted)
          setShowContent(true)
        } catch (decryptError) {
          setError("Impossible de déchiffrer le contenu. La clé de chiffrement est peut-être incorrecte ou corrompue.")
        }
      } else {
        setError(result.error || "Impossible d'accéder au partage sécurisé")
      }
    } catch (error) {
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (decryptedContent) {
      await navigator.clipboard.writeText(decryptedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return "Expiré"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m restants`
    }
    return `${minutes}m restants`
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement du déchiffrement sécurisé...</p>
        </div>
      </div>
    )
  }

  if (showContent && share) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-2xl py-16">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center">{share.title || "Contenu sécurisé"}</CardTitle>
              <CardDescription className="text-center">
                Contenu déchiffré avec succès grâce au chiffrement AES-256 côté client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400 font-medium">{formatTimeRemaining(share.expiresAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {share.currentViews}/{share.maxViews} vues
                  </span>
                </div>
              </div>

              <div>
                <Label>Contenu déchiffré</Label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <div className="flex justify-between items-start gap-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm flex-1 break-all text-gray-900 dark:text-gray-100">{decryptedContent}</pre>
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-sm text-green-600 mt-2">Copié dans le presse-papiers !</p>}
                </div>
              </div>

              <Alert>
                <Key className="w-4 h-4" />
                <AlertDescription>
                  <strong>Avis de sécurité :</strong> Ce contenu a été déchiffré localement dans votre navigateur. Le
                  serveur n'a jamais eu accès à vos données non chiffrées ni à la clé de déchiffrement.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Important :</strong> Ce contenu a été consulté et peut être automatiquement détruit selon
                  les paramètres d'expiration. Sauvegardez-le en sécurité si nécessaire.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Link href="/create">
                  <Button>Créer votre propre partage sécurisé</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <CardTitle>Accéder au contenu sécurisé</CardTitle>
            <CardDescription>
              {metadata?.title && `Accès à : ${metadata.title}`}
              <br />
              ID du partage : {shareId}
              <br />
              Déchiffrement côté client avec AES-256
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccessTips />
            
            {metadata && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">{formatTimeRemaining(metadata.expiresAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {metadata.currentViews}/{metadata.maxViews} vues
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleAccess} className="space-y-4">
              {metadata?.requirePassword && (
                <div>
                  <Label htmlFor="password">Mot de passe d'accès</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Saisissez le mot de passe requis"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {!encryptionKey && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Aucune clé de chiffrement trouvée dans l'URL. Assurez-vous d'utiliser le lien de partage complet,
                    y compris la partie fragment (#).
                    <br />
                    <br />
                    <strong>Format d'URL attendu :</strong>
                    <br />
                    <code className="text-xs">https://ardd.cloud/view/[id]#[encryption-key]</code>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !encryptionKey}>
                {isLoading ? "Déchiffrement..." : "Accéder au contenu"}
              </Button>
            </form>

            <Alert className="mt-4">
              <Key className="w-4 h-4" />
              <AlertDescription>
                <strong>Zero-knowledge :</strong> Le déchiffrement se fait entièrement dans votre navigateur. Le serveur
                ne voit jamais votre clé de chiffrement ni le contenu déchiffré.
              </AlertDescription>
            </Alert>

            <div className="mt-6 text-center">
              <Link href="/create">
                <Button variant="outline">Créer votre propre partage sécurisé</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
