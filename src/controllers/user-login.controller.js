import UserModel from '#Schemas/user.schema.js';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose';

const userLoginController = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar si el usuario existe por email
        const existingUserByEmail = await UserModel.findOne({ email }).exec();
        if (!existingUserByEmail) {
            return res
                .status(401)
                .send({ errors: ['Credenciales incorrectas'] });
        }

        // Verificar si el correo ha sido validado
        if (!existingUserByEmail.isEmailVerified) {
            return res.status(403).send({
                errors: [
                    'Por favor verifica tu correo electrónico antes de iniciar sesión.',
                ],
            });
        }

        // Verificar la contraseña
        const checkPassword = await compare(
            password,
            existingUserByEmail.password
        );
        if (!checkPassword) {
            return res
                .status(401)
                .send({ errors: ['Credenciales incorrectas'] });
        }

        // Generar el token JWT
        const jwtConstructor = new SignJWT({ id: existingUserByEmail._id });
        const encoder = new TextEncoder();
        const jwt = await jwtConstructor
            .setProtectedHeader({
                alg: 'HS256',
                typ: 'JWT',
            })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(encoder.encode(process.env.JWT_PRIVATE_KEY));

        // Enviar el JWT al cliente
        return res.send({ jwt });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return res
            .status(500)
            .send({ errors: ['Error interno del servidor.'] });
    }
};

export default userLoginController;
