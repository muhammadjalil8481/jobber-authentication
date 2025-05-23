import Joi from "joi";

const signupSchema = Joi.object().keys({
  username: Joi.string().min(4).max(20).required().messages({
    "string.base": "username must be a string",
    "string.empty": "username cannot be empty",
    "string.min": "username must be at least 4 characters long",
    "string.max": "username must be at most 20 characters long",
    "any.required": "username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "email must be a string",
    "string.empty": "email cannot be empty",
    "string.email": "email must be a valid email address",
    "any.required": "email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "password must be a string",
    "string.empty": "password cannot be empty",
    "string.min": "password must be at least 6 characters long",
    "any.required": "password is required",
  }),
  country: Joi.string().required().messages({
    "string.base": "country must be a string",
    "string.empty": "country cannot be empty",
    "any.required": "country is required",
  }),
  profilePicture: Joi.string().required().messages({
    "string.base": "profilePicture must be a string",
    "string.empty": "profilePicture cannot be empty",
    "any.required": "profilePicture is required",
  }),
});

export { signupSchema };
