// Création d'un exemple d'étiquette au format ZPL
// https://github.com/DanieLeeuwner/JSZPL/tree/master?tab=readme-ov-file
export const jszpl = ({
	name,
	reference,
	article,
	type,
	details,
	quantity = 1,
	packets = 1,
}: {
	name: string
	reference: string
	article: string
	type: "AXE" | "LAMES" | "FINALE" | "COULISSES" | "COFFRE"
	details?: string
	quantity?: number
	packets?: number
}) => {
	if (!name || !reference || !article || !type) return null

	const zlp = require("jszpl")

	const DPMM = Number(process.env.NEXT_PUBLIC_DPMM ?? 8)
	const LARGEUR_MM = Number(process.env.NEXT_PUBLIC_LABEL_WIDTH ?? 102)
	const HAUTEUR_MM = Number(process.env.NEXT_PUBLIC_LABEL_HEIGHT ?? 25)
	const PADDING = 20

	const NOM = name
	const REF_COMMANDE = reference
	const REF_ARTICLE = article
	const TYPE = type
	const DETAILS = details
	const QUANTITE = quantity
	const NBR_PAQUETS = packets

	const zpl: string[] = []

	for (let NUM_PAQUET = 1; NUM_PAQUET <= NBR_PAQUETS; NUM_PAQUET++) {
		// On crée le conteneur de l'étiquette
		const label = new zlp.Label()
		label.printDensity = new zlp.PrintDensity(zlp.PrintDensityName[printDensity(DPMM)])
		label.width = LARGEUR_MM
		label.height = HAUTEUR_MM
		label.padding = new zlp.Spacing(PADDING)

		// On ajoute un QR code
		const barcode = new zlp.Barcode()
		label.content.push(barcode)
		barcode.type = new zlp.BarcodeType(zlp.BarcodeTypeName.QRCode)
		barcode.height = new zlp.Size(0.5, zlp.SizeType.Relative)
		barcode.data = `${NOM};${REF_COMMANDE};${REF_ARTICLE};${TYPE}#${NUM_PAQUET}/${NBR_PAQUETS}`.replace(
			/[^\w#;/-]/g,
			"_"
		)

		// Date
		const date = new zlp.Text()
		label.content.push(date)
		date.text = new Date().toLocaleDateString("fr-FR")
		date.verticalAlignment = new zlp.Alignment(zlp.AlignmentValue.End)
		date.characterWidth = 1 * DPMM

		// On ajoute un tableau
		const grid = new zlp.Grid()
		label.content.push(grid)
		grid.columns.push(new zlp.Size(1, zlp.SizeType.Relative))
		grid.rows.push(new zlp.Size(1, zlp.SizeType.Relative))
		grid.left = 26 * DPMM
		grid.width = 60 * DPMM
		grid.columnSpacing = 0
		grid.rowSpacing = 0
		grid.border = 1
		grid.padding = new zlp.Spacing(2 * DPMM)

		// Nom du client
		const namegrid = new zlp.Text()
		grid.content.push(namegrid)
		namegrid.text = NOM
		namegrid.characterWidth = 2 * DPMM

		// Références de commande
		const textgrid = new zlp.Text()
		grid.content.push(textgrid)
		textgrid.text += REF_COMMANDE
		textgrid.text += "\n"
		textgrid.text += REF_ARTICLE
		textgrid.top = 4 * DPMM
		textgrid.characterWidth = 1 * DPMM
		textgrid.lineSpacing = 1.5 * DPMM

		// Type et quantité
		const texttype = new zlp.Text()
		grid.content.push(texttype)
		texttype.text = `${QUANTITE}/${TYPE}`
		texttype.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)
		texttype.verticalAlignment = new zlp.Alignment(zlp.AlignmentValue.End)
		texttype.characterWidth = 2 * DPMM

		// Détails
		if (DETAILS !== undefined) {
			const textdetails = new zlp.Text()
			grid.content.push(textdetails)
			textdetails.text = DETAILS
			textdetails.top = 10 * DPMM
			textdetails.characterWidth = 1 * DPMM
		}
		// Quantité de paquets
		const textpaquet = new zlp.Text()
		grid.content.push(textpaquet)
		textpaquet.text = `${NUM_PAQUET}/${NBR_PAQUETS}`
		textpaquet.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)
		textpaquet.horizontalAlignment = new zlp.Alignment(zlp.AlignmentValue.End)
		textpaquet.verticalAlignment = new zlp.Alignment(zlp.AlignmentValue.End)
		textpaquet.characterWidth = 2 * DPMM

		// Indication "Paquets :"
		const texth2 = new zlp.Text()
		grid.content.push(texth2)
		texth2.text = txtPluriel("PAQUET", NBR_PAQUETS)
		texth2.top = 10 * DPMM
		texth2.horizontalAlignment = new zlp.Alignment(zlp.AlignmentValue.End)
		texth2.characterWidth = 1 * DPMM

		// Flèche
		if (TYPE === "AXE") {
			const fleche_left = 92 * DPMM + PADDING
			const fleche_top = 1 * DPMM + PADDING
			const fleche_largeur = 8 * DPMM
			const fleche_hauteur = 18 * DPMM
			const fleche_epaisseur = 2 * DPMM

			const raw = new zlp.Raw()
			label.content.push(raw)
			raw.data = `^FO${fleche_left},${fleche_top}^GB${fleche_epaisseur},${fleche_hauteur},${fleche_epaisseur}^FS`
			raw.data += "\n"
			raw.data += `^FO${fleche_left - fleche_largeur / 2},${fleche_top}^GD${fleche_largeur / 2},${
				fleche_hauteur / 2
			},${fleche_epaisseur}^FS`
			raw.data += "\n"
			raw.data += `^FO${fleche_left},${fleche_top}^GD${fleche_largeur / 2},${
				fleche_hauteur / 2
			},${fleche_epaisseur},B,L^FS`
		}

		// On génère le ZPL
		zpl.push(String(label.generateZPL()))
	}

	return zpl.join("\n")
}

const printDensity = (wanted_dpmm: number) => {
	const values = [6, 8, 12, 24]
	const dpmm = values.find((v) => v >= wanted_dpmm) ?? 24
	return `${dpmm}dpmm`
}

const txtPluriel = (txt: string, nbr: number, maj: boolean = true) => (nbr > 1 ? `${txt}${maj ? "S" : "s"}` : txt)
