import app from "./src/app.js";

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`lannister-pay listening on port ${port}`);
});

process.on("unhandledRejection", (error) => {
  // eslint-disable-next-line
  console.error("Fatal: Unexpected error", error.message);
  app.close(() => process.exit(0));
});
