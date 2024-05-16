# Impression ZPL sur imprimante CUPS (ex: Brother TD-4650)

Environnement de test pour la création d'étiquettes pour imprimante ZPL.

- Création de l'étiquette au format ZPL à l'aide de la bibliothèque JSZPL de DanieLeeuwner

- Création d'un aperçu grace à l'API labelary (blob)

- Conversion en base64Data

- Affichage aperçu de l'étiquette, code ZPL et base64Data

- Script Python Flask pour gérer une API d'impression ZPL sur un serveur CUPS

- Bouton `Imprimer` pour envoyer le ZPL à l'API d'impression Flask

## Remerciements

DanieLeeuwner pour son générateur ZPL II JavaScript

https://github.com/DanieLeeuwner/JSZPL

## Installation imprimante en mode RAW (pour recevoir du ZPL)

Interface CUPS (ex: `https://hostname:631`) > Administration

Ajouter une imprimante

Autres imprimantes réseau > AppSocket/HP JetDirect > Continuer

`socket://hostname:9100` > Continuer

Nom d'imprimante facilement utilisable dans les scripts (ex: `brother-zpl`) > Continuer

Marque > Raw > Continuer

Modèle > Raw Queue (en) > Ajouter une imprimante

Redémarrer le serveur

## Envoyer une instruction ZPL à l'imprimante (Debian)

Avec un fichier .zpl contenant les instructions

```bash
lp -d NOM_IMPRIMANTE instruction.zpl
```

En ligne de code

```bash
zpl = str("DU CODE ZPL RAW")
echo "{zpl}" | lp -d "{imprimante}"
```

## Test de l'API Flask

Configurer l'imprimante dans le script python > print.py

Transférer le script sur le serveur qui gère l'imprimante (CUPS)

Démarrer le script `python print.py`

Configurer `.env.local`

Tester le bouton `Imprimer` de l'application

## Mise en production de l'API Flask

On utilise le serveur HTTP Python WSGI `Gunicorn` pour gérer notre script Flask en production.

Le dossier python contient un exemple de script API pour gérer l'impression ZPL :

- `print.py` : Script Flask API qui reçoit le signal ZPL, essaie de l'imprimer et gère les erreurs en retour

- `gunicorn_config.py` : Fichier de configuration basique pour lancer un serveur Gunicorn

- `gunicorn_zpl.service` : Exemple de fichier service systemd pour démarrer automatiquement Gunicorn

### Installation de Gunicorn (sur Raspberry Pi) :

```bash
sudo apt-get install gunicorn
```

Pour tester le serveur, dans le dossier du script `print.py`

### Utilisation en ligne de commande

```bash
gunicorn -w 1 -b 0.0.0.0:8000 print:app
```

- `-w` Nombre de workers (processus) à utiliser

- `-b` Adresse et port sur lesquels Gunicorn écoutera les connexions

- `print` Le nom du fichier contenant le script

- `app` L'instance de Flask dans le script

### Utilisation avec un fichier de configuration

```bash
gunicorn_config.py
bind="0.0.0.0:8000"
workers=1
```

`gunicorn -c gunicorn_config.py print:app`

## Démarrage automatique de Gunicorn

### Création du service

`sudo nano /etc/systemd/system/gunicorn_zpl.service`

```bash
[Unit]
Description=Gunicorn instance to serve Flask ZPL print application 
After=network.target

[Service]
WorkingDirectory=/home/chemin/vers/app/flask
ExecStart=/home/chemin/vers/script/flask/gunicorn -c gunicorn_config.py print:app

[Install]
WantedBy=multi-user.target
```

```bash
# On recharge la configuration du gestionnaire systemctl
sudo systemctl daemon-reload

# On démarre et on active notre nouveau service
sudo systemctl start myapp
sudo systemctl enable myapp
```

### Modification du service

`sudo nano /etc/systemd/system/gunicorn_zpl.service`

Après modification il faut recharger le gestionnaire et le service

```bash
sudo systemctl daemon-reload
sudo systemctl restart myapp
```

## Next.js

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
