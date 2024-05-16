// On envoie le ZPL à l'imprimante
export const printZpl = async (params: {
	zpl: string | undefined
	url: string | undefined
	printer_name: string | undefined
	printer_ip: string | undefined
}) => {
	try {
		const { url, ...others } = params

		if (!url) throw new Error("Server URL is undefined")
		if (!others?.zpl) throw new Error("ZPL code is undefined")
		if (!others?.printer_name) throw new Error("Printer name is undefined")
		if (!others?.printer_ip) throw new Error("Printer IP is undefined")

		const print_url = `${url}/impression`

		const options = {
			method: "POST",
			headers: {
				"Content-Type": "text/plain",
			},
			body: JSON.stringify(others),
		}

		// // Requête GET pour l'impression si < 2000 caractères, sinon POST
		// const print_url_get = `${url}/impression?` + new URLSearchParams(others as Record<string, string>).toString()
		// const response = print_url_get.length <= 2000 ? await fetch(print_url_get) : await fetch(print_url, options)

		const response = await fetch(print_url, options)

		const ok = response.ok

		if (!ok) throw new Error(await response.json().then((data) => data?.erreur ?? "Erreur inconnue"))

		alert("Impression envoyée avec succès")
	} catch (e) {
		const error = e instanceof Error ? e.message : "Erreur lors de l'envoi de la requête"
		console.error(error)
		alert("Erreur : " + error)
	}
}
