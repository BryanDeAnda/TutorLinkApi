import {
    emailDTOSchema,
    idDTOSchema,
    nameDTOSchema,
    passwordDTOSchema,
    surnameDTOSchema,
} from '#Dto/dto-types.js';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

// Agregar la validación para el dominio específico de correo
const emailDTOSchemaWithDomain = Type.String({
    format: 'email',
    pattern: '^[a-zA-Z0-9._%+-]+@alumnos\\.udg\\.mx$', // Validar el dominio específico
    errorMessage: {
        type: 'El tipo del email no es válido, debe ser un string',
        format: 'El formato del email no es válido, debe cumplir el RFC 5322',
        pattern:
            'El correo debe pertenecer al dominio institucional @alumnos.udg.mx',
    },
});

const RegisterDTOSchema = Type.Object(
    {
        _id: idDTOSchema,
        name: nameDTOSchema,
        surname: surnameDTOSchema,
        email: emailDTOSchemaWithDomain, // Usamos la nueva validación para el email
        password: passwordDTOSchema,
    },
    {
        additionalProperties: false,
        errorMessage: {
            additionalProperties: 'El formato del objeto no es válido',
        },
    }
);

const ajv = new Ajv({ allErrors: true })
    .addKeyword('kind')
    .addKeyword('modifier');

ajv.addFormat('password', /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/);
addFormats(ajv, ['email', 'uuid']);
addErrors(ajv);

const validateSchema = ajv.compile(RegisterDTOSchema);

const userRegisterDTO = (req, res, next) => {
    const isDTOValid = validateSchema(req.body);

    if (!isDTOValid)
        return res.status(400).send({
            errors: validateSchema.errors.map((error) => error.message),
        });

    next();
};

export default userRegisterDTO;
