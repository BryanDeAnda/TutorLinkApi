import UserModel from '#Schemas/user.schema.js';

const userListController = async (req, res) => {
    try {
        const users = await UserModel.find({}, 'name email'); // Ajusta los campos que deseas devolver
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send({ errors: ['Error al obtener los usuarios'] });
    }
};

export default userListController;
