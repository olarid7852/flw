# flw lanister-pay test.
This is a flutterwave test.


## Dependencies
- Express - The framework for the server
- Cors - To allow cross-origin request for testing
- Joi - For preliminary validation

## Running the project
The project is built using NodeJS. You should install the dependencies, then you can now run the project

- yarn install
- yarn start 

## Endpoints
There are three endpoints,

- POST /fees - To save fees configuration
- POST /compute-transaction-fee : To get the transaction fee on a payment data


## Test
Testing is implemented for this project using jest. To run the test, use

- npm run test
