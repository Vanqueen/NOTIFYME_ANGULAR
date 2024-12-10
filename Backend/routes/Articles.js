const express = require('express');
const router = express.Router();
const ArticlesController = require('../controllers/ArticlesController');

router.get('/', ArticlesController.getAllArticles);
router.get('/:id', ArticlesController.getArticleById);
router.get('/title/:title', ArticlesController.getArticleByTitle);
router.get('/author/:author', ArticlesController.getArticleByAuthor);
router.get('/tags/:tags', ArticlesController.getArticleByTags);
router.get('/categories/:categories', ArticlesController.getArticleByCategories);
router.post('/', ArticlesController.createArticles);
router.delete('/', ArticlesController.deleteArticles);
router.put('/:id', ArticlesController.updateArticle);
router.delete('/:id', ArticlesController.deleteArticle);


// router.get('/',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.getAllArticles);
// router.get('/:id',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.getArticleById);
// router.get('/title/:title',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.getArticleByTitle);
// router.get('/author/:author',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.getArticleByAuthor);
// router.get('/tags/:tags',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.getArticleByTags);
// router.get('/categories/:categories',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.getArticleByCategories);
// router.post('/',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.createArticles);
// router.delete('/',authMiddleware, validateDeleteRequest, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.deleteArticles);
// router.put('/:id',authMiddleware, authorizeRoles('user', 'editor', 'admin', 'superadmin'), ArticlesController.updateArticle);
// router.delete('/:id',authMiddleware, authorizeRoles('admin', 'superadmin'), ArticlesController.deleteArticle);

module.exports = router;