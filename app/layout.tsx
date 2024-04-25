import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Étiquette ZPL",
	description: "Générateur d'étiquette ZPL pour Brother TD-4650TNWB",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="fr">
			<body className={inter.className}>{children}</body>
		</html>
	)
}
