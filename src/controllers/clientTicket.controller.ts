import { Request, Response, NextFunction } from 'express';
import logging from "../config/logging";
import { callApiViettel } from '../middleware';
import clientTicketsModel from '../models/clientTickets.model';
import { RESPONSE_STATUS } from '../utils';


const NAME_SPACE = 'clientTicket';
export const syncClientTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'clientTicket');
    await clientTicketsModel.remove({})
    const allClientTickets = await callApiViettel({
        call: 'getTickets'
    })
    
    const data = clientTicketsModel.insertMany(allClientTickets?.tickets)
    

    return res.status(200).json({
        status: RESPONSE_STATUS.SUCCESS,
        data: data,
        message: 'Sync data ticket from Manager idcviettel to my database',
      });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error clientTicket', error);
    return res.status(500).json(error);
  }
};

export const getpagingClientTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'clientTicket');
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;
    let searchObj = {
        // client_id:  user
    } as any;
    if (req.query.search) {
    
      searchObj = {
        module: { $regex: '.*' + req.query.search + '.*' },
        // client_id:  user,
      } ;
    }
    const data = await clientTicketsModel
      .find(searchObj)
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize))
      .sort({
        createdAt: 'desc',
      });
    const count = await clientTicketsModel.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / Number(pageSize));
    return res.status(200).json({
      data: data,
      pageSize: pageSize,
      pageIndex: pageIndex,
      totalItem: count,
      totalPages: totalPages,
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error clientTicket', error);
    return res.status(500).json(error);
  }
};