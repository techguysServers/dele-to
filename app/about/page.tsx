import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, Server, Key, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Architecture de sécurité zero-knowledge</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprendre la sécurité avancée et le chiffrement derrière Techguys
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <Lock className="w-8 h-8 mb-2 text-orange-600 dark:text-orange-400" />
                <CardTitle>AES-256-GCM côté client</CardTitle>
                <CardDescription>Un chiffrement de niveau militaire entièrement dans votre navigateur</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Nous utilisons l'API Web Crypto pour générer des clés de chiffrement AES-256-GCM et chiffrer vos
                  données localement. La clé de chiffrement ne quitte jamais votre appareil et est intégrée dans le
                  fragment d'URL.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Key className="w-8 h-8 mb-2 text-orange-600 dark:text-orange-400" />
                <CardTitle>Clés stockées dans le fragment d'URL</CardTitle>
                <CardDescription>Les clés de chiffrement ne sont jamais envoyées à nos serveurs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  La clé de déchiffrement est stockée dans le fragment d'URL (après #), qui n'est jamais transmis aux
                  serveurs. Cela garantit une véritable architecture zero-knowledge où nous ne pouvons pas accéder à vos
                  données.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Server className="w-8 h-8 mb-2 text-orange-600 dark:text-orange-400" />
                <CardTitle>Stockage Firestore avec expiration</CardTitle>
                <CardDescription>Données chiffrées stockées avec expiration automatique</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Seules les données chiffrées sont stockées dans Firestore avec expiration automatique. Aucune clé de
                  chiffrement, métadonnée ou donnée en clair n'est jamais stockée sur nos serveurs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="w-8 h-8 mb-2 text-orange-600 dark:text-orange-400" />
                <CardTitle>Autodestruction basée sur les vues</CardTitle>
                <CardDescription>Suppression automatique après le nombre maximum de vues</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Définissez des limites de vues de 1 à 10. Une fois le nombre maximum de vues atteint, les données
                  chiffrées sont immédiatement supprimées sans possibilité de récupération.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Détails techniques de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Chiffrement AES-256-GCM</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Nous utilisons AES-256-GCM (mode Galois/Counter) qui fournit à la fois le chiffrement et
                  l'authentification. Chaque chiffrement utilise un vecteur d'initialisation (IV) unique de 96 bits pour
                  une sécurité maximale.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">API Web Crypto</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Toutes les opérations cryptographiques utilisent l'API Web Crypto native du navigateur, qui fournit
                  une génération de nombres aléatoires et un chiffrement sécurisés, accélérés par le matériel.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Zéro accès aux clés côté serveur</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Les clés de chiffrement sont générées côté client et intégrées dans les fragments d'URL. Comme les
                  fragments ne sont jamais envoyés aux serveurs, nous n'avons aucun accès aux clés de déchiffrement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Expiration automatique</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Firestore supprime automatiquement les données chiffrées à l'expiration. Aucun nettoyage ou
                  maintenance manuelle n'est requis.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Schéma du flux de sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#D2461E' }}>
                      1
                    </div>
                    <div className="flex-1">
                      <strong>Le client génère une clé AES-256</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300">L'API Web Crypto génère une clé cryptographiquement sécurisée</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#D2461E' }}>
                      2
                    </div>
                    <div className="flex-1">
                      <strong>Données chiffrées côté client</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Chiffrement AES-256-GCM avec un IV unique</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#D2461E' }}>
                      3
                    </div>
                    <div className="flex-1">
                      <strong>Données chiffrées envoyées à Firestore</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Seuls le texte chiffré et l'IV sont stockés, jamais la clé</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#D2461E' }}>
                      4
                    </div>
                    <div className="flex-1">
                      <strong>Clé intégrée dans le fragment d'URL</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Le fragment (#) n'est jamais envoyé au serveur</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#D2461E' }}>
                      5
                    </div>
                    <div className="flex-1">
                      <strong>Déchiffrement côté client</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Le navigateur du destinataire déchiffre à l'aide de la clé de l'URL</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bonnes pratiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Utilisez toujours HTTPS</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Partagez toujours les liens via HTTPS pour éviter les attaques de type man-in-the-middle sur les
                  données chiffrées.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Durées d'expiration courtes</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Utilisez la durée d'expiration la plus courte raisonnable pour minimiser la fenêtre d'exposition.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Liens à usage unique</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Définissez le nombre de vues à 1 pour une sécurité maximale, surtout pour les identifiants très
                  sensibles.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Partagez les URL complètes</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Assurez-vous que l'URL complète incluant le fragment (#) est partagée — sans lui, le déchiffrement
                  est impossible.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <Link href="/create">
              <Button size="lg" style={{ backgroundColor: '#D2461E' }} className="hover:opacity-90 text-white">
                Commencer à partager en sécurité
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
