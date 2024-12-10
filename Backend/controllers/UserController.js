// controllers/userController.js
const userService = require('../services/User');


/**
 * Vérifie si le mot de passe est valide
 * @param {String} password - Mot de passe à vérifier
 * @returns {Boolean} Vrai si le mot de passe est valide, faux sinon
*/
// exports.comparePassword = async (password) => {
    // const user = await User.findById(req.user.id);
    //   return await bcrypt.compare(password, user.password);
    // };
    
/**
 * Récupère tous les utilisateurs
 * @returns {Array} Liste des utilisateurs
 *
*/
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Récupère un utilisateur par son ID
 * @param {String} id - ID de l'utilisateur
 * @returns {Object} Utilisateur correspondant à l'ID
*/
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  try {
    const user = await userService.updateUser(userId, updateData);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json({ message: 'Profil mis à jour avec succès', user: user });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du profil', error });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const deleteUser = await userService.deleteUser(userId);
    if (!deleteUser) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json({ message: 'Utilisateur supprimé avec succès', deleteUser });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
  }
};

exports.deleteMultipleUsers = async (req, res) => {
  const ids  = req.body.ids; // Liste des IDs à supprimer

  try {
    const deletedUsers = await userService.deleteUsers(ids);
    res.status(200).json({ message: `Utilisateurs supprimés avec succès: ${deletedUsers.deletedCount}`, data: deletedUsers });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la suppression de plusieurs utilisateurs', error: error.message });
  }
};