/* eslint-disable @typescript-eslint/no-var-requires */
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressFileUpload from 'express-fileupload';
import { createServer } from 'http';
import mongoose from 'mongoose';
import path from 'path';
import config from './config/config';
import logging from './config/logging';
import { errorHandler } from './middleware/handleError';
import useRoutes from './routers';
const Fingerprint = require("express-fingerprint");


import { dbBackup } from './backup';

const NAMESPACE = 'SERVER';

dotenv.config();

const app = express();

const allowOrigin = ['*']

const corsOption: CorsOptions = {
  credentials: true,
  origin: '*',
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
