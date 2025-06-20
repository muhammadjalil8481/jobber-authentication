import Joi from "joi";

const resetPasswordSchema = Joi.object().keys({
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

export { resetPasswordSchema };
