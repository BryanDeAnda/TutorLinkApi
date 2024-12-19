import UserModel from '#Schemas/user.schema.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit'; // Importar express-rate-limit
dotenv.config();

// Configurar el Rate Limiter
const resendLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // Máximo de 3 solicitudes por ventana de tiempo
    message: {
        errors: [
            'Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde.',
        ],
    },
    standardHeaders: true, // Enviar información del rate limit en los headers
    legacyHeaders: false, // Desactivar headers heredados
});

const resendVerificationEmailController = async (req, res) => {
    const { email } = req.body;

    try {
        // Buscar al usuario por email
        const user = await UserModel.findOne({ email }).exec();

        if (!user) {
            return res.status(404).send({
                errors: ['Usuario no encontrado con el correo proporcionado.'],
            });
        }

        // Verificar si ya está verificado
        if (user.isEmailVerified) {
            return res.status(400).send({
                errors: ['El correo electrónico ya ha sido verificado.'],
            });
        }

        // Generar un nuevo código de verificación
        const newEmailVerificationCode = crypto.randomBytes(16).toString('hex');
        user.emailVerificationCode = newEmailVerificationCode;
        user.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); // Expira en 1 hora
        await user.save();

        // Configurar Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Crear el enlace de verificación
        const verificationLink = `${process.env.BASE_URL}/user/verify-email?code=${newEmailVerificationCode}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reenvío de Verificación de Correo Electrónico',
            text: `Hola ${user.name},\n\nPor favor verifica tu correo electrónico haciendo clic en el siguiente enlace:\n\n${verificationLink}\n\nGracias por registrarte.\n\nSaludos, El equipo.`,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        return res.status(200).send({
            message:
                'Se ha enviado un nuevo correo de verificación. Revisa tu bandeja de entrada.',
        });
    } catch (error) {
        console.error('Error al reenviar el correo de verificación:', error);
        return res.status(500).send({
            errors: ['Hubo un error al reenviar el correo de verificación.'],
        });
    }
};

export { resendVerificationEmailController, resendLimit };
