import request from "supertest";
import app from "../src/app";

let server;

beforeAll(() => {
  server = request(app);
});

describe("Fee Configuration Endpoint Validation Test Case", () => {
  it("should throw 400 error for validation failure", async () => {
    const res = await server.post("/fees");
    expect(res.statusCode).toEqual(400);
  });

  it("should throw 400 for non numeric fee values", async () => {
    const res = await server.post("/fees").send({
      FeeConfigurationSpec: "LNPY1221 NGN * *(*) : APPLY PERC 1.4p",
    });
    expect(res.statusCode).toEqual(400);
  });

  it('should throw 400 error for other currencies apart from "NGN"', async () => {
    const res = await server.post("/fees").send({
      FeeConfigurationSpec: "LNPY1221 USD * *(*) : APPLY PERC 1.4",
    });
    expect(res.statusCode).toEqual(400);
  });

  it("should return 200 for properly defined configuration", async () => {
    const res = await server.post("/fees").send({
      FeeConfigurationSpec: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      status: "ok",
    });
  });
});

describe("Transaction Fee Calculation Endpoint Validation Test Case", () => {
  it("should throw 400 error for validation failure", async () => {
    const res = await server.post("/compute-transaction-fee");
    expect(res.statusCode).toEqual(400);
  });

  it("should throw 400 for missing amount field", async () => {
    const res = await server.post("/compute-transaction-fee").send({
      ID: 91203,
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
    });
    expect(res.statusCode).toEqual(400);
  });
});
