import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import dateToCheck from '../models/DateToCheck.model';
import { RESPONSE_STATUS } from '../utils';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ResponseMessage } from '../utils/ResonseMessage';
import { responseModel } from '../utils/responseModel';

export const createDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    dateIn: Joi.string(),
    lateDate: Joi.string(),
    leisureTimeStart: Joi.string(),
    leisureTimeEnd: Joi.string(),
    dateOut: Joi.string(),
  });

  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }
    const TicketCount = await dateToCheck.count({});
    if (TicketCount < 1) {
      const ticket = await dateToCheck.create(req.body);
      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.CREATE_DATE_SUCCESS,
        ticket
      );
      return res.status(200).json(response);
    } else {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'You can not create');
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`dfkjhasjkhe`)
  const schema = Joi.object({
    dateIn: Joi.string(),
    lateDate: Joi.string(),
    leisureTimeStart: Joi.string(),
    leisureTimeEnd: Joi.string(),
    dateOut: Joi.string(),
  });
  const id = req.params.DateId;
  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }
    const ticket = await dateToCheck.findByIdAndUpdate(id, req.body, {
      new: true,
    });
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

export const getAllDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    dateIn: Joi.string(),
    lateDate: Joi.string(),
    leisureTimeStart: Joi.string(),
    leisureTimeEnd: Joi.string(),
    dateOut: Joi.string(),
  });
  const id = req.params.DateId;
  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }
    const ticket = await dateToCheck.find({})
    console.log('ticket:', ticket)
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
