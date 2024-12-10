const Article = require('../models/Articles')
const { handleFileUpload } = require('../utils/ServicesUtil');


class ArticlesService {
    constructor() {}

    async getAllArticles() {
        const articles = await Article.find({});
        return articles;
    }

    async getArticleById(id) {
        const article = await Article.findOne({id: id});
        return article;
    }

    async getArticleByTitle(title) {
        const article = await Article.findOne({title: title});
        return article;
    }

    async getArticleByAuthor(author) {
        const article = await Article.findOne({author: author});
        return article;
    }

    async getArticleByTags(tags) {
        const article = await Article.findOne({tags: tags});
        return article;
    }

    async getArticleByCategories(categories) {
        const article = await Article.findOne({categories: categories});
        return article;
    }

    async getNextId() {
        const lastArticle = await Article.findOne().sort({id: -1});
        return lastArticle ? lastArticle.id + 1 : 1;
    }

    async createArticle(article) {
        const newArticle = new Article({
            id: await this.getNextId(),
            ...article
        });
        await newArticle.save();
        return newArticle;
    }

    async createArticles(articles, user) {
        const { title, description, tags, categories, article_image, status } = articles;
        
        // Gestion de l'upload d'image si présent
        let picturePath = null;
        if (article_image) {
            picturePath = await handleFileUpload(article_image, 'article');
        }
        const newArticle = new Article({
            id: await this.getNextId(),
            title,
            description,
            author: user.fname + ' ' + user.lname,
            tags: tags || null,
            categories: categories || null,
            article_image: picturePath || null,
            status: status || 'active',
        })
        await newArticle.save();
        return newArticle;
    }

    async updateArticle(id, article) {
        try {
            const updatedArticle = await Article.findOne({id: id});
            if (!updatedArticle) throw new Error("Article non trouvé");

            const allowedUpdates = ['title', 'description', 'tags', 'categories', 'article_image', 'status'];
            const updated = Object.keys(article);
            const isValidOperation = updated.every((key) => allowedUpdates.includes(key));
            if (!isValidOperation) throw new Error("Mise à jour invalide : Champs non autorisés");

            updated.forEach((key) => {
                updatedArticle[key] = article[key];
            });
            await updatedArticle.save();
            return updatedArticle;
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async reorderIds() {
        const articles = await Article.find().sort({id: 1});
        for (let i = 0; i < articles.length; i++) {
            articles[i].id = i + 1;
            await articles[i].save();
        }
    }

    async deleteArticle(id) {
        const deletedArticle = await Article.findOneAndDelete({id: id});
        await this.reorderIds();
        return deletedArticle;
    }

    async deleteArticles(ids) {
        const deletedArticles = await Article.deleteMany({id: { $in: ids }});
        await this.reorderIds();
        return deletedArticles;
    }
}

module.exports = new ArticlesService();