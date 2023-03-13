import { NextFunction, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import logging from '../config/logging';
import { GenerateRandomString } from '../helpers/generateRandomString';
import { AuthRquest } from '../interfaces';
import ActionHistory from '../models/ActionHistory';
import DepartmentModel from '../models/department.model';
import { createAction, updateActionHistory } from './actionHistory.controller';

const NAME_SPACE = 'department';
export const createDepartmentController = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log(req.fingerprint  );
    // return
    
    logging.info(NAME_SPACE, 'create department Controller');
    // eslint-disable-next-line @typescript-eslint/ban-types
    const userId = req.user?.id as unknown as mongoose.Types.ObjectId
    const lastname = req.user?.lastname
    const firstname = req.user?.firstname
    const code = GenerateRandomString();
    const name = req.body.name;
    const createAction1 : any = await createAction(`${firstname} ${lastname} Tạo mới ${name}`, userId,req.ip ,req.fingerprint)
    const check = await DepartmentModel.findOne({ name: name });
    if (!check) {
      const updateHistory = await updateActionHistory(createAction1.id, 'success',`${firstname} ${lastname} Tạo mới thành công ${name}`)
      const result = await DepartmentModel.create({
        ...req.body,
        code: code,
      });
      return res.status(200).json({
        status: 1,
        data: result,
        updateHistory
      });
    }
    const updateHistoryField = await updateActionHistory(createAction1.id, 'failed',`${firstname} ${lastname} Tạo mới không thành công ${name}`)
    return res.status(404).json({
      status: 0,
      message: 'name Department already exists!',
      updateHistoryField
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error create department Controller', error);
    return res.status(500).json(error);
  }
};

export const getpagingDepartmentController = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getpaging department Controller');
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;
    
    let searchObj = {} as any;
    if (req.query.search) {
      searchObj = {
        name: { $regex: '.*' + req.query.search + '.*' },
      };
    }
    const data = await DepartmentModel.find(searchObj)
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize))
      .sort({
        createdAt: 'desc',
      });

    const count = await DepartmentModel.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / Number(pageSize));
    return res.status(200).json({
      data: data,
      pageSize: pageSize,
      pageIndex: pageIndex,
      totalItem: count,
      totalPages: totalPages,
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getpaging department Controller', error);
    return res.status(500).json(error);
  }
};

export const deleteDepartmentController = async (
  req: AuthRquest,
  res: Response
) => {
  try {
    logging.info(NAME_SPACE, 'delete department Controller');
    const id = req.params.id;
    const userId = req.user?.id as unknown as mongoose.Types.ObjectId
    const lastname = req.user?.lastname
    const firstname = req.user?.firstname
    const data1= await DepartmentModel.findById(id)
   
    const createActions = await createAction(`${firstname} ${lastname} Xóa ${data1?.name}`, userId ,req.ip ,req.fingerprint)
    if (id) {
      const data = await DepartmentModel.findByIdAndDelete(id);
      const updateHistory = await updateActionHistory(createActions?.id, 'success',`${firstname} ${lastname} Xóa thành công ${data1?.name}`)
      return res.status(200).json({
        data,
        status: 1,
        updateHistory
      });
    }
    const updateHistory = await updateActionHistory(createActions?.id, 'failed',`${firstname} ${lastname} Xóa không thành công ${data1?.name}`)
    return res.status(404).json({
      status: 0,
      message: 'Id not found!',
      updateHistory
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error delete department Controller', error);
    return res.status(500).json(error);
  }
};

export const updateDepartmentController = async (
  req: AuthRquest,
  res: Response
) => {
  try {
    logging.info(NAME_SPACE, 'update department Controller');
    const id = req.params.id;
    const name = req.body.name;
    const userId = req.user?.id as unknown as mongoose.Types.ObjectId
    const lastname = req.user?.lastname
    const firstname = req.user?.firstname
    const createActions = await createAction(`${firstname} ${lastname} Cập nhật ${name}`, userId ,req.ip ,req.fingerprint)
    if (id) {
      const updateHistory = await updateActionHistory(createActions?.id, 'success',`${firstname} ${lastname} Cập nhật thành công ${name}`)
      const update = await DepartmentModel.findOneAndUpdate(
        {
          _id: id,
        },
        { name: name }
      );

      return res.status(200).json({
        status: 1,
        data: update,
        updateHistory
      });
    }
    const updateHistory = await updateActionHistory(createActions?.id, 'failed',`${firstname} ${lastname} Xóa thành công ${name}`)
    return res.status(404).json({
      status: 0,
      message: 'Id not found !',
      updateHistory
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error update department Controller', error);
    return res.status(500).json(error);
  }
};


export const getbyIdDepartmentController = async (
    req: AuthRquest,
    res: Response,
    
) =>{
    try {
      logging.info(NAME_SPACE, 'getbyId department Controller');
        const id = req.params.id
       if(id){
            const result = await DepartmentModel.findById(id)
            return res.status(200).json({
                data: result,
                status: 1
            })
       }
        return res.status(404).json(
            {
                status: 0,
                message: 'Id not found!'
            }
        )
        
    } catch (error) {
        logging.error(NAME_SPACE, 'Error update department Controller', error);
        return res.status(500).json(error);
    }
}

export const getAllDepartmentController = async(
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getAll department Controller');
    const data = await DepartmentModel.find()
    return res.status(200).json({
      status: 1,
      data: data
    })
    
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getAll department Controller', error);
        return res.status(500).json(error);
  }
}