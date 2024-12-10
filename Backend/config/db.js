require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_BLOG_URI;

const { ServerApiVersion } = require('mongodb');
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
               },
        });
        mongoose.connection.on('connected', () => {
            console.log('Connecté à MongoDB');
        });
        console.log('Connecté à MongoDB avec succès');
    } catch (error) {
        mongoose.connection.on('error', (err) => {
            console.error('Erreur de connexion à MongoDB:', err);
            process.exit(1);
        });
        console.error('Erreur de connexion à MongoDB:', error);
        process.exit(1);
    }
};

const mongoURI2 = process.env.MONGO_ARTICLE_URI;
const connectDB2 = async () => {
    try {
        await mongoose.connect(mongoURI2, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
               },
        });
        mongoose.connection.on('connected', () => {
            console.log('Connecté à MongoDB');
        });
        console.log('Connecté à MongoDB avec succès');
    } catch (error) {
        mongoose.connection.on('error', (err) => {
            console.error('Erreur de connexion à MongoDB:', err);
            process.exit(1);
        });
        console.error('Erreur de connexion à MongoDB:', error);
        process.exit(1);
    }
};
module.exports = connectDB;
