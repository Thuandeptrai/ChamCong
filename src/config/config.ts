import dotenv from 'dotenv';

dotenv.config();
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || ('localhost' as string);
const SERVER_PORT = process.env.SERVER_PORT || (4000 as number);
const MONGO_URL = 'mongodb+srv://thuan:rmk123456@cluster0.upcyp.mongodb.net/?retryWrites=true&w=majority';
const SERVER = {
  hostname: SERVER_HOSTNAME,
  port: SERVER_PORT,
};

//jwt
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'thongtunham';

//role
const ADMIN_ROLE = process.env.ADMIN_ROLE || 'admin';
const CUSTOMER_ROLE = process.env.CUSTOMER_ROLE || 'customer';
const CRYPTO_KEY = process.env.CRYPTO_KEY || 'thong';

//viettel
const VIETTEL_URL = process.env.VIETTEL_URL;
const VIETTEL_CLIENT_URL = process.env.VIETTEL_CLIENT_URL;
const API_ID = process.env.API_ID;
const API_KEY = process.env.API_KEY;
const TOKEN = process.env.TOKEN;

//bank
const BANK_ACCOUNT = process.env.BANK_ACCOUNT;
const BANK_CODE = process.env.BANK_CODE;

//
const BCRYPT_ROUND = 11;

const config = {
  mongo: {
    url: MONGO_URL,
  },
  server: SERVER,
  auth: {
    jwtSecretKey: JWT_SECRET_KEY,
  },
  role: {
    customer: CUSTOMER_ROLE,
    admin: ADMIN_ROLE,
  },
  crypto: {
    cryptoKey: CRYPTO_KEY,
  },
  viettel: {
    url: VIETTEL_URL,
    apiId: API_ID,
    apiKey: API_KEY,
    client_url: VIETTEL_CLIENT_URL,
    token: TOKEN,
  },
  bcrypt_round: BCRYPT_ROUND,
  bank: {
    account: BANK_ACCOUNT,
    bankcode: BANK_CODE,
  },
};

export default config;
