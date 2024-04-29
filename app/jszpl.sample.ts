// Création d'un exemple d'étiquette au format ZPL
// https://github.com/DanieLeeuwner/JSZPL/tree/master?tab=readme-ov-file
export const jszpl = () => {
	const zlp = require("jszpl")

	const DPMM = Number(process.env.NEXT_PUBLIC_DPMM ?? 8)
	const LARGEUR_MM = Number(process.env.NEXT_PUBLIC_LABEL_WIDTH ?? 102)
	const HAUTEUR_MM = Number(process.env.NEXT_PUBLIC_LABEL_HEIGHT ?? 25)

	const NOM = "NOM_DU_CLIENT"
	const REF = "REF_COMMANDE"

    // On crée le conteneur de l'étiquette
	const label = new zlp.Label()
	label.printDensity = new zlp.PrintDensity(zlp.PrintDensityName["8dpmm"])
	label.width = LARGEUR_MM
	label.height = HAUTEUR_MM
	label.padding = new zlp.Spacing(20)

    // On ajoute un QR code
	const barcode = new zlp.Barcode()
	label.content.push(barcode)
	barcode.type = new zlp.BarcodeType(zlp.BarcodeTypeName.QRCode)
	barcode.height = new zlp.Size(0.5, zlp.SizeType.Relative)
	barcode.data = `${NOM};${REF}`

    // On ajoute un tableau
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

    // On ajoute un texte en haut du tableau
	const text00 = new zlp.Text()
	grid.content.push(text00)
	text00.text = NOM
	text00.text += "\n"
	text00.text += REF
	text00.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)

    // On ajoute un texte en bas du tableau
	const text01 = new zlp.Text()
	grid.content.push(text01)
	text01.text = "(0, 1)" // Colonne 0, ligne 1
	text01.fontFamily = new zlp.FontFamily(zlp.FontFamilyName.D)
	text01.grid.row = 1

    // On génère le ZPL
	const zpl = label.generateZPL()

	return String(zpl)
}
