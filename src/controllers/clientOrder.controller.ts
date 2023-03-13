import { axiosClient, axiosClientNonAuth } from './../services/axiosClient';
import { AuthRquest } from './../interfaces/index';
import { NextFunction, Request, Response } from 'express';
import logging from '../config/logging';
import { callApiViettel } from '../middleware';
import clientOrdersModel from '../models/clientOrders.model';
import { convertDataToSyncData } from '../utils';
const NAME_SPACE = 'clientOrder';

export const asyncClientOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'asyncClientOrder');
    const allClient = await callApiViettel({
      call: 'getClients',
    });
    const addId = [] as any;
    allClient?.clients?.map((item: any) => {
      const a = {
        id: item?.id,
      };
      addId.push(a);
    });

    addId.map(async (item: any) => {
      const allListClientOrder =
        await axiosClient.get(`/api.php?api_id=0d9687d614d03f5c62fa&api_key=957ee008ea71470c0830&call=getClientOrders&id=${item?.id}
       `);
      const addData = Object.values(allListClientOrder.data.orders);
      return await clientOrdersModel.insertMany(addData);
    });
    return res.status(200).json();
  } catch (error) {
    logging.error(NAME_SPACE, 'Error asyncClientOrder', error);
    return res.status(500).json(error);
  }
};

export const getpagingClientOrder = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    // const user = req.user?.object_id 
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
    const data = await clientOrdersModel
      .find(searchObj)
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize))
      .sort({
        createdAt: 'desc',
      });
    const count = await clientOrdersModel.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / Number(pageSize));
    return res.status(200).json({
      data: data,
      pageSize: pageSize,
      pageIndex: pageIndex,
      totalItem: count,
      totalPages: totalPages,
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getpagingClientOrder', error);
    return res.status(500).json(error);
  }
};
