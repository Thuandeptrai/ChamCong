import { Request, Response, NextFunction } from 'express';
import PaymentMethodModel from '../models/paymentMethod.model';
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

const NAME_SPACE = 'Payment Method';

export const syncDataPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'syncDataPaymentMethod');

    const allPaymentMethods = await callApiViettel({
      call: 'getPaymentModules',
    });

    const paymentMethods = Object.entries(allPaymentMethods?.modules).map(
      (item: any) => {
        const temp = {
          object_id: item[0],
          name: item[1],
        };

        return temp;
      }
    );

    await PaymentMethodModel.remove({});

    await PaymentMethodModel.insertMany(paymentMethods);

    return res.status(200).json({
      status: RESPONSE_STATUS.SUCCESS,
      allOrderPages: paymentMethods,
      message:
        'Sync data payment method from Manager idcviettel to my database',
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error syncDataPaymentMethod', error);
    return res.status(500).json(error);
  }
};

export const getAllPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getAllPaymentMethods');

    const result = await PaymentMethodModel.find();

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get all payment methods',
      result
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getAllPaymentMethods', error);
    return res.status(500).json(error);
  }
};
