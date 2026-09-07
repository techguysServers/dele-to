"use client"

import { useState, useEffect } from "react"
import { Lightbulb, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const accessTips = [
    {
        title: "Vérifiez l'expéditeur",
        description: "Confirmez que ce lien provient d'une source de confiance par un canal de communication séparé avant d'y accéder."
    },
    {
        title: "Utilisez un environnement sécurisé",
        description: "Accédez aux partages sensibles depuis un appareil privé sur un réseau de confiance, pas depuis un ordinateur public ou un Wi-Fi ouvert."
    },
    {
        title: "Effacez après utilisation",
        description: "Effacez l'historique de votre navigateur et le presse-papiers après l'accès pour supprimer les traces de la clé de déchiffrement."
    },
    {
        title: "Agissez rapidement",
        description: "Accédez au contenu promptement, car il peut avoir une courte durée d'expiration ou un nombre de vues limité."
    },
    {
        title: "Ne partagez pas le lien",
        description: "Cette URL complète contient la clé de déchiffrement. Ne la transférez jamais à d'autres personnes et ne la publiez nulle part."
    },
    {
        title: "Sauvegardez en toute sécurité",
        description: "Si vous devez conserver le contenu, utilisez un gestionnaire de mots de passe sécurisé ou un stockage chiffré, pas des fichiers texte brut."
    },
    {
        title: "Méfiez-vous du hameçonnage",
        description: "Vérifiez que le domaine correspond à l'instance Techguys attendue. Des attaquants peuvent créer de fausses copies."
    },
    {
        title: "Accès unique",
        description: "De nombreux partages sont configurés en « destruction après lecture » — ils seront définitivement détruits après votre consultation."
    }
]

export function AccessTips() {
    const [currentTip, setCurrentTip] = useState<typeof accessTips[0] | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * accessTips.length)
            const randomTip = accessTips[randomIndex]
            setCurrentTip(randomTip)
            setIsVisible(true)
        }, 200)

        return () => clearTimeout(timer)
    }, [])

    const getNewTip = () => {
        const randomIndex = Math.floor(Math.random() * accessTips.length)
        const randomTip = accessTips[randomIndex]
        setCurrentTip(randomTip)
    }

    const dismissTip = () => {
        setIsVisible(false)
    }

    if (!isVisible || !currentTip) {
        return null
    }

    return (
        <Alert className="mb-6 border-red-600 bg-red-50">
            <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-red-900">💡 Conseil d'accès : {currentTip.title}</h4>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={getNewTip}
                                className="h-6 px-2 text-xs hover:opacity-80 text-red-600"
                                aria-label="Obtenir un nouveau conseil d'accès"
                            >
                                Nouveau conseil
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={dismissTip}
                                className="h-6 w-6 p-0 hover:opacity-80 text-red-600"
                                aria-label="Fermer le conseil"
                                title="Fermer le conseil"
                            >
                                <X className="h-3 w-3" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                    <AlertDescription className="text-sm mt-1 text-red-700">
                        {currentTip.description}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    )
}
