import { Request, Response, NextFunction, response } from 'express';
import UserModel from '../models/user.model';
import logging from '../config/logging';
import { UserService } from '../services';
import { convertDataToSyncData, RESPONSE_STATUS } from '../utils';
import config from '../config/config';
import { callApiViettel } from '../middleware';
import axios, { HttpStatusCode } from 'axios';
import Joi, { any } from 'joi';
import { responseModel } from '../utils/responseModel';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { ErrorResponse } from '../utils/ErrorResponse';
import {
  authentication,
  axiosClient,
  axiosClientAuth,
} from '../services/axiosClient';
import jwt from 'jsonwebtoken';
import { AuthRquest } from '../interfaces';
import { ResponseMessage } from '../utils/ResonseMessage';
import { userEndPoint } from '../utils/endpoint';
import crypto from 'crypto';
import { sendMailHelper } from '../helpers/sendEmail';
import userModel from '../models/user.model';
import { hashPassword, verifyPassword } from '../utils/auth';
import dateToCheck from '../models/DateToCheck.model';
import moment from 'moment';

function getTimeDiffFromNow(unixTimestamp: number): moment.Duration {
  const now = moment();
  const timestampMoment = moment.unix(unixTimestamp);
  return moment.duration(now.diff(timestampMoment));
}

export const createDateForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    dateIn: Joi.number().required(),
    lateDate: Joi.number().required(),
    leisure: Joi.number().required(),
    dateOut: Joi.number().required(),
  });

  try {
    // const checkValidBody = schema.validate(req.body);
    // if (checkValidBody.error) {
    //   throw new Error(checkValidBody.error.message);
    // }

    const findTicket: any = await dateToCheck.find({});
    const diffFromNow = getTimeDiffFromNow(findTicket[0].dateIn);
    console.log(diffFromNow.hours()); //
    //   const ticket = await dateToCheck.create(req.body);
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.CREATE_DATE_SUCCESS,
      {} //ticket
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateDateForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    dateIn: Joi.number(),
    lateDate: Joi.number(),
    leisure: Joi.number(),
    dateOut: Joi.number(),
  });
  const id = req.params.DateId;
  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllDateForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    dateIn: Joi.number(),
    lateDate: Joi.number(),
    leisure: Joi.number(),
    dateOut: Joi.number(),
  });
  const id = req.params.DateId;
  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }
    const ticket = await dateToCheck.find({});
    if (ticket) {
      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.CREATE_DATE_SUCCESS,
        ticket
      );
      return res.status(200).json(response);
    } else {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Can not find your id');
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
