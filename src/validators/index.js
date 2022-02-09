import Joi from "joi";
import { validationError } from "../utils/responses.js";

const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validator(schema, req, res, next) {
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return validationError(res, {}, error.details[0].message);
  }
  req.rawBody = req.body;
  req.body = value;
  return next();
}
const configurationValidatorConfig = Joi.object({
  FeeConfigurationSpec: Joi.string().required(),
});

const transactionValidatorConfig = Joi.object({
  ID: Joi.number().required(),
  Amount: Joi.number().positive().required(),
  Currency: Joi.number().valid("NGN"),
  CurrencyCountry: Joi.string().required(),
  Customer: Joi.object({
    ID: Joi.number().required(),
    EmailAddress: Joi.string().email().required(),
    FullName: Joi.string().required(),
    BearsFee: Joi.boolean().required(),
  }),
  PaymentEntity: Joi.object({
    ID: Joi.number().required(),
    Issuer: Joi.string().allow(""),
    Brand: Joi.string().allow(""),
    Number: Joi.string().required(),
    SixID: Joi.number().required(),
    Type: Joi.string()
      .valid("CREDIT-CARD", "DEBIT-CARD", "BANK-ACCOUNT", "USSD", "WALLET-ID")
      .required(),
    Country: Joi.string().required(),
  }),
});

export const configurationValidator = (req, res, next) =>
  validator(configurationValidatorConfig, req, res, next);
export const transactionValidator = (req, res, next) =>
  validator(transactionValidatorConfig, req, res, next);

// export default {
//   configurationValidator,
//   transactionValidator,
// };
