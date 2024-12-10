const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');
// const socketIo = require('socket.io');
// const http = require('http');

const app = express();
dotenv.config();

// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(morgan('dev')); // Format "dev" pour un journal simple et clair

// Crée un flux d'écriture pour enregistrer dans un fichier
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
    flags: 'a', // Ajoute au fichier au lieu de l'écraser
  });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure morgan pour utiliser le flux
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(express.json());  

// Connect to MongoDB
connectDB()
.then(()=> console.log('Base de donnée connectée avec succès'))
.catch((err) => console.log('Erreur de connexion à la base de donnée', err));

// Routes
const authRoutes = require('./routes/User');
const User = require('./models/User');
app.use('/api/auth', authRoutes);
const articlesRoutes = require('./routes/Articles');
app.use('/api/articles', articlesRoutes);

process.on('SIGINT', async () => {
    try {
        await User.updateMany(
            { is_online: true },
            { is_online: false, last_logout: new Date() }
        );
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statuts:', error);
        process.exit(1);
    }
});

// Middleware pour passer l'instance de Socket.IO aux contrôleurs
// app.use((req, res, next) => {
//     req.io = io;
//     next();
//   });

// // Écoute des événements de connexion et de déconnexion
// io.on('connection', (socket) => {
//     console.log('Un utilisateur est connecté');
//     socket.on('user status', (data) => {
//         console.log('Statut de l\'utilisateur:', data);
//         console.log('Message reçu :', data);
//         socket.emit('response', { message: 'Message reçu !' });
//     });
// });

// io.on('disconnect', (socket) => {
//     console.log('Un utilisateur s\'est déconnecté');
//     socket.emit('response', { message: 'Déconnexion reçue !' });
// });
  
//   io.on('connection', (socket) => {
//     console.log('Un utilisateur est connecté');

//     socket.on('user status', (data) => {
//       console.log('Statut de l\'utilisateur:', data);
//     });
  
//     socket.on('disconnect', async () => {
//       const userId = socket.userId; // Récupérer l'ID stocké lors de la connexion
//       if (userId) {
//         const user = await User.findById(userId);
//         if (user) {
//           user.is_online = false; // Utiliser is_online pour correspondre au schéma
//           user.last_logout = new Date(); // Mettre à jour last_logout
//           await user.save();
//           io.emit('user status', { userId: user.id, online: false });
//         }
//       }
//     });
//   });

// const crypto = require('crypto');
// const secretKey = crypto.randomBytes(64).toString('hex');
// console.log(secretKey);


// Start the server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));