import { SALT } from '#Constants/salt.js';
import UserModel from '#Schemas/user.schema.js';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; // Para generar el código único
import dotenv from 'dotenv';
dotenv.config();

const userRegisterController = async (req, res) => {
    const { _id, name, surname, email, password } = req.body;

    try {
        // Verificar si el ID ya está registrado
        const existingUserById = await UserModel.findById(_id).exec();
        if (existingUserById) {
            return res.status(409).send({
                errors: ['Ya existe un usuario con ese id registrado'],
            });
        }

        // Verificar si el correo ya está registrado
        const existingUserByEmail = await UserModel.findOne({ email }).exec();
        if (existingUserByEmail) {
            return res.status(409).send({
                errors: ['Ya existe un usuario con ese email registrado'],
            });
        }

        // Hashear la contraseña
        const hashedPassword = await hash(password, SALT);

        // Generar un código de verificación único
        const emailVerificationCode = crypto.randomBytes(16).toString('hex');

        // Crear el usuario con el código de verificación y el estado de correo no verificado
        const user = new UserModel({
            _id,
            name,
            surname,
            email,
            password: hashedPassword,
            emailVerificationCode,
            isEmailVerified: false, // Por defecto
        });

        // Guardar el usuario en la base de datos
        await user.save();

        // Configurar Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Crear enlace de verificación
        const verificationLink = `${process.env.BASE_URL}/user/verify-email?code=${emailVerificationCode}`; // Asegúrate de configurar FRONTEND_URL en tu archivo .env

        const mailOptions = {
            from: process.env.EMAIL_USER, // Remitente
            to: email, // Destinatario
            subject: 'Verifica tu correo electrónico',
            text: `Hola ${name},\n\nPor favor verifica tu correo electrónico haciendo clic en el siguiente enlace:\n\n${verificationLink}\n\nGracias por registrarte.\n\nSaludos, El equipo.`,
        };

        // Enviar el correo de verificación
        await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado con éxito');

        return res.status(201).send({
            message:
                'Usuario registrado con éxito. Por favor verifica tu correo electrónico.',
        });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        return res
            .status(500)
            .send({ errors: ['Hubo un error al registrar el usuario'] });
    }
};

export default userRegisterController;
