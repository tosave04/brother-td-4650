from flask import Flask, request, jsonify # type: ignore
import json
import subprocess

app = Flask(__name__)

# Port d'exécution du serveur
PORT = 8000

@app.route('/impression', methods=['POST'])
def print():
    # On récupère la data de la requête POST
    try:
        raw_data = request.get_data().decode()
        json_data = json.loads(raw_data)

        # On vérifie si les paramètres printer_name, printer_ip et zpl sont définis
        if 'printer_name' not in json_data or 'printer_ip' not in json_data or 'zpl' not in json_data:
            raise ValueError(f"Les paramètres printer_name, printer_ip et zpl sont obligatoires")

        printer_name = json_data['printer_name']
        printer_ip = json_data['printer_ip']
        zpl = json_data['zpl']

        # Si zpl n'est pas de type texte
        if not isinstance(zpl, str):
            raise ValueError(f"Le corps de la requête doit être du texte")

        # Si le zpl est vide
        if zpl == '':
            raise ValueError(f"Le corps de la requête est vide")
        
    except ValueError as e:
        response = jsonify({'erreur': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 400
        return response

    # On fait un ping sur l'imprimante pour vérifier si elle est accessible
    try:
        ping = subprocess.run(['ping', '-c', '1', printer_ip], capture_output=True, text=True, timeout=5)

        # Si le ping échoue (404)
        if ping.returncode != 0:
            raise ValueError(f"L'imprimante à l'adresse IP {printer_ip} ne répond pas.")
        
    except (ValueError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        response = jsonify({'erreur': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 404
        return response

    # On exécute la commande pour imprimer le ZPL
    try:
        print_zpl_cmd = f'echo "{zpl}" | lp -d "{printer_name}"'
        subprocess.run(print_zpl_cmd, shell=True, check=True)

        response = jsonify({'message': f"Impression réussie"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 200
        return response

    except Exception as e:
        response = jsonify({'erreur': f"Erreur lors de l'impression du ZPL"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 500
        return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)
