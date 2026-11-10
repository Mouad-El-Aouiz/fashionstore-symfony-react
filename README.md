# FashionStore

Application e-commerce de démonstration construite avec React et Symfony.
Le projet présente un catalogue de vêtements, une authentification par cookies,
une liste de favoris et un panier associé au compte utilisateur.

> **Démo :** le paiement en ligne n'est pas encore activé. La page de paiement
> indique qu'il sera disponible dans une prochaine version.

## Fonctionnalités

- Parcours du catalogue, filtres, recherche et fiches produit
- Création de compte avec confirmation par e-mail et connexion
- Gestion de profil et session persistante
- Favoris et panier pour les utilisateurs connectés
- Consultation et suivi des commandes existantes
- Interface responsive en français

## Technologies

- **Frontend :** React, Vite, Redux Toolkit, Tailwind CSS
- **Backend :** Symfony 7.4, PHP 8.3, Doctrine ORM
- **Base de données :** PostgreSQL 16
- **Développement local :** Docker Compose

## Démarrage local

### Backend

Depuis `backend-symfony` :

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

L'API est disponible sur `http://localhost:8001`. L'environnement local utilise
PostgreSQL et Mailpit ; il ne convient pas à une mise en production.

### Frontend

Depuis `frontend` :

```powershell
npm ci
npm run dev
```

Ouvrir `http://localhost:5173`. Vite relaie les appels `/api` vers le backend.
Les variables locales se configurent à partir des fichiers `.env.example`.

## Vérifications

```powershell
npm run build
```

La validation Doctrine et la configuration du backend sont décrites dans
[backend-symfony/README.md](./backend-symfony/README.md).

## Déploiement

Configurer les secrets, domaines, HTTPS, CORS, SMTP et la base de données selon
l'hébergeur choisi. Ne jamais publier les fichiers `.env` ou les clés privées
JWT. Prévoir des sauvegardes de base de données avant toute mise en production.
