import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '../globals.css'

export const metadata: Metadata = {
    title: 'Techguys - Partage de secrets',
    description: 'Secure credential sharing with client-side AES-256 encryption - Farcaster MiniApp',
    robots: {
        index: false,
        follow: false,
    },
    icons: {
        icon: '/favicon.png',
    },
}

export default function MiniAppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <head />
            <body className={`${GeistSans.className}`}>
                {children}
            </body>
        </html>
    )
}