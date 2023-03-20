import { NextFunction, Request, Response } from 'express';
import ticketForUser from '../models/Ticket.model';
import { RESPONSE_STATUS } from '../utils';
import { responseModel } from '../utils/responseModel';
import { ObjectId } from 'mongodb';
import workRecordForUser from '../models/workList.model';

export const getWorkDayByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const UserId = req.params.userId;
  try {
    const getAllWorkDay = await ticketForUser.find({ userId: UserId });
    const getWorkday = await  workRecordForUser.findOne({dateWork:getAllWorkDay})
    console.log(getAllWorkDay)
   const  response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get WorkDay User Success',
      getAllWorkDay
    );
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
