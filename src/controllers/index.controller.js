import helper from "../utils/helpers.js";
import { ConfigurationParseError } from "../exceptions/index.js";
import { successResponse, validationError } from "../utils/responses.js";
import { loadConfiguration } from "../utils/data.js";

export function saveFeeConfiguration(req, res) {
  const spec = req.body.FeeConfigurationSpec;
  try {
    helper.saveFeeConfiguration(spec);
  } catch (err) {
    if (ConfigurationParseError.prototype.isPrototypeOf(err)) {
      return validationError(res, {}, err.message);
    }
    throw err;
  }
  return successResponse(res, {
    status: "ok",
  });
}

export function calculateTransactionFee(req, res) {
  const data = req.body;

  const configurationSpecs = loadConfiguration();
  const configuration = helper.findTransactionFeeConfiguration(
    configurationSpecs,
    data
  );
  if (!configuration) {
    return validationError(
      res,
      {},
      "No valid configuration to calculate transaction fee"
    );
  }
  const transactionFee = helper.calculateTransactionFee(configuration, data);
  const chargeAmount = helper.calculateChargeAmount(data, transactionFee);
  const responseObj = {
    AppliedFeeID: configuration.id,
    AppliedFeeValue: transactionFee,
    ChargeAmount: chargeAmount,
    SettlementAmount: chargeAmount - transactionFee,
  };
  return successResponse(res, responseObj);
}
