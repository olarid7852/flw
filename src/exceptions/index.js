export function ConfigurationParseError(message, index) {
  this.message = `${message} at ${index}`;
  this.toString = function () {
    return this.message;
  };
}

export function TransactionFeeCalculationError(message) {
  this.message = message;
  this.toString = function () {
    return this.message;
  };
}
