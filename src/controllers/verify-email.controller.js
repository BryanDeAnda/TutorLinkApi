import UserModel from '#Schemas/user.schema.js';

const verifyEmailController = async (req, res) => {
    const { code } = req.query; // Obtenemos el código desde los parámetros de la URL

    try {
        // Verificar si el código fue enviado
        if (!code) {
            return res
                .status(400)
                .send({ errors: ['Código de verificación no proporcionado.'] });
        }

        // Buscar el usuario por el código de verificación
        const user = await UserModel.findOne({
            emailVerificationCode: code,
        }).exec();

        // Verificar si el usuario existe y el código es válido
        if (!user) {
            return res
                .status(404)
                .send({
                    errors: [
                        'Código de verificación inválido o usuario no encontrado.',
                    ],
                });
        }

        // Actualizar el estado de verificación del correo
        user.isEmailVerified = true;
        user.emailVerificationCode = null; // Limpiamos el código de verificación
        await user.save();

        return res
            .status(200)
            .send('Correo electrónico verificado con éxito. ¡Gracias!');
    } catch (error) {
        console.error('Error al verificar el correo:', error);
        return res
            .status(500)
            .send({
                errors: ['Hubo un error al verificar el correo electrónico.'],
            });
    }
};

export default verifyEmailController;
