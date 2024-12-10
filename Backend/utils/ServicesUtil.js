const fs = require('fs');
const path = require('path');
    
    exports.validatePassword = (isPasswordValid) => {

        // Critères de validation
        const hasUpperCase = /[A-Z]/.test(isPasswordValid);
        const hasLowerCase = /[a-z]/.test(isPasswordValid);
        const hasNumbers = /\d/.test(isPasswordValid);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(isPasswordValid);
        const hasMinLength = isPasswordValid.length >= 6;
        
        // Compte le nombre de critères satisfaits
        const criteresSatisfaits = [
            hasUpperCase,
            hasLowerCase, 
            hasNumbers,
            hasSpecialChar
          ].filter(Boolean).length;

        // Message d'erreur détaillé
        const messages = [];
        if (!hasMinLength) messages.push("Le mot de passe doit contenir au moins 8 caractères");
        if (!hasUpperCase) messages.push("Au moins une majuscule");
        if (!hasLowerCase) messages.push("Au moins une minuscule"); 
        if (!hasNumbers) messages.push("Au moins un chiffre");
        if (!hasSpecialChar) messages.push("Au moins un caractère spécial");
    
        // Vérifie la longueur minimale ET au moins 2 critères satisfaits
        return {
            isValid: hasMinLength && criteresSatisfaits >= 2, // Au moins 2 critères requis
            messages: messages
          };
    }

    exports.isLocked = async (user) => {
        return user.lock_until && user.lock_until > Date.now();
    };

    exports.incrementLoginAttempts = async (user) => {
        if (user.lock_until && user.lock_until < Date.now()) {
            // Réinitialiser si le verrouillage est expiré
            user.auth_attempts = 1;
            user.lock_until = null;
        } else {
            user.auth_attempts += 1;
            // Verrouiller le compte après 5 tentatives
            if (user.auth_attempts >= 5) {
                user.lock_until = Date.now() + (15 * 60 * 1000); // Verrouillage de 15 minutes
            }
        }
        await user.save();
    };


    
    exports.handleFileUpload = async (file, type = 'avatar') => {
        try {
            // Définir les dossiers autorisés et leurs chemins
            const uploadPaths = {
                'avatar': './uploads/avatars',
                'article': './uploads/articles',
                'gallery': './uploads/gallery',
                'other': './uploads/others'
            };
    
            // Vérifier si le type est valide
            if (!uploadPaths[type]) {
                throw new Error("Type de fichier non autorisé");
            }
    
            const uploadDir = uploadPaths[type];
            
            // Créer le dossier s'il n'existe pas
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            // Générer un nom unique pour l'image
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const filename = `${type}-${uniqueSuffix}${ext}`;
            const filePath = path.join(uploadDir, filename);
            
            // Déplacer le fichier
            await fs.promises.rename(file.path, filePath);
            
            return `/uploads/${type}s/${filename}`;
        } catch (error) {
            console.error("Erreur lors du traitement de l'image:", error);
            throw new Error("Erreur lors du traitement de l'image");
        }
    }