import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import moment from 'moment';
import dateToCheck from '../models/DateToCheck.model';
import ticketForUser from '../models/Ticket.model';
import { RESPONSE_STATUS } from '../utils';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ResponseMessage } from '../utils/ResonseMessage';
import { responseModel } from '../utils/responseModel';

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
      .find({userId:req.body.thisUser._id})
      .sort({ DateIn: 'descending' });
    // Convert Date Time like 12:00 To UnixTime
    
    const diffFromNow = getTimeDiffFromNow(findTicketforUser.length  === 0 ? findTicket[0].dateIn :findTicketforUser[0].DateIn);
    
    const DateIn =  findTicket[0].dateIn.split(":")
    const dateIn = moment().set({ hour: Number(DateIn[0]) , minute: Number(DateIn[1]), second: 0 });
    const DateOut = findTicket[0].dateOut.split(":")
    // Get the Unix timestamp
    const dateOut = moment().set({ hour: Number(DateOut[0]) , minute: Number(DateOut[1]), second: 0 });
    const unixDateIn = dateIn.unix();
    const unixDateOut = dateOut.unix()
    // end of conversion
    let ticket;
    if (diffFromNow.asHours() >= 24 || findTicketforUser.length === 0) {
      ticket = await ticketForUser.create({
        userDateIn: [moment().unix()],
        DateIn: Number(unixDateIn),
        DateOut: Number(unixDateOut),
        userId: req.body.thisUser._id,
        
      });
    } else {
      const dateIn = findTicketforUser[0].userDateIn
      dateIn.push(moment().unix())
      console.log(dateIn)
      ticket = await ticketForUser.findByIdAndUpdate(findTicketforUser[0]._id,{
        "userDateIn": dateIn}, {new:true})
    }
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.CREATE_DATE_SUCCESS,
      ticket || {}
    );
    return res.status(200).json(response);
  } catch (error) {
    throw ErrorResponse(HttpStatusCode.BadRequest, 'Can not find your id');

    console.log(error);
    next(error);
  }
};

export const checkOutForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  try {
    const findTicketforUser: any = await ticketForUser
      .find({})
      .sort({ DateIn: 'descending' });
      console.log(findTicketforUser.length)
    if(findTicketforUser.length > 0)
    {
    // Convert Date Time like 12:00 To UnixTime
    const diffFromNow = getTimeDiffFromNow(findTicketforUser[0].DateIn);
    let ticket
    if (diffFromNow.asHours() >= 24) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Can not find your id');

    } else {
      const dateIn = findTicketforUser[0].userDateOut
      dateIn.push(moment().unix())
      ticket = await ticketForUser.findByIdAndUpdate(findTicketforUser[0]._id,{
        "userDateOut": dateIn}, {new:true})
    }
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.CREATE_DATE_SUCCESS,
      ticket || {}
    );
    return res.status(200).json(response);

  }else{
    return res.status(500).json({Data:"Do not find Your ID"})


  }

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
