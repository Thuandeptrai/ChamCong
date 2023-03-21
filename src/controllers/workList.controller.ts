import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { AuthRquest } from '../interfaces';
import { callApiViettel } from '../middleware';

import {
  default as UserModel,
  default as userModel,
} from '../models/user.model';
import { RESPONSE_STATUS } from '../utils';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ResponseMessage } from '../utils/ResonseMessage';
import { hashPassword, verifyPassword } from '../utils/auth';
import { responseModel } from '../utils/responseModel';
import workRecordForUser from '../models/workList.model';
import salaryByMonth from '../models/salaryByMonth.model';

export const getAllWorkListByMonth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const month = req.query.month;
  const Year = req.query.year;
  try {
    const workList = await workRecordForUser.find({});
    const dataList = [];

    for (let i = 0; i < workList.length; i++) {
      const time: any = workList[i].month?.split('/');

      if (
        Number(time[1]) === Number(month) &&
        Number(time[2]) === Number(Year)
      ) {
        dataList.push(workList[i]);
      }
    }
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.CREATE_DATE_SUCCESS,
      dataList || {}
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
export const getWorkDayByMonth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDataWorkData = await salaryByMonth.find({userId: req.body.thisUser._id})
    
    const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.CREATE_DATE_SUCCESS,
        userDataWorkData || {}
      );
      res.status(200).json(response)
  } catch (error) {
    next(error);
  }
};
export const getWorkDayByMonthForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.UserId
    const userDataWorkData = await salaryByMonth.find({userId: userId})
    
    const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.CREATE_DATE_SUCCESS,
        userDataWorkData || {}
      );
      res.status(200).json(response)
  } catch (error) {
    next(error);
  }
};
