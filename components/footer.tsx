import Link from 'next/link'
import { Logo } from '@/components/logo'

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <Logo href="/" />
                    <nav className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">
                            Créer un partage
                        </Link>
                        <Link href="/about" className="hover:text-foreground transition-colors">
                            Comment ça marche
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    )
}
