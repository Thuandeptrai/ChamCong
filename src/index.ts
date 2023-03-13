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

const allowOrigin = ['http://localhost:8078']

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
app.use(
  Fingerprint({
    parameters: [
      // Defaults
      Fingerprint.useragent,
      Fingerprint.acceptHeaders,
      Fingerprint.geoip,
    ],
  })
);


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

const autoCreateAdminAccount = async () => {
  try {
    const getRoleAdmin = await Roles.findOne({ roleName: 'admin' })
    const check = await userModel.find({ role: getRoleAdmin?._id })
    const salt = bcrypt.genSaltSync(8)
    const password = bcrypt.hashSync('123123@', salt)
    if (!check || check.length == 0) {

      const newUser: any = await callApiViettel({
        email: 'admin.gofiber@gmail.com',
        firstname: 'Gofiber',
        lastname: 'Admin',
        address1: '131 CN11, Nguyen Van Sang, Phuong Tan Son Nhi, Quan Tan Phu',
        phonenumber: '01111111111',
        country: 'VN',
        role: getRoleAdmin?._id,
        password: '123123@',
        password2: '123123@',
        countryname: 'Viet Nam',
        credit: 0,
        call: 'addClient',
      });

      if (!newUser?.success) {
        throw new Error(newUser.error.toString());
      }

      const userDetail = await callApiViettel({
        id: newUser.client_id,
        call: 'getClientDetails',
      });

      const adminUser = await userModel.create({
        ...userDetail.client,
        role: getRoleAdmin?._id,
        verified: true,
      })

      console.log("Create admin success")

    }

  
  } catch (error) {
    console.log(error)
  }
}

autoCreateRoles()
autoCreateAdminAccount()
dbBackup(process.env.DB_NAME || 'vietstack', process.env.BACKUP_PATH || '/www/wwwroot/vietstack/')

const server = createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: allowOrigin
  }
})

socket(io)

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
