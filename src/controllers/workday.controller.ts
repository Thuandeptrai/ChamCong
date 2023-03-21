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
  let UserId = req.params.userId;
  
  if(req.body.thisUser.isAdmin !== "True")
  {

    UserId = req.body.thisUser._id
  }else{
    if(UserId === "undefined")
    {
    UserId = req.body.thisUser._id

    }
  }
  
  try {
    const getAllWorkDay = await ticketForUser
      .find({userId: UserId})
      .sort({ DateIn: 'descending' });
    const getWorkday: any = await workRecordForUser.find({
       userId: UserId,
    });
    console.log(getWorkday);
    const response = responseModel(
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
