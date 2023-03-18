import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import Joi, { any, number } from 'joi';
import moment from 'moment';
import dateToCheck from '../models/DateToCheck.model';
import ticketForUser from '../models/Ticket.model';
import { RESPONSE_STATUS } from '../utils';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ResponseMessage } from '../utils/ResonseMessage';
import { responseModel } from '../utils/responseModel';
import workRecordForUser from '../models/workList.model';
import salaryByMonth from '../models/salaryByMonth.model';
import { calculateWorkDate } from '../utils/calculatedate';

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
    const getCurrentMonth = moment().month()
    const getCurrentYear = moment().year()
    const getCurrentDay = moment().date()
    const getdate = calculateWorkDate(getCurrentMonth, getCurrentYear)
    const findTicket: any = await dateToCheck.find({});
    const findTicketforUser: any = await ticketForUser
      .find({ userId: req.body.thisUser._id })
      .sort({ DateIn: 'descending' });

    // Convert Date Time like 12:00 To UnixTime
    const findWorkByMonth = await salaryByMonth.find({ userId: req.body.thisUser._id }).sort({ month: 'descending' })
    if (findWorkByMonth.length !== 0) {
      if (Number(getCurrentMonth) !== Number(findWorkByMonth[0].month) && Number(getCurrentYear) === Number(findWorkByMonth[0].year)) {
        await salaryByMonth.create({
          month: getCurrentMonth,
          year: getCurrentYear,
          totalWorkInMonth: 0,
          salaryOfUser: 0,
          userId: req.body.thisUser._id,
          rateWorkByMonth: getdate


        })
      }
    } else {
      await salaryByMonth.create({
        month: getCurrentMonth,
        year: getCurrentYear,
        totalWorkInMonth: 0,
        salaryOfUser: 0,
        userId: req.body.thisUser._id,
        rateWorkByMonth: getdate
      })
    }

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
      const dateOut = findTicketforUser[0].userDateOut;
      if (dateIn.length === dateOut.length) {
        dateIn.push(moment().unix());

        ticket = await ticketForUser.findByIdAndUpdate(
          findTicketforUser[0]._id,
          {
            userDateIn: dateIn,
          },
          { new: true }
        );
      }
    }
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.CREATE_DATE_SUCCESS,
      ticket || findTicketforUser[0]
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
    const getCurrentMonth = moment().month()
    const getCurrentYear = moment().year()
    const findTicketforUser: any = await ticketForUser
      .find({ userId: req.body.thisUser._id })
      .sort({ DateIn: 'descending' }).populate('userId');
    const findWorkRecord: any = await workRecordForUser
      .find({ userId: req.body.thisUser._id }).sort({ dateWork: 'descending' }).populate('userId');
    const leisureTimeStart = findTicketforUser[0].leisureTimeStart.split(':');
    const leisureTimeEnd = findTicketforUser[0].leisureTimeEnd.split(':');

    let setLeisureTimeStart: any = moment()
      .set({
        hour: Number(leisureTimeStart[0]),
        minute: Number(leisureTimeStart[1]),
        second: 0,
      })
      .unix();
    let setLeisureTimeEnd: any = moment()
      .set({
        hour: Number(leisureTimeEnd[0]),
        minute: Number(leisureTimeEnd[1]),
        second: 0,
      })
      .unix();

    if (findTicketforUser.length > 0) {
      // Convert Date Time like 12:00 To UnixTime
      const diffFromNow = getTimeDiffFromNow(findTicketforUser[0].DateIn);
      let ticket;
      if (diffFromNow.asHours() >= 24) {
        throw ErrorResponse(HttpStatusCode.BadRequest, 'Can not find your id');
      } else {
        const dateIn = findTicketforUser[0].userDateOut;
        const dateOut = findTicketforUser[0].userDateIn;

        if (dateIn.length + 1 === dateOut.length) {

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
                  moment1 = setLeisureTimeEnd;
                } else {
                  moment1 = 0;
                  moment2 = 0;
                }
              } else if (
                moment2 >= setLeisureTimeStart &&
                moment2 <= setLeisureTimeEnd
              ) {
                moment2 = setLeisureTimeStart;
              }
              if (moment1 !== 0 && moment2 !== 0) {
                if (
                  moment1 <= setLeisureTimeStart &&
                  moment2 >= setLeisureTimeEnd
                ) {
                  setLeisureTimeStart = moment.unix(setLeisureTimeStart as any);
                  setLeisureTimeEnd = moment.unix(setLeisureTimeEnd as any);
                  diffInHours =
                    diffInHours -
                    moment
                      .duration(setLeisureTimeEnd.diff(setLeisureTimeStart))
                      .asHours();
                }
                moment1 = moment.unix(moment1 as any);
                moment2 = moment.unix(moment2 as any);

                diffInHours =
                  diffInHours +
                  Number(moment.duration(moment2.diff(moment1)).asHours());
              }
            }
          }
          await salaryByMonth.findOneAndUpdate({ userId: req.body.thisUser._id, month: getCurrentMonth, year: getCurrentYear }, {

          })
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
        const getSalaryByMonth = await salaryByMonth.findOne({userId: req.body.thisUser._id, month: getCurrentMonth, year: getCurrentYear})
       
        await salaryByMonth.findOneAndUpdate({userId: req.body.thisUser._id, month: getCurrentMonth, year: getCurrentYear}, {
            month: diffInHours >= 8 ?  Number(getSalaryByMonth?.totalWorkInMonth)+1 :  getSalaryByMonth?.totalWorkInMonth 
        })
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