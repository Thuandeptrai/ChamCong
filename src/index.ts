/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import config from './config/config';
import logging from './config/logging';
import useRoutes from './routers';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/handleError';
import expressFileUpload from 'express-fileupload'
import path from 'path';
import { socket } from './socket';
import Roles from './models/Roles';
import { generateRandomString } from './utils';
import userModel from './models/user.model';
import bcrypt from 'bcrypt'
import { callApiViettel } from './middleware';
const Fingerprint = require("express-fingerprint");


import { dbBackup } from './backup';

const NAMESPACE = 'SERVER';

dotenv.config();

const app = express();

const allowOrigin = ['*']

const corsOption: CorsOptions = {
  credentials: true,
  origin: allowOrigin,
  allowedHeaders: [
    'Origin',
    'Content-Type',
    'Accept',
    'x-access-token',
    'authorization',
    'x-signature',
  ],
  methods: 'GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE',
  preflightContinue: false,
};

app.use(cors(corsOption));

mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    console.log('connected database');
  })
  .catch((err: any) => console.log(err));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressFileUpload())
app.use(express.static(path.join(__dirname, `public`)))



useRoutes(app);

app.use(errorHandler)

const autoCreateRoles = async () => {
  try {
    const check = await Roles.find({
    })
    if (!check || check.length == 0) {
      const admin = await Roles.create({
        code: generateRandomString(8),
        roleName: config.role.admin
      })
      const user = await Roles.create({
        code: generateRandomString(8),
        roleName: config.role.admin
      })
      console.log("Create Roles")
    }
  } catch (error) {
    console.log(error)
  }
}


autoCreateRoles()
dbBackup(process.env.DB_NAME || 'vietstack', process.env.BACKUP_PATH || '/www/wwwroot/vietstack/')

const server = createServer(app);




// Add your API routes here

app.get('/', (req, res) => {
  res.send('<h1>Hello world Thong API</h1>');
});

server.listen(config.server.port, () => {
  logging.info(
    NAMESPACE,
    `Server is running on ${config.server.hostname}:${config.server.port}`
  );
});
