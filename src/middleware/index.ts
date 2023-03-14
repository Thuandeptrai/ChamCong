import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import logging from '../config/logging';
import { AuthRquest, CRequest } from '../interfaces';
import {
  RESPONSE_STATUS,
  convertDataToSyncData,
  convertObjectToQuery,
  removeUndefinedProperties,
} from '../utils';
import { getSignature, verifyToken } from '../utils/auth';
import axios from 'axios';
import userModel from '../models/user.model';
import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import { ErrorResponse } from '../utils/ErrorResponse';
import { axiosClientAuth, refreshVietelToken } from '../services/axiosClient';
import Roles from '../models/Roles';
import ListVMSModel from '../models/ListVMS.model';
import { userEndPoint } from '../utils/endpoint';
import fetch from 'node-fetch';


export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers['authorization'];
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

        next()
       
          
     

       

       
      } catch (error) {
         return res.status(500).json(error)
      }
    }
  );
};




export const authenticateforAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers['authorization'];
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
        if(thisUser?.isAdmin==="True"){

          next()
        }else{
        return res.status(401).send({ message: 'You have no permission' });
          
        }

       
          
     

       

       
      } catch (error) {
         return res.status(500).json(error)
      }
    }
  );
};


export const authorize =
  (allowedRoles: string[]) => async (req: AuthRquest, res: Response, next: NextFunction) => {
    const id  = req.user?.id;
    const getUser = await userModel.findById(id)
    const userRole = await Roles.findById(getUser?.role)
    if (!userRole?.roleName || !allowedRoles.includes(userRole?.roleName)) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    next();
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

export const syncListVMSMiddleware = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const services = await axiosClientAuth(req.user?.accesstoken).get(
      `/service`
    );

    await ListVMSModel.deleteMany({ client_id: req.user?.client_id });
    const { services: allServices } = services?.data;

    const result: any[] = [];
    await Promise.all(
      allServices.map(async (item: any) => {
        const allListVMS = await axiosClientAuth(req.user?.accesstoken).get(
          `/service/${item?.id}/vms`
        );
        if (allListVMS?.data !== undefined) {
          const resData1 = allListVMS?.data?.vms;
          const objectValues = Object.values(resData1);
          const temp = await Promise.all(
            objectValues.map(async (it: any) => {
              const a = {
                service_id: item?.id,
                object_id: it?.id,
                ha: it?.ha,
                built: it?.built,
                locked: it?.locked,
                power: it?.power,
                status: it?.status,
                status_lang: it?.status_lang,
                password: it?.password,
                sshkeys: it?.sshkeys,
                username: it?.username,
                memory: it?.memory,
                disk: it?.disk,
                swap: it?.swap,
                uptime: it?.uptime,
                template_id: it?.template_id,
                template_name: it?.template_name,
                template_data: it?.template_data,
                replication: it?.replication,
                cloudinit: it?.cloudinit,
                ipv4: it?.ipv4,
                ipv6: it?.ipv6,
                bandwidth: it?.bandwidth,
                label: it?.label,
                ip: it?.ip[Object.keys(it?.ip)[0]],
                cpus: it?.cpus,
                client_id: req.user?.client_id,
              };

              return await ListVMSModel.create(a);
            })
          );
          result.push(...temp);
          return temp;
        }
        return null;
      })
    );

    next()
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const syncDataUserMiddleware = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {

   

    next()
  } catch (error) {
    return res.status(500).json(error);
  }
};
