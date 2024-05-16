// Création d'un exemple d'étiquette au format ZPL
// https://github.com/DanieLeeuwner/JSZPL/tree/master?tab=readme-ov-file
export const jszpl = () => {
	const zlp = require("jszpl")

	const DPMM = Number(process.env.NEXT_PUBLIC_DPMM ?? 8)
	const LARGEUR_MM = Number(process.env.NEXT_PUBLIC_LABEL_WIDTH ?? 102)
	const HAUTEUR_MM = Number(process.env.NEXT_PUBLIC_LABEL_HEIGHT ?? 25)

	const NOM = "NOM_DU_CLIENT"
	const REF_COMMANDE = "REF_COMMANDE"
	const REF_ARTICLE = "REF_ARTICLE"
	const TYPE = "COULISSES"
	const DETAILS = "2500 MM - PLAQUE 300"
	const QUANTITE = 2
	const NBR_PAQUETS = 2

	const zpl: string[] = []

	for (let NUM_PAQUET = 1; NUM_PAQUET <= NBR_PAQUETS; NUM_PAQUET++) {
		// On crée le conteneur de l'étiquette
		const label = new zlp.Label()
		label.printDensity = new zlp.PrintDensity(zlp.PrintDensityName[printDensity(DPMM)])
		label.width = LARGEUR_MM
		label.height = HAUTEUR_MM
		label.padding = new zlp.Spacing(20)

		// On ajoute un QR code
		const barcode = new zlp.Barcode()
		label.content.push(barcode)
		barcode.type = new zlp.BarcodeType(zlp.BarcodeTypeName.QRCode)
		barcode.height = new zlp.Size(0.5, zlp.SizeType.Relative)
		barcode.data = `${NOM};${REF_COMMANDE};${REF_ARTICLE};${TYPE}#${NUM_PAQUET}/${NBR_PAQUETS}`

		// On ajoute un tableau
		const grid = new zlp.Grid()
		label.content.push(grid)
		grid.columns.push(new zlp.Size(1, zlp.SizeType.Relative))
		grid.rows.push(new zlp.Size(1, zlp.SizeType.Relative))
		// grid.rows.push(new zlp.Size(1, zlp.SizeType.Relative))
		grid.left = 26 * DPMM
		grid.width = 70 * DPMM
		grid.columnSpacing = 0
		grid.rowSpacing = 0
		grid.border = 1
		grid.padding = new zlp.Spacing(2 * DPMM)

		// Texte du tableau
		const textgrid = new zlp.Text()
		grid.content.push(textgrid)
		textgrid.text = NOM
		textgrid.text += "\n"
		textgrid.text += `${REF_COMMANDE} - ${REF_ARTICLE}`
		textgrid.text += "\n"
		textgrid.text += `${TYPE} : ${DETAILS}`
		textgrid.text += "\n"
		textgrid.text += `${QUANTITE} ${txtPluriel("UNITE", QUANTITE)} (${NBR_PAQUETS} ${txtPluriel(
			"PAQUET",
			NBR_PAQUETS
		)})`
		textgrid.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)
		textgrid.lineSpacing = 2 * DPMM

		// On ajoute la quantité de paquets en bas à droite de l'étiquette
		const textpaquet = new zlp.Text()
		grid.content.push(textpaquet)
		textpaquet.text = `${NUM_PAQUET}/${NBR_PAQUETS}`
		textpaquet.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)
		textpaquet.horizontalAlignment = new zlp.Alignment(zlp.AlignmentValue.End)
		textpaquet.verticalAlignment = new zlp.Alignment(zlp.AlignmentValue.End)
		textpaquet.characterWidth = 2 * DPMM

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
