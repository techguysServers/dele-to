"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Home, Plus } from "lucide-react"
import Link from "next/link"

const notFoundMessages = [
  {
    title: "Pouf ! C'est parti.",
    description: "Comme vos liens éphémères, cette page s'est autodétruite.",
    buttonText: "Retour en sécurité →",
    emoji: "💨"
  },
  {
    title: "Ce lien a déjà brûlé.",
    description: "On vous montrerait la page, mais elle n'est plus que des cendres numériques.",
    buttonText: "Générer un nouveau",
    emoji: "🔥"
  },
  {
    title: "Effacement terminé.",
    description: "Vous avez trouvé une 404 — la page a été effacée.",
    buttonText: "Annuler ? Blague.",
    emoji: "🗑️"
  },
  {
    title: "Vue unique… déjà utilisée.",
    description: "Cette page devait être vue une seule fois, et quelqu'un vous a devancé.",
    buttonText: "Recommencer",
    emoji: "⏳"
  },
  {
    title: "Fichier détruit.",
    description: "On a vérifié trois fois. Les bits sont partis. Les octets aussi. Même les miettes.",
    buttonText: "Retour à Techguys",
    emoji: "🪓"
  },
  {
    title: "Cette page a expiré… il y a longtemps.",
    description: "On la récupérerait, mais elle est quelque part dans le grand /dev/null du ciel.",
    buttonText: "Trouver quelque chose de vivant →",
    emoji: "⌛"
  },
  {
    title: "Votre requête a été détruite en toute sécurité.",
    description: "Félicitations, vous êtes tombé sur une suppression sécurisée de niveau 404.",
    buttonText: "Réessayer",
    emoji: "🗜️"
  },
  {
    title: "Séquence d'autodestruction terminée.",
    description: "Vous l'avez manquée. C'était magnifique. Il y avait des étincelles. De la fumée.",
    buttonText: "Générer un nouveau lien",
    emoji: "💣"
  },
  {
    title: "Accès révoqué.",
    description: "Soit le lien a brûlé, soit il n'a jamais existé. On ne vous le dira jamais.",
    buttonText: "Retour à l'accueil",
    emoji: "🔒"
  },
  {
    title: "Effacé au-delà de toute récupération.",
    description: "Même la récupération forensique de données ne pourrait rien pour vous ici.",
    buttonText: "Nouveau départ",
    emoji: "🧹"
  },
  {
    title: "Il ne reste que des cendres numériques.",
    description: "Les données ? Parties. L'URL ? Partie. Votre curiosité ? Toujours là.",
    buttonText: "Retour à Techguys",
    emoji: "🌫️"
  },
  {
    title: "Mission effacée.",
    description: "La page était là. Maintenant elle est partie. Mission accomplie.",
    buttonText: "Relancer la mission",
    emoji: "🛰️"
  },
  {
    title: "Le lien est parti en fumée.",
    description: "Il était là un instant… …et parti plus vite que les promesses de votre fournisseur internet.",
    buttonText: "Base d'accueil",
    emoji: "💨"
  }
]

export default function NotFound() {
  const [currentMessage, setCurrentMessage] = useState(notFoundMessages[0])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const randomIndex = Math.floor(Math.random() * notFoundMessages.length)
    setCurrentMessage(notFoundMessages[randomIndex])
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-red-600">
                <Flame className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="text-6xl mb-4">{currentMessage.emoji}</div>
            <CardTitle className="text-2xl mb-2 text-red-900">
              404 - {currentMessage.title}
            </CardTitle>
            <CardDescription className="text-lg text-red-700">
              {currentMessage.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button 
                  size="lg" 
                  className="w-full text-white hover:opacity-90 bg-red-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {currentMessage.buttonText}
                </Button>
              </Link>
              
              <Link href="/create" className="w-full">
                <Button variant="outline" size="lg" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un nouveau partage
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-red-50 border border-red-600">
              <p className="text-sm text-red-700">
                <strong>Perdu ?</strong> Ne vous inquiétez pas, vos secrets sont toujours en sécurité.
                Cette page vient juste de s'autodétruire.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
