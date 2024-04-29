// On envoie le ZPL au service API Labelary pour obtenir l'image
// https://labelary.com/service.html
export const labelary = async ({
	zpl,
	dpmm = 8,
	width_inch = 4,
	height_inch = 1,
}: {
	zpl: string | undefined
	dpmm?: number
	width_inch?: number
	height_inch?: number
}) => {
	const url = `http://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${width_inch}x${height_inch}/0/`

	if (!zpl) return console.error("ZPL code is undefined")

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
