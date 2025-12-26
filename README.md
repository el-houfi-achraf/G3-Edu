# 🎓 EduPlatform - Plateforme Éducative Privée

Une plateforme web d'éducation privée avec **Django REST API** (backend) et **Next.js** (frontend) pour diffuser des vidéos éducatives YouTube avec un accès strictement contrôlé et un système de session unique par utilisateur.

![Django](https://img.shields.io/badge/Django-4.2+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)

---

## 📋 Table des Matières

1. [Architecture](#-architecture)
2. [Fonctionnalités](#-fonctionnalités)
3. [Mécanisme de Session Unique](#-mécanisme-de-session-unique)
4. [Installation Locale](#-installation-locale)
5. [Déploiement](#-déploiement)
6. [API Endpoints](#-api-endpoints)
7. [Sécurité](#-sécurité)

---

## 🏗️ Architecture

```
eduplatform/
├── backend/                    # Django REST API
│   ├── eduplatform/           # Configuration principale
│   ├── accounts/              # Auth + Sessions + API
│   │   ├── api_views.py       # API endpoints auth
│   │   ├── serializers.py     # Serializers DRF
│   │   └── middleware.py      # Session unique
│   ├── videos/                # Vidéos + API
│   │   ├── api_views.py       # API endpoints vidéos
│   │   └── serializers.py     # Serializers DRF
│   └── requirements.txt
│
└── frontend/                   # Next.js App
    ├── src/
    │   ├── app/               # Pages (App Router)
    │   │   ├── login/         # Page de connexion
    │   │   ├── dashboard/     # Dashboard principal
    │   │   ├── videos/        # Liste & détail vidéos
    │   │   └── profile/       # Profil utilisateur
    │   ├── components/        # Composants React
    │   ├── contexts/          # Auth Context (JWT)
    │   ├── lib/               # Configuration API
    │   └── types/             # Types TypeScript
    └── package.json
```

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Django 4.2, Django REST Framework, JWT |
| **Frontend** | Next.js 15, React, TypeScript, TailwindCSS |
| **Auth** | JWT (access + refresh tokens) |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **Déploiement** | Render (Django) + Vercel (Next.js) |

---

## ✨ Fonctionnalités

### 👨‍💼 Administrateur
- ✅ Gestion des utilisateurs via Django Admin
- ✅ Gestion des vidéos (CRUD)
- ✅ Gestion des catégories
- ✅ Visualisation et invalidation des sessions

### 👤 Utilisateur
- ✅ Page de connexion moderne
- ✅ Dashboard avec vidéos par catégorie
- ✅ Lecture vidéos (iframe YouTube)
- ✅ Navigation par catégorie
- ✅ Profil avec sessions actives

### 🔐 Sécurité
- ✅ **Session unique** : Une seule session par utilisateur
- ✅ Authentification JWT (access + refresh tokens)
- ✅ Pas d'inscription publique
- ✅ CORS configuré pour le frontend
- ✅ Protection CSRF

---

## 🔄 Mécanisme de Session Unique

Le système garantit qu'**un utilisateur ne peut avoir qu'une seule session active à la fois**.

### Flux de connexion

```
1. User se connecte sur PC A
   └─> JWT tokens générés, session active

2. User se connecte sur Smartphone B
   └─> Anciens tokens JWT blacklistés
   └─> Nouveaux tokens générés

3. PC A essaie d'accéder à l'API
   └─> Token invalide → Erreur 401
   └─> Frontend redirige vers login
```

### Implémentation

1. **À chaque login** : Tous les anciens JWT tokens sont blacklistés
2. **Nouveaux tokens** : access (1h) + refresh (24h) générés
3. **Côté frontend** : Si 401, tentative de refresh, sinon redirect login

---

## 🚀 Installation Locale

### Prérequis

- Python 3.11+
- Node.js 18+
- npm ou yarn

### 1. Backend Django

```bash
cd eduplatform

# Créer environnement virtuel
python -m venv venv

# Activer (Windows)
.\venv\Scripts\activate

# Activer (Linux/Mac)
source venv/bin/activate

# Installer dépendances
pip install -r requirements.txt

# Migrations
python manage.py migrate

# Créer superuser
python manage.py createsuperuser

# Lancer le serveur (port 8000)
python manage.py runserver 8000
```

### 2. Frontend Next.js

```bash
cd frontend

# Créer .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Installer dépendances
npm install

# Lancer le serveur (port 3000)
npm run dev
```

### 3. Accéder à l'application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend Next.js |
| http://localhost:8000/admin | Admin Django |

### Compte Admin par défaut (si créé avec le script)

| Username | Password |
|----------|----------|
| admin | AdminPass123! |

---

## ☁️ Déploiement

### Backend → Render

1. **Créer un repo GitHub** avec le code
2. **Render Dashboard** → New Web Service
3. **Configurer :**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn eduplatform.wsgi:application`
4. **Variables d'environnement :**
   ```
   DEBUG=False
   SECRET_KEY=<générer une clé>
   DATABASE_URL=<URL PostgreSQL>
   ALLOWED_HOSTS=votre-app.onrender.com
   CSRF_TRUSTED_ORIGINS=https://votre-app.onrender.com,https://votre-frontend.vercel.app
   FRONTEND_URL=https://votre-frontend.vercel.app
   ```

### Frontend → Vercel

1. **Importer le repo** sur Vercel
2. **Root Directory** : `frontend`
3. **Variables d'environnement :**
   ```
   NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
   ```

---

## 📡 API Endpoints

### Authentication

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login/` | Connexion (retourne JWT) |
| POST | `/api/auth/logout/` | Déconnexion |
| POST | `/api/auth/refresh/` | Rafraîchir access token |
| GET | `/api/auth/me/` | Info utilisateur courant |
| GET | `/api/auth/sessions/` | Sessions actives |

### Videos

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/dashboard/` | Données dashboard |
| GET | `/api/videos/` | Liste des vidéos |
| GET | `/api/videos/<id>/` | Détail vidéo |
| GET | `/api/categories/` | Liste catégories |
| GET | `/api/categories/<id>/` | Détail catégorie |

### Exemple de requête

```javascript
// Login
const response = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'AdminPass123!' })
});

const { access, refresh, user } = await response.json();

// Requête authentifiée
const videos = await fetch('http://localhost:8000/api/dashboard/', {
  headers: { 'Authorization': `Bearer ${access}` }
});
```

---

## 🔒 Sécurité

### Mesures implémentées

| Mesure | Description |
|--------|-------------|
| **JWT Auth** | Tokens avec expiration courte |
| **Token Blacklist** | Anciens tokens invalidés à chaque login |
| **Session unique** | Un user = une session |
| **CORS** | Origines autorisées uniquement |
| **Pas de signup** | Comptes créés par admin uniquement |
| **HTTPS** | En production |

### Configuration CORS

Le backend accepte les requêtes uniquement depuis :
- `http://localhost:3000` (dev)
- L'URL du frontend en production (via `FRONTEND_URL`)

---

## 📝 Commandes Utiles

### Backend

```bash
# Activer venv
.\venv\Scripts\activate

# Lancer serveur
python manage.py runserver 8000

# Créer superuser
python manage.py createsuperuser

# Migrations
python manage.py makemigrations
python manage.py migrate
```

### Frontend

```bash
# Dev server
npm run dev

# Build production
npm run build

# Lint
npm run lint
```

---

## 🆘 Dépannage

### CORS Error
- Vérifier que `FRONTEND_URL` est correct dans le backend
- Vérifier que l'origine est dans `CORS_ALLOWED_ORIGINS`

### 401 Unauthorized
- Token expiré → Le frontend devrait auto-refresh
- Session invalidée → Reconnexion nécessaire

### Videos ne s'affichent pas
- Vérifier que les vidéos sont publiées dans l'admin
- Vérifier les URLs YouTube

---

**Développé avec ❤️ en Django + Next.js**
