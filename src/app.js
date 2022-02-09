import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import {
  internalServerError,
  notFoundError,
  validationError,
} from "./utils/responses.js";

const app = express();

// Automatically tries to convert request to JSON
app.use(express.json());

app.use(cors());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return validationError(res, {}, "Unable to parse data as JSON");
  }
  next();
});

app.use("/", routes);

// 404 Error Handler
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => notFoundError(res));

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(err);
  return internalServerError(err);
});

export default app;
