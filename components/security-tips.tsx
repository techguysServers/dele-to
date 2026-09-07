"use client"

import { useState, useEffect } from "react"
import { Lightbulb, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const securityTips = [
  {
    title: "Compartimentez vos données",
    description: "Envoyez les noms d'utilisateur, mots de passe et adresses de serveur dans des partages séparés pour limiter l'exposition en cas de compromission."
  },
  {
    title: "Échelonnez vos envois",
    description: "Partagez les identifiants en plusieurs étapes — nom d'utilisateur d'abord, puis mot de passe, puis détails du serveur avec des délais d'expiration différents."
  },
  {
    title: "Utilisez une distribution en couches",
    description: "Envoyez le lien sécurisé par un canal (courriel) et prévenez le destinataire par un autre (SMS ou Slack)."
  },
  {
    title: "Isolez dans le temps",
    description: "Définissez une expiration courte pour les mots de passe (15 minutes) et plus longue pour les informations moins sensibles comme les noms d'utilisateur."
  },
  {
    title: "Vérifiez avant de partager",
    description: "Confirmez l'identité du destinataire par un canal de communication séparé avant d'envoyer tout lien sécurisé."
  },
  {
    title: "Activez la destruction après lecture",
    description: "Définissez le nombre de vues à 1 pour les données très sensibles afin d'assurer la destruction automatique après le premier accès."
  },
  {
    title: "Ajoutez une barrière par mot de passe",
    description: "Activez la protection par mot de passe pour les identifiants critiques, créant une couche d'authentification supplémentaire."
  },
  {
    title: "Minimisez la densité d'information",
    description: "Ne partagez que l'essentiel. Divisez les identifiants complexes en composants plus petits et isolés sur plusieurs partages."
  },
  {
    title: "Utilisez des titres contextuels",
    description: "Ajoutez des titres descriptifs comme « Nom d'utilisateur BD - Prod » ou « Clé API - Staging » pour aider les destinataires à identifier le contenu en toute sécurité."
  },
  {
    title: "Coordonnez les fenêtres d'accès",
    description: "Informez les destinataires lorsque vous avez partagé quelque chose afin qu'ils puissent y accéder rapidement avant l'expiration."
  },
  {
    title: "Évitez l'exposition réseau",
    description: "Créez et accédez aux partages sécurisés depuis des réseaux de confiance, jamais depuis un Wi-Fi public ou un ordinateur partagé."
  },
  {
    title: "Effacez les traces numériques",
    description: "L'URL complète du partage contient la clé de déchiffrement. Effacez-la de l'historique du navigateur et du presse-papiers après utilisation."
  },
  {
    title: "Séparez les facteurs d'authentification",
    description: "Pour les configurations multi-facteurs, partagez les mots de passe et les codes de secours 2FA dans des partages complètement séparés et décalés dans le temps."
  },
  {
    title: "Utilisez la divulgation progressive",
    description: "Partagez d'abord les informations d'accès générales, puis les identifiants spécifiques seulement après avoir confirmé que le destinataire a reçu la première partie."
  }
]

export function SecurityTips() {
  const [currentTip, setCurrentTip] = useState<typeof securityTips[0] | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * securityTips.length)
      const randomTip = securityTips[randomIndex]
      setCurrentTip(randomTip)
      setIsVisible(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  const getNewTip = () => {
    const randomTip = securityTips[Math.floor(Math.random() * securityTips.length)]
    setCurrentTip(randomTip)
  }

  const dismissTip = () => {
    setIsVisible(false)
  }

  if (!isVisible || !currentTip) {
    return null
  }

  return (
    <Alert className="mb-4 border-border bg-muted/50 py-3">
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-xs text-foreground">Conseil de sécurité : {currentTip.title}</h4>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={getNewTip}
                className="h-5 px-1 text-xs"
              >
                Nouveau conseil
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={dismissTip}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <AlertDescription className="text-xs mt-0.5 text-muted-foreground leading-tight">
            {currentTip.description}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
