# SmartPredict AI Platform

Plateforme SaaS de Prédiction Intelligente pour la Restauration.

## Stack Technique
- **Frontend** : React.js + Tailwind CSS
- **Backend** : Node.js (Express) - Microservices
- **Base de données** : PostgreSQL + Redis
- **Event Bus** : Apache Kafka
- **IA** : TensorFlow + spaCy + Tesseract OCR
- **Cloud** : AWS (ECS, RDS, S3, Lambda)

## Structure du Projet
smartpredict/
├── gateway/           # API Gateway (Express)
├── services/
│   ├── auth/          # Authentification OAuth2/JWT
│   ├── user/          # Gestion des profils & restaurants
│   ├── data-ingestion/# Collecte des données POS/avis
│   ├── prediction/    # Modèles TensorFlow (LSTM)
│   ├── nlp/           # Analyse de sentiment
│   ├── ocr/           # OCR factures fournisseurs
│   └── analytics/     # KPIs & rapports
├── frontend/          # React.js + Tailwind
├── database/          # Migrations & seeds PostgreSQL
├── docker/            # Dockerfiles & configs
└── docker-compose.yml
##Démarrage rapide                                                          ```bash
docker-compose up -d
```
-Frontend : http://localhost:3000
-API Gateway :http://localhost:4000
-Auth Service :http://localhost:4001
