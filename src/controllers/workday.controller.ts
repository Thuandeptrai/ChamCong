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
    const getAllWorkDay = await ticketForUser.find({ userId: UserId }).sort({DateIn: 'descending'});
    const s = '3'
      const regex = new RegExp(s, 'i') 
    const getWorkday : any = await  workRecordForUser.find({ "month": { "$regex": regex }, userId: UserId})
    console.log(getWorkday)
   const  response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get WorkDay User Success',
      getAllWorkDay,
      undefined,
      getWorkday
    );
    return res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
