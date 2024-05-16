"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { jszpl } from "./jszpl.sample"
import { labelary } from "./utils/labelary"
import { printZpl } from "./utils/printZpl"

const TITRE = process.env.NEXT_PUBLIC_SOCIETE ?? "Test impression ZPL"
const PRINT_API_URL = String(process.env.NEXT_PUBLIC_PRINT_API_URL)
const PRINTER_NAME = String(process.env.NEXT_PUBLIC_PRINTER_NAME)
const PRINTER_IP = String(process.env.NEXT_PUBLIC_PRINTER_IP)
const DPMM = Number(process.env.NEXT_PUBLIC_DPMM ?? 8)
const LARGEUR_INCH = Number(process.env.NEXT_PUBLIC_LABEL_WIDTH ?? 102) / 25.4
const HAUTEUR_INCH = Number(process.env.NEXT_PUBLIC_LABEL_HEIGHT ?? 25) / 25.4

export default function Home() {
	const [label, setLabel] = useState<string>()
	const [blob, setBlob] = useState<string>()
	const [base64Data, setBase64Data] = useState<string>()

	// On récupère le label au format ZPL
	useEffect(() => {
		const getLabel = async () => {
			const label = jszpl({
				name: "NOM_CLIENT",
				reference: "REF_COMMANDE",
				article: "REF_ARTICLE",
				type: "AXE",
				details: "2500 MM - INTERIEUR",
				quantity: 1,
				packets: 1,
			})
			if (label !== null) setLabel(label)
		}
		getLabel()
	}, [])

	// On envoie le label au service Labelary pour obtenir l'image
	useEffect(() => {
		if (!label) return setBlob(undefined)

		const getBlob = async () => {
			const data = await labelary({ zpl: label, width_inch: LARGEUR_INCH, height_inch: HAUTEUR_INCH, dpmm: DPMM })
			setBase64Data(data?.base64Data && `data:image/png;base64,${data?.base64Data}`)
			setBlob(data?.blob && URL.createObjectURL(data?.blob))
		}
		getBlob()
	}, [label])

	const handleOnPrint = async () =>
		printZpl({ url: PRINT_API_URL, zpl: label, printer_name: PRINTER_NAME, printer_ip: PRINTER_IP })

	return (
		<main className="container mx-auto min-h-screen bg-white p-16">
			<h1 className="text-2xl font-bold text-neutral-700 text-center mb-8">
				{TITRE}
				<br />
				Création d&apos;étiquette pour Brother TD-4650
			</h1>

			<section className="grid grid-cols-4 gap-8">
				<div className="flex flex-col items-center gap-8 col-span-full border-y py-8">
					{blob && (
						<Image className="w-96 border border-neutral-500" src={blob} width={800} height={800} alt="Étiquette" />
					)}

					<button
						className="px-4 py-2 border rounded bg-white hover:bg-neutral-100 transition-colors duration-200"
						onClick={handleOnPrint}
					>
						Imprimer
					</button>
				</div>
				{/* <img src={`data:image/png;base64,${base64Data}`} alt="logo"></img> */}

				<div>
					<h2 className="text-lg font-bold text-neutral-700 mb-4">Code ZPL</h2>
					<pre className="whitespace-normal break-words">{label}</pre>
				</div>

				{/* On affiche le contenu du Blob */}
				<div className="col-span-3">
					<h2 className="text-lg font-bold text-neutral-700 mb-4">Données en base 64</h2>
					<pre className="whitespace-normal break-words">{base64Data}</pre>
				</div>
			</section>
		</main>
	)
}
