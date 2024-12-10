const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Import de la fonction pour générer un UUID v4


const UserSchema = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuidv4, // Générer automatiquement un UUID v4
        unique: true,    // Assure l'unicité dans la base de données
    },
    id: {
        type: Number,
        unique: true,
        trim: true
    },
    user_login: {
        type: String,
        required: [true, "Le login est requis"],
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-z]+\.[a-z]+[0-9]*$/, // Pattern pour le login au format "prenom.nom" avec un nombre optionnel
        minlength: 5,
        maxlength: 25,
    },
    fname: {
        type: String,
        required: [true, "Le nom est requis"],
        trim: true,
        match: /^[a-zA-Z]+$/,
        minlength: 3,
    },
    lname: {
        type: String,
        required: [true, "Le prénom est requis"],
        trim: true,
        match: /^[a-zA-Z]+$/,
        minlength: 3,
    },
    email: {
        type: String,
        required: [true, "L'adresse email est requise"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Email non valide'],
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis"],
        minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
        validate: {
            validator: function(password) {
                // Vérifie la présence d'au moins un des critères
                const hasUpperCase = /[A-Z]/.test(password);
                const hasLowerCase = /[a-z]/.test(password);
                const hasNumbers = /\d/.test(password);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);      
                // Retourne true si au moins un critère est satisfait
                return hasUpperCase || hasLowerCase || hasNumbers || hasSpecialChar;
            },
            message: 'Le mot de passe doit contenir au moins un des critères suivants : majuscule, minuscule, chiffre ou caractère spécial'
        }
    },
    passwordConfirm: {
        type: String,
        required: [true, "La confirmation du mot de passe est requise"],
        // required: true,  // Nécessaire pour valider la confirmation du mot de passe
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'editor', 'superadmin'],
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    etat_connection: {
        type: String,
        enum: ['enligne', 'déconnecté'],
        default: 'déconnecté',
    },
    picture: {
        type: String,
        default: null, // Photo de profil, initialisée à null
    },
    last_login: {
        type: Date,
        default: null, // Dernière connexion, initialisée à null
    },
    last_logout: {
        type: Date,
        default: null, // Dernière déconnexion, initialisée à null
    },
    is_online: {
        type: Boolean,
        default: false, // Indicateur de connexion, initialisée à false
    },
    session_token: {
        type: String,
        default: null, // Token de session
    },
    password_reset_token: {
        type: String,
        default: null, // Token pour réinitialisation du mot de passe
    },
    password_reset_expires: {
        type: Date,
        default: null, // Date d'expiration du token de réinitialisation
    },
    is_verified: {
        type: Boolean,
        default: false, // Vérifie si l'utilisateur a confirmé son email
    },
    auth_attempts: {
        type: Number,
        default: 0, // Tentatives d'authentification échouées
    },
    lock_until: {
        type: Date,
        default: null, // Date jusqu'à laquelle l'utilisateur est verrouillé après trop de tentatives
    },
    todos: {
        type: Array,
        ref: 'Todo'
    },
},{
    timestamps: true,
});

// // Validation personnalisée pour vérifier que le mot de passe et la confirmation correspondent
// UserSchema.pre('save', function(next) {
//     if (this.isModified('password') || this.isModified('passwordConfirm')) {
//         if (this.password !== this.passwordConfirm) throw new Error('Les mots de passe ne correspondent pas');
//     }

//     next();
// });

// // Générer un token de session
// userSchema.methods.generateSessionToken = function () {
//     const token = crypto.randomBytes(32).toString('hex'); // Générer un token sécurisé
//     this.session_token = token;
//     return token;
// };

// // Générer un token de réinitialisation du mot de passe
// userSchema.methods.generatePasswordResetToken = function () {
//     const token = crypto.randomBytes(32).toString('hex');
//     this.password_reset_token = token;
//     this.password_reset_expires = Date.now() + 3600000; // Expire dans 1 heure
//     return token;
// };

// // Vérifier si le compte est verrouillé
// UserSchema.methods.isLocked = function () {
//     return this.lock_until && this.lock_until > Date.now();
// };

// // Incrémenter les tentatives de connexion
// UserSchema.methods.incrementAuthAttempts = async function () {
//     if (this.lock_until && this.lock_until < Date.now()) {
//         this.auth_attempts = 1; // Réinitialiser les tentatives si le verrouillage est expiré
//         this.lock_until = null;
//     } else {
//         this.auth_attempts += 1;
//         if (this.auth_attempts >= 5) { // Verrouiller après 5 tentatives
//             this.lock_until = Date.now() + 2 * 60 * 1000; // Verrouiller pour 2 minutes
//         }
//     }
//     await this.save();
// };

const User = mongoose.model('User', UserSchema);

module.exports = User;