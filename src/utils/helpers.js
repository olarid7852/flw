import { ConfigurationParseError } from "../exceptions/index.js";
import { saveConfiguration } from "./data.js";

const LOCALE_OPTIONS = ["LOCL", "INTL", "*"];
const SUPPORTED_CURRENCIES = ["NGN", "*"];
const ENTITY_VERIFICATION_REGEX = /^([^/(]+)\(([^\)]+)\)$/;
const ENTITIES = {
  BANK_ACCOUNT: "BANK-ACCOUNT",
  CREDIT_ACCOUNT: "CREDIT-CARD",
  DEBIT_CARD: "DEBIT-CARD",
  USSD: "USSD",
  WALLET_ID: "WALLET-ID",
};
const SUPPORTED_ENTITIES = [
  ENTITIES.BANK_ACCOUNT,
  ENTITIES.CREDIT_ACCOUNT,
  ENTITIES.DEBIT_CARD,
  ENTITIES.USSD,
  ENTITIES.WALLET_ID,
  "*",
];
const CARD_ENTITY_TYPES = [ENTITIES.CREDIT_ACCOUNT, ENTITIES.DEBIT_CARD];

const FEE_TYPES = {
  flat: "FLAT",
  perc: "PERC",
  flatPerc: "FLAT_PERC",
};
const SUPPORTED_FEE_TYPES = [
  FEE_TYPES.flat,
  FEE_TYPES.perc,
  FEE_TYPES.flatPerc,
];

function convertStringToNumber(stringVal, index) {
  const numberVal = Number(stringVal); // Empty string should return zero(0)
  if (isNaN(numberVal)) {
    throw new ConfigurationParseError(`Fee value not a valid number`, index);
  }
  return numberVal;
}

function splitEntity(entity, index) {
  const matchResult = entity.match(ENTITY_VERIFICATION_REGEX);
  if (matchResult.length != 3) {
    throw new ConfigurationParseError(`Invalid entity definition`, index);
  }
  const [_, entityType, entity_property] = matchResult;
  return [entityType, entity_property];
}

function splitFeeValues(feeType, feeValue, index) {
  if (!SUPPORTED_FEE_TYPES.includes(feeType)) {
  }
  let flatFeeChar = "";
  let percFeeChar = "";

  if (feeType == FEE_TYPES.flat) {
    flatFeeChar = feeValue;
  } else if (feeType === FEE_TYPES.perc) {
    percFeeChar = feeValue;
  } else {
    const splittedValues = feeValue.split(":");
    if (splittedValues.length != 2) {
      throw new ConfigurationParseError(`Invalid entity fees`, index);
    }
    [flatFeeChar, percFeeChar] = splittedValues;
  }
  return [
    convertStringToNumber(flatFeeChar, index),
    convertStringToNumber(percFeeChar, index),
  ];
}

const parseConfiguration = (configuration, index) => {
  const fields = configuration.split(" ");
  if (fields.length !== 8) {
    throw new ConfigurationParseError(`Invalid configuration`, index);
  }
  const [id, currency, locale, entity, colon, apply, fee_type, fee_value] =
    fields;
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new ConfigurationParseError(`Unsupported currency`, index);
  }
  if (!LOCALE_OPTIONS.includes(locale)) {
    throw new ConfigurationParseError(
      `Locale must either be 'INTL' or 'LOCL'`,
      index
    );
  }
  const [feeEntity, entityProperty] = splitEntity(entity, index);
  if (!SUPPORTED_ENTITIES.includes(feeEntity)) {
    throw new ConfigurationParseError(`Unsupported entity`, index);
  }
  if (colon !== ":") {
    throw new ConfigurationParseError(`Invalid configuration`, index);
  }
  if (apply !== "APPLY") {
    throw new ConfigurationParseError(`Invalid configuration`, index);
  }
  const [flatFee, percFee] = splitFeeValues(fee_type, fee_value, index);
  return {
    id,
    currency,
    locale,
    feeEntity,
    entityProperty,
    flatFee,
    percFee,
  };
};

function saveFeeConfiguration(feeConfigurationSpecs) {
  const configurations = feeConfigurationSpecs.split("\n");
  const configurationJson = configurations
    .map(parseConfiguration)
    .reduce((resultJson, configuration) => { // Add configuration to JSON
      if (!resultJson[configuration.locale]) // Format is {locale: {entityType: {entityProperty: []}}}
        resultJson[configuration.locale] = {};
      const locale = resultJson[configuration.locale];
      if (!locale[configuration.feeEntity])
        locale[configuration.feeEntity] = {};
      const feeEntity = locale[configuration.feeEntity];
      if (!feeEntity[configuration.entityProperty])
        feeEntity[configuration.entityProperty] = [];
      const entityProperty = feeEntity[configuration.entityProperty];
      entityProperty.push({
        id: configuration.id,
        flatFee: configuration.flatFee,
        percFee: configuration.percFee,
      });
      return resultJson;
    }, {});

  saveConfiguration(configurationJson);
}

function getKey(data, key) {
  if (data[key]) return [data[key], key];
  if (!useWildcard) return data["*"] || [{}, "*"];
}

function findTransactionFeeConfiguration(configuration, transactionData) {
  const locale =
    transactionData.CurrencyCountry === transactionData.PaymentEntity.Country
      ? "LOCL"
      : "INTL";
  const entityType = transactionData.PaymentEntity.Type;
  let entityProperty = null;
  if (CARD_ENTITY_TYPES.includes(entityType)) {
    entityProperty = transactionData.PaymentEntity.Brand;
  } else {
    entityProperty = transactionData.PaymentEntity.Issuer;
  }
  if (!entityProperty) {
    throw new TransactionFeeCalculationError("Entity property not set");
  }
  if (!SUPPORTED_CURRENCIES.includes(transactionData.Currency)) {
    return null;
  }

  const wildcard = "*";
  const keys = [
    [locale, entityType, entityProperty],
    [locale, entityType, wildcard],
    [locale, wildcard, entityProperty],
    [locale, wildcard, wildcard],
    [wildcard, entityType, entityProperty],
    [wildcard, entityType, wildcard],
    [wildcard, wildcard, entityProperty],
    [wildcard, wildcard, wildcard],
  ];
  const correctKey = keys.find((key) => {
    let data = configuration[key[0]] || {};
    data = data[key[1]] || {};
    data = data[key[2]] || [];
    return data.length > 0;
  });

  if (!correctKey) {
    return null;
  }
  return configuration[correctKey[0]][correctKey[1]][correctKey[2]][0];
}

function calculateTransactionFee(configuration, data) {
  return configuration.flatFee + (configuration.percFee * data.Amount) / 100;
}
function calculateChargeAmount(data, transactionFee) {
  return data.Customer.BearsFee ? data.Amount + transactionFee : data.Amount;
}

export default {
  saveFeeConfiguration,
  findTransactionFeeConfiguration,
  calculateTransactionFee,
  calculateChargeAmount,
};
