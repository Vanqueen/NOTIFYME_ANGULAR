// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
require('dotenv').config();

dotenv.config(); // Charger les variables d'environnement

const validateDeleteRequest = (req, res, next) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({message: "Requête invalide. Veuillez fournir une liste d'IDs."});
    
    next();
};


const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']; 
  
  if (!token) return res.status(403).json({ success: false, message: "Accès refusé : aucun token fourni" });

  const tokenWithoutBearer = token?.split(' ')[1];

  try {
    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, async (err, decoded ) => {
      if (err) return res.status(401).json({ success: false, message: "Token invalide" });
      // req.userId = await User.findById(req.user.id); // Ajoute l'ID utilisateur à la requête pour l'utiliser dans les routes suivantes
      req.user = decoded;
      next(); // Passe à la prochaine fonction middleware
    });
  } catch (err) {
    console.error("Erreur de vérification du token:", err);
    return res.status(403).json({ message: "Token invalide" });
  }
};

// Middleware pour vérifier les rôles d'utilisateur
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Accès refusé. Permissions insuffisantes." });
        }
        next();
    };
};

const adminMiddleware = (req, res, next) => {
  console.log('+++++++++++++++++', req);
  console.log('+++++++++++++++++', req.role);

  if (!req.role || req.role !== 'admin') return res.status(403).json({ message: "Accès refusé : vous devez être un administrateur." });
  
  if (req.role && req.role === 'admin') {
    return next(); // L'utilisateur est un admin, continuer
  }
};


module.exports = {authMiddleware, adminMiddleware, validateDeleteRequest,  authorizeRoles};