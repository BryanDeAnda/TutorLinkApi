import { SALT } from '#Constants/salt.js';
import UserModel from '#Schemas/user.schema.js';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const userRegisterController = async (req, res) => {
    const { _id, name, surname, email, password } = req.body;

    const existingUserById = await UserModel.findById(_id).exec();
    if (existingUserById)
        return res
            .status(409)
            .send({ errors: ['Ya existe un usuario con ese id registrado'] });

    const existingUserByEmail = await UserModel.findOne({ email }).exec();
    if (existingUserByEmail)
        return res.status(409).send({
            errors: ['Ya existe un usuario con ese email registrado'],
        });

    const hashedPassword = await hash(password, SALT);
    const user = new UserModel({
        _id,
        name,
        surname,
        email,
        password: hashedPassword,
    });

    await user.save();

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Puedes usar otros servicios como 'outlook' o configurar uno propio
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, //Remitente
        to: email, // Destinatario
        subject: 'Bienvenido a la plataforma',
        text: `Hola ${name},\n\n¡Tu cuenta ha sido creada con éxito! Estamos emocionados de tenerte con nosotros.\n\nGracias por registrarte.\n\nSaludos, El equipo.`,
    };

    // Enviar el correo
    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo', error);
    }

    return res.status(201).send('Usuario registrado con éxito');
};

export default userRegisterController;
