import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config';

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const createToken = (payload: any, secretKey: string, options: any) => {
  const token = jwt.sign(payload, secretKey, options);
  return token;
};

export const verifyToken = (
  token: string,
  secretKey: string,
  options: any,
  callback: any
) => {
  jwt.verify(token, secretKey, options, callback);
};

export const getSignature = (query: any) => {
  const hash = crypto
    .createHmac('sha256', config.crypto.cryptoKey)
    .update(query)
    .digest('hex');

  return hash;
};
