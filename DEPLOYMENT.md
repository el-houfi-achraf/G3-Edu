# 🚀 Guide de Déploiement G3 Edu

## Architecture

- **Backend**: Django REST API → **Render** (avec PostgreSQL)
- **Frontend**: Next.js → **Vercel**

---

## 📦 1. Préparation du Code

### Backend (Django)
Les fichiers suivants sont déjà configurés :
- `requirements.txt` - Dépendances Python
- `build.sh` - Script de build Render
- `Procfile` - Commande de démarrage
- `runtime.txt` - Version Python (3.11)
- `eduplatform/settings.py` - Configuration production-ready

### Frontend (Next.js)
- `next.config.ts` - Optimisé pour Vercel
- Variable d'environnement: `NEXT_PUBLIC_API_URL`

---

## 🖥️ 2. Déploiement Backend sur Render

### Étape 1: Créer un compte Render
Allez sur [render.com](https://render.com) et créez un compte.

### Étape 2: Créer une base de données PostgreSQL
1. Dashboard → **New** → **PostgreSQL**
2. Choisissez un nom (ex: `g3edu-db`)
3. Region: **Frankfurt (EU Central)**
4. Plan: **Free**
5. Cliquez **Create Database**
6. **Copiez l'Internal Database URL** (vous en aurez besoin)

### Étape 3: Créer le Web Service
1. Dashboard → **New** → **Web Service**
2. Connectez votre dépôt GitHub
3. Configurez:
   - **Name**: `g3edu-backend`
   - **Region**: `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Root Directory**: laisser vide (si le backend est à la racine) ou `eduplatform`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn eduplatform.wsgi:application`

### Étape 4: Variables d'environnement (Render)
Ajoutez ces variables dans **Environment**:

| Variable | Valeur |
|----------|--------|
| `SECRET_KEY` | Générer une clé sécurisée |
| `DEBUG` | `False` |
| `DATABASE_URL` | (URL interne de votre PostgreSQL) |
| `ALLOWED_HOSTS` | `g3edu-backend.onrender.com` |
| `FRONTEND_URL` | `https://votre-app.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://g3edu-backend.onrender.com,https://votre-app.vercel.app` |
| `PYTHON_VERSION` | `3.11.0` |

> 💡 Pour générer une SECRET_KEY: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### Étape 5: Déployer
Cliquez **Create Web Service** et attendez le déploiement.

---

## 🌐 3. Déploiement Frontend sur Vercel

### Étape 1: Créer un compte Vercel
Allez sur [vercel.com](https://vercel.com) et connectez votre GitHub.

### Étape 2: Importer le projet
1. **Add New** → **Project**
2. Sélectionnez votre dépôt
3. **Root Directory**: `frontend`
4. Framework Preset: **Next.js** (auto-détecté)

### Étape 3: Variables d'environnement (Vercel)
Dans **Environment Variables**, ajoutez:

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://g3edu-backend.onrender.com` |

### Étape 4: Déployer
Cliquez **Deploy** et attendez.

---

## 🔗 4. Configuration Post-Déploiement

### Mettre à jour CORS sur Render
Une fois l'URL Vercel connue, mettez à jour sur Render:
- `FRONTEND_URL` = votre URL Vercel
- `CSRF_TRUSTED_ORIGINS` = inclure l'URL Vercel

### Créer un super-utilisateur
Dans Render, allez dans **Shell** et exécutez:
```bash
python manage.py createsuperuser
```

---

## 🔧 5. Structure des URLs

| Service | URL |
|---------|-----|
| Backend API | `https://g3edu-backend.onrender.com/api/` |
| Django Admin | `https://g3edu-backend.onrender.com/admin/` |
| Frontend | `https://votre-app.vercel.app` |

---

## ⚠️ Notes Importantes

1. **Render Free Tier**: Le service s'endort après 15min d'inactivité. Premier chargement peut prendre ~30 secondes.

2. **PostgreSQL Free**: 90 jours gratuits sur Render, puis $7/mois.

3. **Vercel Free**: Parfait pour les projets personnels.

4. **HTTPS**: Les deux services utilisent HTTPS automatiquement.

---

## 🐛 Troubleshooting

### Erreur CORS
Vérifiez que `FRONTEND_URL` et `CORS_ALLOWED_ORIGINS` incluent votre URL Vercel.

### Erreur 500 sur le backend
Vérifiez les logs Render et assurez-vous que `DEBUG=False` et que toutes les migrations ont été exécutées.

### Images ne s'affichent pas
Vérifiez que YouTube est dans `remotePatterns` de `next.config.ts`.
