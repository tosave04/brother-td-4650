"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const DPMM = 8

export default function Home() {
	const [label, setLabel] = useState<string>()
	const [blob, setBlob] = useState<string>()
	const [base64Data, setBase64Data] = useState<string>()

	// On récupère le labe au format ZPL
	useEffect(() => {
		const getLabel = async () => {
			const label = jszpl()
			setLabel(label)
		}
		getLabel()
	}, [])

	// On envoie le label au service Labelary pour obtenir l'image
	useEffect(() => {
		if (!label) return setBlob(undefined)

		const getBlob = async () => {
			const data = await labelary({ zpl: label })
			setBase64Data(data?.base64Data && `data:image/png;base64,${data?.base64Data}`)
			setBlob(data?.blob && URL.createObjectURL(data?.blob))
		}
		getBlob()
	}, [label])

	const handleOnPrint = async () => printZpl({ zpl: label })

	return (
		<main className="container mx-auto min-h-screen bg-white p-16">
			<h1 className="text-2xl font-bold text-neutral-700 text-center mb-8">
				Alpes Profilage
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

// On génère le ZPL
// https://github.com/DanieLeeuwner/JSZPL/tree/master?tab=readme-ov-file
const jszpl = () => {
	const zlp = require("jszpl")

	const NOM = "NOM_DU_CLIENT"
	const REF = "REF_COMMANDE"

	const label = new zlp.Label()
	label.printDensity = new zlp.PrintDensity(zlp.PrintDensityName["8dpmm"])
	label.width = 102
	label.height = 25
	label.padding = new zlp.Spacing(20)

	const barcode = new zlp.Barcode()
	label.content.push(barcode)
	barcode.type = new zlp.BarcodeType(zlp.BarcodeTypeName.QRCode)
	barcode.height = new zlp.Size(0.5, zlp.SizeType.Relative)
	barcode.data = `${NOM};${REF}`

	const grid = new zlp.Grid()
	label.content.push(grid)
	grid.columns.push(new zlp.Size(1, zlp.SizeType.Relative))
	grid.rows.push(new zlp.Size(1, zlp.SizeType.Relative))
	grid.rows.push(new zlp.Size(1, zlp.SizeType.Relative))
	grid.left = 26 * DPMM
	grid.width = 70 * DPMM
	grid.columnSpacing = 0
	grid.rowSpacing = 0
	grid.border = 1
	grid.padding = new zlp.Spacing(2 * DPMM)

	const text00 = new zlp.Text()
	grid.content.push(text00)
	text00.text = NOM
	text00.text += "\n"
	text00.text += REF
	text00.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)

	const text10 = new zlp.Text()
	grid.content.push(text10)
	text10.text = "(1, 0)"
	text10.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)
	text10.grid.column = 1

	const text01 = new zlp.Text()
	grid.content.push(text01)
	text01.text = "(0, 1)"
	text01.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)
	text01.grid.row = 1

	const zpl = label.generateZPL()

	return String(zpl)
}

// On envoie le ZPL au service API Labelary pour obtenir l'image
// https://labelary.com/service.html
const labelary = async ({ zpl }: { zpl: string }) => {
	const url = `http://api.labelary.com/v1/printers/${DPMM}dpmm/labels/4x1/0/`

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: zpl,
	}

	return fetch(url, options)
		.then(async (res) => {
			const blob = await res.blob()

			const data = await new Response(blob).arrayBuffer()
			const base64Data = btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ""))

			return { blob, base64Data }
		})
		.catch((err) => {
			console.error("Erreur lors de l'envoi de la requête:", err)
			return undefined
		})
}

// On envoie le ZPL à l'imprimante
const printZpl = async ({ zpl }: { zpl?: string | undefined }) => {
	if (!zpl) return console.error("ZPL is undefined")

	const url = "http://192.168.1.60:8000/impression"

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "text/plain",
		},
		body: zpl,
	}

	const ok = await fetch(url, options).then((res) => res.ok)

	if (ok) alert("Impression envoyée avec succès")
	else console.error("Erreur lors de l'impression")
}
