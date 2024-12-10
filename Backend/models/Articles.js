const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import de la fonction pour générer un UUID v4


const ArticleSchema = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuidv4, // Générer automatiquement un UUID v4
        unique: true,    // Assure l'unicité dans la base de données
    },
    id: {
        type: Number,
        unique: true,
        trim: true,
    },
    title: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        trim: false,
    },
    tags: {
      type: String,
      trim: true,
    },
    categories: {
      type: String,
      trim: true,
    },
    article_image: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active','pending','inactive'],
      default: 'active',
    },
    user_id: {
      type: Number,
      trim: false,
    },
},
{timestamps: true });

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;