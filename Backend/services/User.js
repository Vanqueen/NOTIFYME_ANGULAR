const User = require("../models/User");

class UserService {
    constructor() {}
    async getAllUsers() {
        const users = await User.find({});
        return users;
    };

    async getUserById(userId) {
        const user = await User.findOne({id: userId});
        return user;
    };

    async getUserByEmail(email) {
        const user = await User.findOne({ email });
        return user;
    };

    async updateUser(userId, updatedUser) {
        try {
            const user = await User.findOne({ id: userId });
            if (!user) throw new Error("Utilisateur non trouvé");
    
            const allowedUpdates = ['user_login', 'fname','lname', 'email',  'password', 'role', 'status', 'picture'];
            const updated = Object.keys(updatedUser);
            const isValidOperation = updated.every((key) => allowedUpdates.includes(key));
            if (!isValidOperation) throw new Error("Mise à jour invalide : Champs non autorisés");
            
            updated.forEach((key) => {
                user[key] = updatedUser[key];
            });

            await user.save();
            return user;
        } catch (err) {
            throw err;
        }
    };

    /**
     * Fonction pour réordonner les IDs
     */
    async reorderIds() {
        const users = await User.find().sort({ id: 1 }); // Récupère tous les utilisateurs triés par ID
        for (let i = 0; i < users.length; i++) {
            users[i].id = i + 1; // Réattribue les IDs
            await users[i].save(); // Sauvegarde chaque utilisateur
        }
    };

    async deleteUser(id) {
        const deletedUser = await User.findOneAndDelete({ id: id });
        await this.reorderIds(); // Réordonne les IDs
        return deletedUser;
    };

    async deleteUsers(ids) {
        const deletedUsers = await User.deleteMany({ id: { $in: ids } });
        await this.reorderIds(); // Réordonne les IDs
        return deletedUsers;
    };

}

module.exports = new UserService();