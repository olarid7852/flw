import helpers from "../src/utils/helpers";

const configurationSpecs = {
  "*": {
    "*": { "*": [{ id: "LNPY1221", flatFee: 0, percFee: 1.4 }] },
    "BANK-ACCOUNT": { "*": [{ id: "LNPY1224", flatFee: 100, percFee: 0 }] },
    USSD: { MTN: [{ id: "LNPY1225", flatFee: 0, percFee: 0.55 }] },
  },
  INTL: {
    "CREDIT-CARD": { VISA: [{ id: "LNPY1222", flatFee: 0, percFee: 5 }] },
  },
  LOCL: {
    "CREDIT-CARD": { "*": [{ id: "LNPY1223", flatFee: 50, percFee: 1.4 }] },
  },
};

describe("Configuration Matching Test Case", () => {
  it("should match with the more specific configuration", async () => {
    const data = {
      ID: 91203,
      Amount: 5000,
      Currency: "NGN",
      CurrencyCountry: "NG",
      Customer: {
        ID: 2211232,
        EmailAddress: "anonimized29900@anon.io",
        FullName: "Abel Eden",
        BearsFee: true,
      },
      PaymentEntity: {
        ID: 2203454,
        Issuer: "GTBANK",
        Brand: "MASTERCARD",
        Number: "530191******2903",
        SixID: 530191,
        Type: "CREDIT-CARD",
        Country: "NG",
      },
    };
    const matchedConfiguration = helpers.findTransactionFeeConfiguration(
      configurationSpecs,
      data
    );
    expect(matchedConfiguration.id).toEqual("LNPY1223");
  });
});

describe("Fee calculation Test Case", () => {
  it("should calculate fee with percentage, if only percentage is available", async () => {
    const configuration = { id: "LNPY1221", flatFee: 0, percFee: 1 };
    const data = {
      ID: 91203,
      Amount: 5000,
      Currency: "NGN",
      CurrencyCountry: "NG",
      Customer: {
        ID: 2211232,
        EmailAddress: "anonimized29900@anon.io",
        FullName: "Abel Eden",
        BearsFee: true,
      },
      PaymentEntity: {
        ID: 2203454,
        Issuer: "GTBANK",
        Brand: "MASTERCARD",
        Number: "530191******2903",
        SixID: 530191,
        Type: "CREDIT-CARD",
        Country: "NG",
      },
    };
    const transactionFee = helpers.calculateTransactionFee(configuration, data);
    expect(transactionFee).toEqual(50);
  });

  it("should calculate fee with flat rate, if only flat rate is available", async () => {
    const configuration = { id: "LNPY1221", flatFee: 100, percFee: 0 };
    const data = {
      ID: 91203,
      Amount: 5000,
      Currency: "NGN",
      CurrencyCountry: "NG",
      Customer: {
        ID: 2211232,
        EmailAddress: "anonimized29900@anon.io",
        FullName: "Abel Eden",
        BearsFee: true,
      },
      PaymentEntity: {
        ID: 2203454,
        Issuer: "GTBANK",
        Brand: "MASTERCARD",
        Number: "530191******2903",
        SixID: 530191,
        Type: "CREDIT-CARD",
        Country: "NG",
      },
    };
    const transactionFee = helpers.calculateTransactionFee(configuration, data);
    expect(transactionFee).toEqual(100);
  });

  it("should calculate fee with both percentage and flat rate, if they are both available", async () => {
    const configuration = { id: "LNPY1221", flatFee: 100, percFee: 1 };
    const data = {
      ID: 91203,
      Amount: 5000,
      Currency: "NGN",
      CurrencyCountry: "NG",
      Customer: {
        ID: 2211232,
        EmailAddress: "anonimized29900@anon.io",
        FullName: "Abel Eden",
        BearsFee: true,
      },
      PaymentEntity: {
        ID: 2203454,
        Issuer: "GTBANK",
        Brand: "MASTERCARD",
        Number: "530191******2903",
        SixID: 530191,
        Type: "CREDIT-CARD",
        Country: "NG",
      },
    };
    const transactionFee = helpers.calculateTransactionFee(configuration, data);
    expect(transactionFee).toEqual(150);
  });
});

describe("Calculate Charge Amount Test Case", () => {
  it("should charge the customer, if bears is true", async () => {
    const data = {
      ID: 91203,
      Amount: 5000,
      Currency: "NGN",
      CurrencyCountry: "NG",
      Customer: {
        ID: 2211232,
        EmailAddress: "anonimized29900@anon.io",
        FullName: "Abel Eden",
        BearsFee: true,
      },
      PaymentEntity: {
        ID: 2203454,
        Issuer: "GTBANK",
        Brand: "MASTERCARD",
        Number: "530191******2903",
        SixID: 530191,
        Type: "CREDIT-CARD",
        Country: "NG",
      },
    };
    const chargeAmount = helpers.calculateChargeAmount(data, 50);
    expect(chargeAmount).toEqual(5050);
  });

  it("should not charge the customer, if bears is false", async () => {
    const data = {
      ID: 91203,
      Amount: 5000,
      Currency: "NGN",
      CurrencyCountry: "NG",
      Customer: {
        ID: 2211232,
        EmailAddress: "anonimized29900@anon.io",
        FullName: "Abel Eden",
        BearsFee: false,
      },
      PaymentEntity: {
        ID: 2203454,
        Issuer: "GTBANK",
        Brand: "MASTERCARD",
        Number: "530191******2903",
        SixID: 530191,
        Type: "CREDIT-CARD",
        Country: "NG",
      },
    };
    const chargeAmount = helpers.calculateChargeAmount(data, 50);
    expect(chargeAmount).toEqual(5000);
  });
});
