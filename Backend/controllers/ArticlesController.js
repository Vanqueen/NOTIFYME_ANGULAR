const articlesService = require('../services/Article');


exports.getAllArticles = async (req, res) => {
    try {
        const articles = await articlesService.getAllArticles();
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getArticleById = async (req, res) => {
    try {
        const article = await articlesService.getArticleById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article non trouvé' });
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getArticleByTitle = async (req, res) => {
    try {
        const article = await articlesService.getArticleByTitle(req.params.title);
        if (!article) return res.status(404).json({ message: 'Article non trouvé' });
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getArticleByAuthor = async (req, res) => {
    try {
        const article = await articlesService.getArticleByAuthor(req.params.author);
        if (!article) return res.status(404).json({ message: 'Article non trouvé' });
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getArticleByTags = async (req, res) => {
    try {
        const article = await articlesService.getArticleByTags(req.params.tags);
        if (!article) return res.status(404).json({ message: 'Article non trouvé' });
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getArticleByCategories = async (req, res) => {
    try {
        const article = await articlesService.getArticleByCategories(req.params.categories);
        if (!article) return res.status(404).json({ message: 'Article non trouvé' });
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.createArticles = async (req, res) => {
    try {
        const article = await articlesService.createArticles(req.body, req.user);
        if (!article) return res.status(400).json({ message: 'Erreur lors de la création de l\'article' });
        res.status(201).json({ message: 'Article créé avec succès', article });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Erreur lors de la création de l\'article', error: 'Le titre de l\'article existe déjà' });
        res.status(400).json({ message: 'Erreur lors de la création de l\'article', error: error.message });
    }
}

exports.updateArticle = async (req, res) => {
    const articleId = req.params.id;
    const updateData = req.body;
    try {
        const article = await articlesService.updateArticle(articleId, updateData);
        if (!article) return res.status(404).json({ message: 'Article non trouvé' });
        res.status(200).json({ message: 'Article mis à jour avec succès', article });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'article', error: error.message });
    }
}

exports.deleteArticle = async (req, res) => {
    const articleId = req.params.id;
    try {
        const deletedArticle = await articlesService.deleteArticle(articleId);
        if (!deletedArticle) return res.status(404).json({ message: 'Article non trouvé' });
        res.status(200).json({ message: 'Article supprimé avec succès', deletedArticle });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression de l\'article', error });
    }
}

exports.deleteArticles = async (req, res) => {
    const ids = req.body.ids;
    try {
        const deletedArticles = await articlesService.deleteArticles(ids);
        res.status(200).json({ message: `Articles supprimés avec succès: ${deletedArticles.deletedCount}`, data: deletedArticles });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la suppression de plusieurs articles', error: error.message });
    }
}