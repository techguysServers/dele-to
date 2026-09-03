import Link from 'next/link'

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Techguys</h3>
                        <p className="text-sm text-muted-foreground">
                            Partage de secrets sécurisé avec chiffrement zero-knowledge.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/create" className="hover:text-foreground transition-colors">
                                    Create Share
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-foreground transition-colors">
                                    How It Works
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium">Alternatives</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/alternatives" className="hover:text-foreground transition-colors">
                                    All Alternatives
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Techguys. Partage de secrets sécurisé.</p>
                </div>
            </div>
        </footer>
    )
}
