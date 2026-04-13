// ============================================================
// API Gateway - Point d'entrée unique de SmartPredict
// ============================================================
// Rôle :
//   1. Recevoir TOUTES les requêtes du frontend
//   2. Vérifier l'authentification (JWT)
//   3. Router vers le bon microservice
//   4. Appliquer le rate limiting & sécurité
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('./middlewares/auth');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// =================== MIDDLEWARES GLOBAUX ===================

// Helmet : ajoute des headers de sécurité (XSS, clickjacking, etc.)
app.use(helmet());

// CORS : autorise le frontend à communiquer avec l'API
app.use(cors({
  origin: ['http://localhost:3000'],  // Frontend React
  credentials: true,                   // Autorise les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Morgan : log chaque requête dans la console (utile pour le debug)
app.use(morgan('dev'));

// Rate Limiting : limite à 100 requêtes par minute par IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,                   // max 100 requêtes
  message: {
    error: 'Trop de requêtes. Réessayez dans une minute.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(limiter);

// Parser JSON pour les requêtes non-proxy
app.use(express.json());

// =================== HEALTH CHECK ===================
// Endpoint pour vérifier que le gateway est en vie
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// =================== ROUTES PUBLIQUES (pas de JWT) ===================

// Auth : login et register sont publics (pas besoin d'être connecté)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' },
  onError: (err, req, res) => {
    res.status(503).json({ error: 'Service Auth indisponible' });
  }
}));

// =================== ROUTES PROTÉGÉES (JWT requis) ===================

// À partir d'ici, toutes les routes nécessitent un token JWT valide
app.use('/api', authMiddleware);

// User Service
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:4002',
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api/users' },
}));

// Data Ingestion Service
app.use('/api/data', createProxyMiddleware({
  target: process.env.DATA_SERVICE_URL || 'http://localhost:4003',
  changeOrigin: true,
  pathRewrite: { '^/api/data': '/api/data' },
}));

// Prediction Service
app.use('/api/predictions', createProxyMiddleware({
  target: process.env.PREDICTION_SERVICE_URL || 'http://localhost:4004',
  changeOrigin: true,
  pathRewrite: { '^/api/predictions': '/api/predictions' },
}));

// NLP Service
app.use('/api/nlp', createProxyMiddleware({
  target: process.env.NLP_SERVICE_URL || 'http://localhost:4005',
  changeOrigin: true,
  pathRewrite: { '^/api/nlp': '/api/nlp' },
}));

// OCR Service
app.use('/api/ocr', createProxyMiddleware({
  target: process.env.OCR_SERVICE_URL || 'http://localhost:4006',
  changeOrigin: true,
  pathRewrite: { '^/api/ocr': '/api/ocr' },
}));

// Analytics Service
app.use('/api/analytics', createProxyMiddleware({
  target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4007',
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '/api/analytics' },
}));

// =================== GESTION DES ERREURS ===================

// Route non trouvée
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Erreur globale
app.use((err, req, res, next) => {
  console.error('Erreur Gateway :', err.message);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =================== DÉMARRAGE ===================

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   🚀 SmartPredict API Gateway             ║
  ║   Port : ${PORT}                             ║
  ║   Env  : ${process.env.NODE_ENV || 'development'}                   ║
  ╚════════════════════════════════════════════╝
  `);
});

module.exports = app;