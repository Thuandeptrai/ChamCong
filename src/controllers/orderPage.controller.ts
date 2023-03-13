import { Request, Response, NextFunction } from 'express';
import OrderPageModel from '../models/orderPage.model';
import logging from '../config/logging';
import {
  convertDataToSyncData,
  ID_STATUS,
  RESPONSE_STATUS,
  SORT,
  VISIBLE,
} from '../utils';
import { callApiViettel } from '../middleware';
import { responseModel } from '../utils/responseModel';

const NAME_SPACE = 'OrderPage';

export const syncDataOrderPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'syncDataOrderPage');

    const allOrderPagesParent = await callApiViettel({
      call: 'getOrderPages',
    });

    const { categories } = allOrderPagesParent;

    const subCategories = await Promise.all(
      categories.map(async (item: any) => {
        const subCategory = await callApiViettel({
          call: 'getSubCategories',
          id: item?.id,
        });
        const { subcategories } = subCategory;

        return subcategories || [];
      })
    );

    await OrderPageModel.remove({});
    const allOrderPagesChild: any[] = [];

    subCategories.forEach((item: any[]) => {
      allOrderPagesChild.push(...item);
    });

    const dataToAdd = convertDataToSyncData(
      categories.concat(allOrderPagesChild)
    );
    await OrderPageModel.insertMany(dataToAdd);

    return res.status(200).json({
      status: RESPONSE_STATUS.SUCCESS,
      allOrderPages: dataToAdd,
      message: 'Sync data order page from Manager idcviettel to my database',
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error syncDataOrderPage', error);
    return res.status(500).json(error);
  }
};

export const getOrderPagesToShow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getOrderPagesToShow');

    const result = await OrderPageModel.aggregate([
      {
        $match: {
          parent_id: ID_STATUS.NONE,
          visible: VISIBLE.SHOW,
        },
      },
      {
        $sort: {
          sort_order: SORT.UP,
        },
      },
    ]);

    return res.status(200).json({
      status: RESPONSE_STATUS.SUCCESS,
      data: result,
      message: 'Get order pages to show',
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getOrderPagesToShow', error);
    return res.status(500).json(error);
  }
};

export const getSubOrderPagesByParent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getSubOrderPagesByParent');

    const { slug } = req.params;

    let response = responseModel(RESPONSE_STATUS.FAILED, 'Not found data', []);
    if (!slug) {
      return res.status(400).json(response);
    }

    const result = await OrderPageModel.aggregate([
      {
        $lookup: {
          from: 'orderPages',
          localField: 'parent_id',
          foreignField: 'object_id',
          as: 'parent',
        },
      },
      {
        $unwind: '$parent',
      },
      {
        $match: {
          'parent.slug': slug,
          visible: VISIBLE.SHOW,
        },
      },
      {
        $sort: {
          sort_order: SORT.UP,
        },
      },
      {
        $project: {
          _id: 0,
          object_id: 1,
          parent_id: 1,
          name: 1,
          description: 1,
          slug: 1,
        },
      },
    ]);

    response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get sub order pages by parent',
      result as any
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getSubOrderPagesByParent', error);
    return res.status(500).json(error);
  }
};
