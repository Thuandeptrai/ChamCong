import { AuthRquest } from './../interfaces/index';
import { axiosClientAuth } from './../services/axiosClient';

/* eslint-disable prefer-const */
import { NextFunction } from 'express';
import { Request, Response } from 'express';
import logging from '../config/logging';
import { callApiViettel } from '../middleware';
const NAME_SPACE = 'support';
import path from 'path';
import supportModel from '../models/support.model';
import UserModel from '../models/user.model';
import Roles from '../models/Roles';
import config from '../config/config';
import mongoose from 'mongoose';
import { createAction, updateActionHistory } from './actionHistory.controller';

const POST = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};



export const createTicketsSupportController = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'createTicketsSupportController');
    const userId = req.user?.id as unknown as mongoose.Types.ObjectId
    const lastname = req.user?.lastname
    const firstname = req.user?.firstname

    const { level, subject, body, user, dept_id } = req.body;
    
    const idUser : any = req?.user?.id
    let file1: any = req.files?.file;
    const attachments: any = [{ file: file1?.name }];
    const dataTicket = { dept_id, subject, body, attachments };
    if (req.files?.file) {
      let file: any = req.files?.file;
      file?.mv(
        path.join(__dirname, `../public/supports/${file?.name}`),
        (err: any) => {
          console.log(err);
        }
      );
    }
    const createActions = await createAction(`${firstname} ${lastname} Tạo ticket ${subject}`, userId,req.ip ,req.fingerprint )
    const updateHistory = await updateActionHistory(createActions?.id, 'success',`${firstname} ${lastname} Tạo thành công ticket ${subject}`)
    const result = (await supportModel.create({
      subject: subject,
      level: level,
      body: body,
      user: user,
      dept_id: dept_id,
      file: file1?.name,
      userId: idUser,
    })) as any;
    const getAdminRole = await Roles.find({roleName: config.role.admin})
    const admins = await UserModel.find({role: getAdminRole.map(item => item.id)})
    let socketAdminToEmit:string[] = []
    const adminSocketId = admins.forEach(item => {
      item.socketId.map(socket => {
        socketAdminToEmit.push(socket)
      })
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    _io.to(socketAdminToEmit).emit('new ticket is created', true)
    return res.status(200).json({ status: 1, data: result ,updateHistory});
  } catch (error) {
    logging.error(NAME_SPACE, 'Error asyncClientOrder', error);
    
    return res.status(500).json(error);
  }
};

export const getpagingSupportByUserId = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user?.id;
    logging.info(NAME_SPACE, 'getpagingTicketsSupportController');
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;
    let searchObj = {
      userId: user,
    } as any;
    if (req.query.search) {
      searchObj = {
        subject: { $regex: '.*' + req.query.search + '.*' },
        userId: user,
      };
    }
    if (req.query.supportUT) {
      searchObj = {
        level: req.query.supportUT,
      };
    }

    const data = await supportModel
      .find(searchObj)
      
      .populate({ path: 'dept_id', model: 'department', strictPopulate: false })
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize))
      .sort({
        createdAt: 'desc',
      });
    const count = await supportModel.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / Number(pageSize));
    return res.status(200).json({
      data: data,
      pageSize: pageSize,
      pageIndex: pageIndex,
      totalItem: count,
      totalPages: totalPages,
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getpagingTicketsSupportController', error);
    return res.status(500).json(error);
  }
};

export const getpagingSupport = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getpagingTicketsSupportController');
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;
    let searchObj = {};

    if (req.query.search) {
      searchObj = {
        subject: { $regex: '.*' + req.query.search + '.*' },
      };
    }

    if (req.query.level) {
      searchObj = {
        level: req.query.level,
      };
    }

    const data = await supportModel
      .find(searchObj)
      .populate({ path: 'dept_id', model: 'department', strictPopulate: false })
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize))

      .sort({
        createdAt: 'desc',
      });
    const count = await supportModel.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / Number(pageSize));
    return res.status(200).json({
      data: data,
      pageSize: pageSize,
      pageIndex: pageIndex,
      totalItem: count,
      totalPages: totalPages,
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getpagingTicketsSupportController', error);
    return res.status(500).json(error);
  }
};

export const getByIdSupport = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getpagingTicketsSupportController');
    const id = req.body.supportId;
    if (id) {
      let data = await supportModel.findById(id);
      const idUser = data?.userId;
      const user = await UserModel.findOne({ object_id: idUser });
      const dataRef = {
        ...data,
        email: user?.email,
      } as any;

      return res.status(200).json(dataRef);
    }
    res.status(404).json({
      status: 0,
      messega: 'id not found!',
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getpagingTicketsSupportController', error);
    return res.status(500).json(error);
  }
};

export const updateSupport = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {

    logging.info(NAME_SPACE, 'updateTicketsSupportController');
    const id =req.params.id
    const userId = req.user?.id as unknown as mongoose.Types.ObjectId
    const lastname = req.user?.lastname
    const firstname = req.user?.firstname
    
    const dataOne = await supportModel.findOne({id: id})
    const createActions = await createAction(`${firstname} ${lastname} Cập nhật ${dataOne?.subject}`, userId ,req.ip ,req.fingerprint)
    const newSupport = { updateTime: Date.now(), ...req.body };
    if (req.params.id) {
      const updateHistory = await updateActionHistory(createActions?.id, 'success',`${firstname} ${lastname} Cập nhật thành công ticket ${dataOne?.subject}`)
      const updateSupport = await supportModel.findOneAndUpdate(
        { _id: req.params.id },
        newSupport
      );
      return res.status(200).json({
        status: 1,
        data: updateSupport,
        updateHistory
      });
    }
    const updateHistory = await updateActionHistory(createActions?.id, 'success',`${firstname} ${lastname} Cập nhật không thành công ticket ${dataOne?.subject}`)
    return res.status(404).json({
      status: 0,
      messeage: 'Id not found!',
      updateHistory
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error updateTicketsSupportController', error);
    return res.status(500).json(error);
  }
};
