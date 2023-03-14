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
import ticketForUser from '../models/Ticket.model';

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
  try {
    const findTicket: any = await dateToCheck.find({});
    const findTicketforUser: any = await ticketForUser
      .find({})
      .sort({ DateIn: 'descending' });
    // Convert Date Time like 12:00 To UnixTime
    const diffFromNow = getTimeDiffFromNow(findTicketforUser[0].DateIn);
    const DateIn =  findTicket[0].dateIn.split(":")
    const dateIn = moment().set({ hour: Number(DateIn[0]) , minute: Number(DateIn[1]), second: 0 });
    const DateOut = findTicket[0].dateOut.split(":")
    // Get the Unix timestamp
    const dateOut = moment().set({ hour: Number(DateOut[0]) , minute: Number(DateOut[1]), second: 0 });
    const unixDateIn = dateIn.unix();
    const unixDateOut = dateOut.unix()
    // end of conversion
    let ticket;
    if (diffFromNow.asHours() >= 24) {
      ticket = await ticketForUser.create({
        userDateIn: moment().unix(),
        DateIn: Number(unixDateIn),
        DateOut: Number(unixDateOut),
        userId: req.body.thisUser._id,
        userDateOut: 0,
      });
    } else {
    }

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.CREATE_DATE_SUCCESS,
      ticket || {}
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
  
  try {
    

    return res.status(200).json(response);
  } catch (error) {
   
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
