const express = require('express');
const { register, login, logout,changePassword, resetPassword, getOnlineUsers, getUsersOffline, getAllUsersStatus, updateLastLogin, updateLastLogout, upload } = require('../controllers/AuthController');
const { getAllUsers, getUserById, updateUser, deleteUser, deleteMultipleUsers } = require('../controllers/UserController');
const { validateDeleteRequest, authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');
const router = express.Router();

// Auth routes

router.post('/register', upload.single('picture'), register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/last-login', authMiddleware, updateLastLogin);
router.post('/last-logout', authMiddleware, updateLastLogout);
router.get('/online', authMiddleware, getOnlineUsers);
router.get('/offline', authMiddleware, getUsersOffline);
router.get('/status', authMiddleware, getAllUsersStatus);

// Route pour changer son mot de passe
router.post('/change-password/:id', authMiddleware, changePassword);

// Route pour définir un mot de passe
router.post('/reset-password', resetPassword);


// User routes
router.get('/users', authMiddleware, authorizeRoles('admin', 'superadmin'), getAllUsers);
router.delete('/users',validateDeleteRequest, authMiddleware, authorizeRoles('admin', 'superadmin'), deleteMultipleUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id', authMiddleware, authorizeRoles('admin', 'superadmin'), updateUser);
router.delete('/users/:id', authMiddleware, authorizeRoles('admin', 'superadmin'), deleteUser);

module.exports = router;