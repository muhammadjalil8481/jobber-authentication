import Joi from "joi";

const forgetPasswordSchema = Joi.object().keys({
  username: Joi.alternatives().conditional(Joi.string().email(), {
    then: Joi.string().email().required().messages({
      "string.base": "email must be a string",
      "string.empty": "email cannot be empty",
      "string.email": "email must be a valid email address",
    }),
    otherwise: Joi.string().required().messages({
      "string.base": "username must be a string",
      "string.empty": "username cannot be empty",
      "any.required": "username is required",
    }),
  }),
});

export { forgetPasswordSchema };
