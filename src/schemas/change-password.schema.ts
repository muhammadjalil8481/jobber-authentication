import Joi from "joi";

const changePasswordSchema = Joi.object().keys({
  currentPassword: Joi.string().required().messages({
    "string.base": "currentPassword must be a string",
    "string.empty": "currentPassword cannot be empty",
    "any.required": "currentPassword is required",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.base": "newPassword must be a string",
    "string.empty": "newPassword cannot be empty",
    "string.min": "newPassword must be at least 6 characters long",
    "any.required": "newPassword is required",
  }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "string.base": "confirmPassword must be a string",
      "string.empty": "confirmPassword cannot be empty",
      "any.required": "confirmPassword is required",
      "any.only": "confirmPassword must be equal to newPassword",
    }),
});

export { changePasswordSchema };
