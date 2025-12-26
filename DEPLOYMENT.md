# 🚀 Guide de Déploiement G3 Edu

## Architecture

- **Backend**: Django REST API → **PythonAnywhere** (avec MySQL)
- **Frontend**: Next.js → **Vercel**

---

## 📦 1. Préparation du Code

Le code est déjà configuré. Les fichiers importants :
- `requirements.txt` - Dépendances Python
- `eduplatform/settings.py` - Configuration production-ready

---

## 🖥️ 2. Déploiement Backend sur PythonAnywhere

### Étape 1: Créer un compte PythonAnywhere
1. Allez sur [pythonanywhere.com](https://www.pythonanywhere.com)
2. Créez un compte gratuit (Beginner)
3. Votre nom d'utilisateur sera dans l'URL: `username.pythonanywhere.com`

### Étape 2: Cloner le projet
1. Allez dans **Consoles** → **Bash**
2. Exécutez :
```bash
git clone https://github.com/el-houfi-achraf/G3-Edu.git
cd G3-Edu
```

### Étape 3: Créer un environnement virtuel
```bash
mkvirtualenv --python=/usr/bin/python3.10 g3edu-venv
pip install -r requirements.txt
pip install mysqlclient
```

### Étape 4: Créer la base de données MySQL
1. Allez dans l'onglet **Databases**
2. Initialisez MySQL avec un mot de passe
3. Créez une base de données: `votre_username$g3edu`
4. Notez les informations :
   - Host: `votre_username.mysql.pythonanywhere-services.com`
   - Username: `votre_username`
   - Database: `votre_username$g3edu`

### Étape 5: Configurer le fichier .env
Dans le dossier G3-Edu, créez un fichier `.env`:
```bash
cd ~/G3-Edu
nano .env
```

Contenu du fichier .env:
```
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire
DEBUG=False
ALLOWED_HOSTS=votre_username.pythonanywhere.com,localhost
FRONTEND_URL=https://votre-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://votre_username.pythonanywhere.com,https://votre-app.vercel.app

# MySQL Database
DATABASE_URL=mysql://votre_username:votre_mot_de_passe@votre_username.mysql.pythonanywhere-services.com/votre_username$g3edu
```

### Étape 6: Migrer la base de données
```bash
cd ~/G3-Edu
workon g3edu-venv
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### Étape 7: Configurer l'application Web
1. Allez dans l'onglet **Web**
2. Cliquez **Add a new web app**
3. Choisissez **Manual configuration** → **Python 3.10**
4. Configurez :

**Virtualenv:**
```
/home/votre_username/.virtualenvs/g3edu-venv
```

**Source code:**
```
/home/votre_username/G3-Edu
```

**WSGI configuration file:**
Cliquez sur le lien du fichier WSGI et **remplacez tout le contenu** par :

```python
import os
import sys

# Ajouter le projet au path
path = '/home/VOTRE_USERNAME/G3-Edu'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'eduplatform.settings'

# Charger les variables d'environnement
from dotenv import load_dotenv
project_folder = os.path.expanduser('~/G3-Edu')
load_dotenv(os.path.join(project_folder, '.env'))

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### Étape 8: Configurer les fichiers statiques
Dans l'onglet **Web**, section **Static files**:

| URL | Directory |
|-----|-----------|
| `/static/` | `/home/votre_username/G3-Edu/staticfiles` |

### Étape 9: Installer python-dotenv
```bash
workon g3edu-venv
pip install python-dotenv
```

### Étape 10: Recharger l'application
Cliquez sur le bouton vert **Reload** dans l'onglet Web.

---

## 🌐 3. Déploiement Frontend sur Vercel

### Étape 1: Importer le projet
1. Allez sur [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. Sélectionnez le repo `G3-Edu`
4. **Root Directory**: `frontend`

### Étape 2: Variables d'environnement
| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://votre_username.pythonanywhere.com` |

### Étape 3: Déployer
Cliquez **Deploy**.

---

## 🔗 4. Configuration Post-Déploiement

### Mettre à jour CORS
Une fois l'URL Vercel connue, mettez à jour le fichier `.env` sur PythonAnywhere:
- `FRONTEND_URL` = URL Vercel
- `CSRF_TRUSTED_ORIGINS` = inclure l'URL Vercel

Puis rechargez l'application.

---

## 🔧 5. Structure des URLs

| Service | URL |
|---------|-----|
| Backend API | `https://votre_username.pythonanywhere.com/api/` |
| Django Admin | `https://votre_username.pythonanywhere.com/admin/` |
| Frontend | `https://votre-app.vercel.app` |

---

## ⚠️ Notes Importantes

1. **PythonAnywhere Free**: 
   - Limite de CPU quotidienne
   - Whitelist de sites externes (YouTube OK)
   - HTTPS automatique

2. **MySQL Free**: Inclus dans le plan gratuit.

3. **Vercel Free**: Parfait pour les projets personnels.

---

## 🐛 Troubleshooting

### Erreur "DisallowedHost"
Ajoutez votre domaine à ALLOWED_HOSTS dans .env

### Erreur de base de données
Vérifiez DATABASE_URL format: `mysql://user:pass@host/dbname`

### Erreur 502 Bad Gateway
Vérifiez les logs dans l'onglet Web → Error log
