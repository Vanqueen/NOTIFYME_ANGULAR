const User = require("../models/User");
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { handleFileUpload, validatePassword } = require('../utils/ServicesUtil');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { isValid } = require("ipaddr.js");


class AuthService {
    // constructor(io) {
    //     this.io = io;
    // };

    
    // Méthode pour incrémenter l'ID
    async getNextId() {
        const lastUser = await User.findOne().sort({ id: -1 }); // Trouver le dernier utilisateur
        return lastUser ? lastUser.id + 1 : 1; // Incrémenter ou initialiser à 1
    }

    
    async register(data) {
        try {
            const { user_login, fname, lname, email, password, passwordConfirmation, picture } = data;

            // Gestion de l'upload d'image si présent
            let picturePath = null;
            if (data.file) {
                picturePath = await handleFileUpload(data.file, 'avatar');
            }

            // Validation du mot de passe
            const passwordCheck = validatePassword(password);
            if (!passwordCheck.isValid) {
                return {
                  success: false,
                  message: 'Le mot de passe doit faire au moins 6 caractères et satisfaire au moins 2 des critères suivants : majuscule, minuscule, chiffre, caractère spécial',
                  details: passwordCheck.messages
                };
            }

            // Vérifie si l'utilisateur existe déjà
            let user = await User.findOne({ email });
            if (user) return { success: false, message: 'Email déjà utilisé' };
                    
            // Hashage des mots de passe avec gestion d'erreurs
            let hashedPassword, hashedConfirmPassword;

            try {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(password, salt);
                hashedConfirmPassword = await bcrypt.hash(passwordConfirmation, salt);
            } catch (hashError) {
                console.error("Erreur lors du hashage du mot de passe:", hashError);
                throw new Error("Erreur lors du traitement du mot de passe");
            }
            // Création de l'utilisateur
            user = new User({
                id: await this.getNextId(),
                user_login,
                fname,
                lname,
                email,
                password: hashedPassword,
                passwordConfirm: hashedConfirmPassword,
                picture: picturePath
            });
            await user.save();
            return { message: 'Utilisateur enregistrer avec succès !', user };
        } catch (err) {
            console.error("Erreur lors de l'enregistrement de l'utilisateur :", err);
            throw new Error("Erreur lors de l'enregistrement de l'utilisateur");
        }
    };

    async login(data) {
        try {
            const { email, password } = data;
            const user = await User.findOne({ email });
            if (!user) return { success: false, message: 'Utilisateur introuvable !' };
            const passwordCheck = validatePassword(password);
            if (!passwordCheck.isValid) {
                return {
                    success: false,
                    message: 'Le mot de passe doit faire au moins 6 caractères et satisfaire au moins 2 des critères suivants : majuscule, minuscule, chiffre, caractère spécial',
                    details: passwordCheck.messages
                };
            }
            const passwordMatch = await bcrypt.compare(password, user.password).catch((err) => {
                console.error("Erreur lors de la comparaison du mot de passe :", err);
                return false;
            });
            if (!passwordMatch) return { success: false, message: 'Mot de passe incorrect !' };
            const secretKey = process.env.JWT_SECRET;
            if (!process.env.JWT_SECRET) {
                throw new Error('La clé secrète JWT n\'est pas définie dans les variables d\'environnement.');
              }              
            const token = jwt.sign({  
                id: user.id, 
                uuid: user.uuid,
                user_login: user.user_login, 
                fname: user.fname, 
                lname: user.lname, 
                email: user.email, 
                role: user.role, 
                picture: user.picture, 
                last_login: user.last_login, 
                is_online: user.is_online, 
                etat_connection: user.etat_connection }, 
                secretKey, { expiresIn: '24h' });
            user.session_token = token;
            user.is_online = true;
            user.last_login = new Date();
            user.etat_connection = 'enligne';
            await user.save();
            return { success: true, message: 'Connexion réussie !', token, user: { 
                id: user.id,
                uuid: user.uuid, 
                user_login: user.user_login, 
                fname: user.fname, 
                lname: user.lname, 
                email: user.email, 
                role: user.role, 
                picture: user.picture, 
                last_login: user.last_login, 
                is_online: user.is_online,
                etat_connection: user.etat_connection
             } };
        } catch (error) {
            console.error("Erreur lors de la connexion de l'utilisateur :", error);
            throw new Error("Erreur lors de la connexion de l'utilisateur" + error.message);
        }
    };

      // Déconnexion
      async logout(userId) {
        try {
            const user = await User.findOne({ id: userId });

            if (!userId) {
                throw new Error("ID utilisateur non valide !");
            }
            
            if (!user) {
                throw new Error("Utilisateur introuvable !");
            }
            user.session_token = null;
            user.is_online = false;
            user.last_logout = new Date();
            user.etat_connection = 'déconnecté';
            await user.save();
            return { success: true, message: "Déconnexion réussie !", user };
        } catch (error) {
            console.error("Erreur lors de la déconnexion de l'utilisateur :", error);
            throw error;
        }
    }

    async getOnlineUsers() {
        try {
            const onlineUsers = await User.find({ is_online: true }).select('fname lname user_login last_login picture etat_connection');
            return { message: 'Utilisateurs en ligne', onlineUsers };
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs en ligne :", error);
            throw new Error("Erreur lors de la récupération des utilisateurs en ligne");
        }
    }

    async getUsersOffline() {
        try {
            const offlineUsers = await User.find({ is_online: false }).select('fname lname user_login last_login picture etat_connection');
            return { message: 'Utilisateurs hors ligne', offlineUsers };
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs hors ligne :", error);
            throw new Error("Erreur lors de la récupération des utilisateurs hors ligne");
        }
    }

    async getAllUsersStatus() {
        try {
            const users = await User.find({}).select('fname lname user_login last_login last_logout is_online picture etat_connection');
            return { message: 'Statuts de tous les utilisateurs', users };
        } catch (error) {
            console.error("Erreur lors de la récupération des statuts :", error);
            throw new Error("Erreur lors de la récupération des statuts");
        }
    }

    async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User.findOne({ uuid: userId });
            if (!user) return { message: "Utilisateur introuvable !" };
            const passwordMatch = await bcrypt.compare(oldPassword, user.password).catch((err) => {
                console.error("Erreur lors de la comparaison du mot de passe :", err);
                return false;
            });
            if (!passwordMatch) return { message: "Mot de passe incorrect !" };
            const passwordCheck = validatePassword(newPassword);
            if (!passwordCheck.isValid) {
                return {
                    message: 'Le mot de passe doit faire au moins 6 caractères et satisfaire au moins 2 des critères suivants : majuscule, minuscule, chiffre, caractère spécial',
                    details: passwordCheck.messages
                };
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            await user.save();
            return { message: "Mot de passe changé avec sucesso !" };
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            throw error;
        }
    }

    async resetPassword(email, newPassword, confirmPassword) {
        try {
            const user = await User.findOne({ email });
            if (!user) return { message: "Utilisateur introuvable !" };
            const passwordCheck = validatePassword(newPassword);
            if (newPassword !== confirmPassword) {
                return { message: "Les mots de passe ne correspondent pas !" };
            }
            if (!passwordCheck.isValid) {
                return {
                    message: 'Le mot de passe doit faire au moins 6 caractères et satisfaire au moins 2 des critères suivants : majuscule, minuscule, chiffre, caractère spécial',
                    details: passwordCheck.messages
                };
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            user.passwordConfirm = hashedPassword;
            await user.save();
            return { message: "Mot de passe changé avec sucesso !" };
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            throw error;
        }
    }

}

module.exports = new AuthService();