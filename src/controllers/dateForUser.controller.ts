import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import Joi, { number } from 'joi';
import moment from 'moment';
import dateToCheck from '../models/DateToCheck.model';
import ticketForUser from '../models/Ticket.model';
import { RESPONSE_STATUS } from '../utils';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ResponseMessage } from '../utils/ResonseMessage';
import { responseModel } from '../utils/responseModel';
import workRecordForUser from '../models/workList.model';

function getTimeDiffFromNow(unixTimestamp: number): moment.Duration {
  const now = moment();
  const timestampMoment = moment.unix(unixTimestamp);
  return moment.duration(now.diff(timestampMoment));
}
function inRange(x: any, min: any, max: any) {
  return x >= min && x <= max;
}

export const createDateForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const findTicket: any = await dateToCheck.find({});
    const findTicketforUser: any = await ticketForUser
      .find({ userId: req.body.thisUser._id })
      .sort({ DateIn: 'descending' });
    // Convert Date Time like 12:00 To UnixTime

    const diffFromNow = getTimeDiffFromNow(
      findTicketforUser.length === 0
        ? findTicket[0].dateIn
        : findTicketforUser[0].DateIn
    );

    const DateIn = findTicket[0].dateIn.split(':');
    const dateIn = moment().set({
      hour: Number(DateIn[0]),
      minute: Number(DateIn[1]),
      second: 0,
    });
    const DateOut = findTicket[0].dateOut.split(':');
    // Get the Unix timestamp
    const dateOut = moment().set({
      hour: Number(DateOut[0]),
      minute: Number(DateOut[1]),
      second: 0,
    });
    const unixDateIn = dateIn.unix();
    const unixDateOut = dateOut.unix();
    // end of conversion
    let ticket;
    let workRecord;
    if (diffFromNow.asHours() >= 24 || findTicketforUser.length === 0) {
      ticket = await ticketForUser.create({
        userDateIn: [moment().unix()],
        DateIn: Number(unixDateIn),
        DateOut: Number(unixDateOut),
        lateDate: findTicket[0].lateDate,
        leisureTimeStart: findTicket[0].leisureTimeStart,
        leisureTimeEnd: findTicket[0].leisureTimeEnd,
        userId: req.body.thisUser._id,
      });
      const currentTime = moment().format('DD/MM/YY');

      workRecord = await workRecordForUser.create({
        dateWork: moment().unix(),
        workHour: 0,
        userId: req.body.thisUser._id,
        month: currentTime,
        isEnough: false,
      });
    } else {
      const dateIn = findTicketforUser[0].userDateIn;
      dateIn.push(moment().unix());
      ticket = await ticketForUser.findByIdAndUpdate(
        findTicketforUser[0]._id,
        {
          userDateIn: dateIn,
        },
        { new: true }
      );
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
      .find({ userId: req.body.thisUser._id })
      .sort({ DateIn: 'descending' });
    const findWorkRecord: any = await workRecordForUser
      .find({ userId: req.body.thisUser._id })
      .sort({ dateWork: 'descending' });
    const leisureTimeStart = findTicketforUser[0].leisureTimeStart.split(':');
    const leisureTimeEnd = findTicketforUser[0].leisureTimeEnd.split(':');

    const setLeisureTimeStart = moment()
      .set({
        hour: Number(leisureTimeStart[0]),
        minute: Number(leisureTimeStart[1]),
        second: 0,
      })
      .unix();
    const setLeisureTimeEnd = moment()
      .set({
        hour: Number(leisureTimeEnd[0]),
        minute: Number(leisureTimeEnd[1]),
        second: 0,
      })
      .unix();
    console.log(' Start', setLeisureTimeStart);
    console.log('end', setLeisureTimeEnd);
    if (findTicketforUser.length > 0) {
      // Convert Date Time like 12:00 To UnixTime
      const diffFromNow = getTimeDiffFromNow(findTicketforUser[0].DateIn);
      let ticket;
      if (diffFromNow.asHours() >= 24) {
        console.log('asdasd');
        throw ErrorResponse(HttpStatusCode.BadRequest, 'Can not find your id');
      } else {
        const dateIn = findTicketforUser[0].userDateOut;

        dateIn.push(moment().unix());
        let diffInHours = 0;
        for (let i = 0; i < findTicketforUser[0].userDateIn.length; i++) {
          if (dateIn[i] !== undefined) {
            let moment1: any = findTicketforUser[0].userDateIn[i]; // Convert Unix timestamp to Moment.js object
            let moment2: any = dateIn[i];

            if (
              moment1 >= setLeisureTimeStart &&
              moment1 <= setLeisureTimeEnd
            ) {
              if (moment2 >= setLeisureTimeEnd) {
                moment1 = setLeisureTimeEnd
              }else{
                moment1 =0 
                moment2= 0
              }
            } else if (
              moment2 >= setLeisureTimeStart &&
              moment2 <= setLeisureTimeEnd
            ) {
              moment2 = setLeisureTimeStart
            }
           
            diffInHours =
              diffInHours +
              Number(moment.duration(moment2.diff(moment1)).asHours());
          }
        }

        await workRecordForUser.findOneAndUpdate(
          {
            userId: req.body.thisUser._id,
            dateWork: findWorkRecord[0].dateWork,
          },
          {
            workHour: diffInHours,
            isEnough: diffInHours >= 8 ? true : false,
          }
        );
        ticket = await ticketForUser.findByIdAndUpdate(
          findTicketforUser[0]._id,
          {
            userDateOut: dateIn,
          },
          { new: true }
        );
      }
      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.CREATE_DATE_SUCCESS,
        ticket || {}
      );
      return res.status(200).json(response);
    } else {
      return res.status(500).json({ Data: 'Do not find Your ID' });
    }
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
  try {
    if (req.body.thisUser.isAdmin === 'True') {
      const findTicketforUser: any = await ticketForUser
        .find({})
        .sort({ DateIn: 'descending' });
      const count = await ticketForUser.find({}).count();
      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.CREATE_DATE_SUCCESS,
        findTicketforUser,
        count
      );
      return res.status(200).json(response);
    } else {
      const findTicketforUser: any = await ticketForUser
        .find({ userId: req.body.thisUser._id })
        .sort({ DateIn: 'descending' });
      const count = await ticketForUser
        .find({ userId: req.body.thisUser._id })
        .count();

      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.CREATE_DATE_SUCCESS,
        findTicketforUser,
        count
      );
      return res.status(200).json(response);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
