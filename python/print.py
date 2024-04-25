from flask import Flask, request, jsonify
import subprocess
import tkinter as tk

app = Flask(__name__)

imprimante = 'Brother-TD-4650TNWB'

@app.route('/impression', methods=['POST'])
def pingpost():
    # On récupère la data de la requête POST
    zpl = request.get_data().decode()

    # Si zpl n'est pas de type texte, on retourne une erreur 400
    if not isinstance(zpl, str):
        response = jsonify({'erreur': 'Le corps de la requête doit être du texte'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 400
        return response

    # Si la requête POST est vide, on retourne une erreur 400
    if zpl == '':
        response = jsonify({'erreur': 'Le corps de la requête est vide'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 400
        return response
    
    # Si c'est ok on exécute la commande pour imprimer le ZPL
    commande = f'echo "{zpl}" | lp -d "{imprimante}"'

    try:
        subprocess.run(commande, shell=True, check=True)

        response = jsonify({'message': 'Impression réussie'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 200
        return response
    
    # Si une erreur est levée, on retourne une erreur 500
    except subprocess.CalledProcessError as e:
        response = jsonify({'erreur': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.status_code = 500
        return response

if __name__ == '__main__':
    # Exécuter l'application Flask pour écouter sur toutes les interfaces réseau sur le port 8000
    app.run(host='0.0.0.0', port=8000, debug=True)
