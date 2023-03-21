import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import { AuthRquest } from '../interfaces';
import userModel from '../models/user.model';
import {
  convertObjectToQuery,
  removeUndefinedProperties
} from '../utils';
import { getSignature, verifyToken } from '../utils/auth';

import fetch from 'node-fetch';

export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers['authorization'];
  console.log('authorization:', authorization)
  if (!authorization) {
    return res.status(401).send({ message: 'No token provided' });
  }

  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    return res.status(401).send({ message: 'Invalid token format' });
  }
  verifyToken(
    token,
    config.auth.jwtSecretKey,
    null,
    async (error: any, decoded: any) => {
      if (error) {
        return res.status(401).send({ message: 'Invalid token' });
      }
      try {
        const thisUser = await userModel.findOne({_id: decoded.user_id});
        req.body.thisUser = thisUser;
        next();
      } catch (error) {
        return res.status(500).json(error);
      }
    }
  );
};

export const authenticateforAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
console.log(`vao sádhfkajsdf`)
  const authorization = req.headers['authorization'];
  console.log('authorization:', authorization)
  if (!authorization) {
    return res.status(401).send({ message: 'No token provided' });
  }

  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    return res.status(401).send({ message: 'Invalid token format' });
  }
  verifyToken(
    token,
    config.auth.jwtSecretKey,
    null,
    async (error: any, decoded: any) => {
      if (error) {
        return res.status(401).send({ message: 'Invalid token' });
      }
      try {
        const thisUser = await userModel.findById(decoded.user_id);
        console.log(thisUser?.isAdmin)
        if (thisUser?.isAdmin === 'True') {

          req.body.thisUser = thisUser;
          next();
        } else {
          return res.status(401).send({ message: 'You have no permission' });
        }
      } catch (error) {
        return res.status(500).json(error);
      }
    }
  );
};

export const signature = (req: Request, res: Response, next: NextFunction) => {
  const query = req.method + req.originalUrl + JSON.stringify(req.body || '');
  const sig = getSignature(query);

  // Check if the signature from the request matches the calculated signature
  if (sig !== req.headers['x-signature']) {
    return res.status(401).send({ message: 'Invalid signature' });
  }

  // Continue processing the request
  next();
};

export const callApiViettel = async (params: any) => {
  try {
    const query = convertObjectToQuery({
      api_id: config.viettel.apiId,
      api_key: config.viettel.apiKey,
      ...removeUndefinedProperties(params),
    });
    const url = config.viettel.url + query;

    const resultJson = await fetch(url, {
      method: 'GET',
    });

    const result = await resultJson.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const syncDataUserMiddleware = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};
