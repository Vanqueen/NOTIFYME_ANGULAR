const User = require('../models/User');
const auth = require('../services/Auth');
const multer = require('multer');
const bcrypt = require('bcrypt');


const storage = multer.diskStorage({
    destination: './uploads/avatars', 
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG ou GIF.'), false);
    }
};

exports.upload = multer({  
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite à 5MB
    } });

exports.register = async (req, res, next) => {
    try {
        // const picturePath = await auth.handleFileUpload(req.file);
        const userData = { ...req.body, picture: req.file ? `/uploads/avatars/${req.file.filename}` : null };
        const result = await auth.register(userData);
        res.status(201).json({ message: "Utilisateur créé avec succès", user: result});
        next();
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Login ou email déjà utilisés.' }); // Gestion des erreurs de duplication de données
        res.status(400).json({ message: "Erreur lors de l'inscription", message: err.message });
    }
}

exports.login = async (req, res, next) => {
    const { user_login, password } = req.body;

    try {
        if (!user_login || !password) {
            return res.status(400).json({ success: false, message: "Le login et le mot de passe sont requis" });
        }

        if (typeof user_login !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: "Le login et le mot de passe doivent être de type string" });
            
        }
        const result = await auth.login(req.body);
        console.log('result', result);
        if (result.success) {
            
            return res.status(200).json({
                success: true, 
                message: "Connexion réussie", 
                token: result.token,
                user: result.user
            });
        } else {
            return res.status(401).json({ success: false, message: result.message || "Erreur d'authentification" });
        }
        // Émettez un événement pour le statut de l'utilisateur
        // req.io.emit('user status', { userId: result.user._id, online: true });
        next();
    } catch (err) {
        console.error("Erreur lors de la connexion:", err);
        if (err.message === 'Utilisateur non trouvé') return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        if (err.message === 'Mot de passe incorrect') return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        res.status(500).json({ success: false, message: 'Erreur lors de la connexion', error: err.message });
    }
}

// // Route pour définir un mot de passe
// exports.setPassword = async (req, res) => {
//     const { userId, password } = req.body;
  
//     try {
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: "Utilisateur non trouvé" });
//       }
  
//       // Hash du mot de passe
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
  
//       // Sauvegarder le mot de passe
//       await user.save();
//       res.status(200).json({ message: "Mot de passe défini avec succès" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Erreur interne du serveur" });
//     }
//   };
  

exports.logout = async (req, res, next) => {
    try {
    const userId = req.user.id; // ID utilisateur récupéré depuis le middleware d'authentification
     
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Non autorisé' });
    }
    
    // Détruire la session si vous utilisez express-session
    req.session?.destroy();

    const result = await auth.logout(userId);
    // Émettez un événement pour le statut de l'utilisateur
    // req.io.emit('user status', { userId: userId, online: false });
    res.status(200).json({ success: true, message: 'Déconnexion réussie', result });
    next();
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la déconnexion', error: err.message });
    }
}

exports.getOnlineUsers = async (req, res, next) => {
    try {
        const result = await auth.getOnlineUsers();
        res.status(200).json({message: 'Utilisateurs en ligne', result});
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs en ligne', message: err.message });
    } finally {
        next();
    }
}

exports.getUsersOffline = async (req, res, next) => {
    try {
        const result = await auth.getUsersOffline();
        res.status(200).json({message: 'Utilisateurs hors ligne', result});
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs hors ligne', message: err.message });
    } finally {
        next();
    }
}

exports.getAllUsersStatus = async (req, res) => {
    try {
        const result = await auth.getAllUsersStatus();
        res.status(200).json({message: 'Statuts de tous les utilisateurs', result});
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des statuts', message: err.message });
    }
}

exports.updateLastLogin = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await User.findByIdAndUpdate(userId, {
            last_login: new Date(),
            is_online: true
        });

        res.status(200).json({
            success: true,
            message: 'Dernière connexion mise à jour'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la dernière connexion'
        });
    }
};

exports.updateLastLogout = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await User.findByIdAndUpdate(userId, {
            last_logout: new Date(),
            is_online: false
        });

        res.status(200).json({
            success: true,
            message: 'Dernière déconnexion mise à jour'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la dernière déconnexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la dernière déconnexion'
        });
    }
};

exports.changePassword = async (req, res, next) => {
    const userId = req.user.uuid;
    const { oldPassword, newPassword } = req.body;
    try {
        const result = await auth.changePassword(userId, oldPassword, newPassword);
        res.status(200).json({ success: true, message: 'Mot de passe changé avec succès', result });
        next();
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors du changement de mot de passe', 
            error: error.message });
    }
}

exports.resetPassword = async (req, res, next) => {
    const { email, newPassword, confirmPassword } = req.body;
    try {
        const result = await auth.resetPassword(email, newPassword, confirmPassword);
        res.status(200).json({ success: true, message: 'Mot de passe mis à jour avec succès', result });
        next();
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors du changement de mot de passe', 
            error: error.message });
    }
}