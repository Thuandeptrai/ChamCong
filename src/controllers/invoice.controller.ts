import logging from '../config/logging';
import { Request, Response, NextFunction, response } from 'express';
import InvoiceModel from '../models/invoice.model';
import { AuthRquest } from '../interfaces';
import { responseModel } from '../utils/responseModel';
import { convertDataToSyncData, RESPONSE_STATUS } from '../utils';
import { axiosClientAuth } from '../services/axiosClient';
import { callApiViettel } from '../middleware';
const NAME_SPACE = 'Invoice';

export const syncDataInvoice = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'syncDataInvoice');
    const { accesstoken, client_id } = req.user as any;

    const invoiceReq = await axiosClientAuth(accesstoken).get('/invoice');

    const { invoices } = invoiceReq.data;

    const dataToAdd = convertDataToSyncData(
      invoices.map((item: any) => ({
        ...item,
        client_id,
      }))
    );

    await InvoiceModel.remove({});

    await InvoiceModel.insertMany(dataToAdd);

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Sync data invoice from viettel to database',
      dataToAdd as any
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error syncDataInvoice', error);
    return res.status(500).json(error);
  }
};

export const getAllInvoices = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getAllInvoices');
    const { client_id, accesstoken } = req.user as any;

    // const result = await InvoiceModel.find({
    //   client_id: Number(client_id || 0),
    // });

    const result = await axiosClientAuth(accesstoken).get('/invoice');

    const { invoices } = result.data;

    const dataToAdd = convertDataToSyncData(
      invoices.map((item: any) => ({
        ...item,
        client_id,
      }))
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get all Invoices',
      dataToAdd as any
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getAllInvoices', error);
    return res.status(500).json(error);
  }
};

export const getInvoiceById = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getInvoiceById');
    const { id } = req.params;
    const { client_id, accesstoken } = req.user as any;

    const result = await axiosClientAuth(accesstoken).get(`/invoice/${id}`);

    const { invoice } = result?.data;

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get Invoice Detail',
      invoice as any
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getInvoiceById', error);
    return res.status(500).json(error);
  }
};

export const getInvoiceForDetail = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getInvoiceForDetail');
    const { id } = req.params;
    const { accesstoken } = req.user as any;

    const result = await axiosClientAuth(accesstoken).get(`/invoice/${id}`);

    const { invoice } = result?.data;

    const findTransaction = async (page: number) => {
      const data = await callApiViettel({
        call: 'getTransactions',
        page,
      });

      const { transactions, sorter } = data;
      return {
        transaction: transactions?.find((item: any) => {
          return item?.invoice_id === id;
        }),
        sorterrecords: sorter?.sorterrecords,
      };
    };

    let i = 0;
    let transaction = null;
    let sorterrecords = 0;
    if (invoice?.status === 'Paid') {
      while (!transaction && sorterrecords >= 25 * i) {
        const temp = await findTransaction(i);

        transaction = temp?.transaction;
        sorterrecords = Number(temp?.sorterrecords);

        i++;
      }
    }

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get Invoice Detail',
      {
        invoice,
        transaction,
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getInvoiceForDetail', error);
    return res.status(500).json(error);
  }
};

export const getInvoicesByClient = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getInvoicesByClient');
    const { client_id, accesstoken } = req.user as any;

    // const allServices = [];
    // let i = 0;
    // let sorterrecords = 0;
    // let count = 0;

    // while (count === 0 || (count > 0 && sorterrecords > allServices?.length)) {
    //   const invoicesReq = await callApiViettel({
    //     call: 'getClientInvoices',
    //     id: client_id,
    //     page: i,
    //   });

    //   const { sorterrecords: records } = invoicesReq?.sorter;

    //   sorterrecords = Number(records);
    //   allServices.push(...(invoicesReq?.invoices || []));
    //   i++;
    //   count++;
    // }

    const invoiceReq = await axiosClientAuth(accesstoken).get('/invoice');

    const { invoices } = invoiceReq?.data;

    const result = await Promise.all(
      invoices?.map(async (item: any) => {
        const invoiceReq = await axiosClientAuth(accesstoken).get(
          `/invoice/${item?.id}`
        );

        const { invoice } = invoiceReq.data;

        return invoice;
      })
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get all Invoices by client',
      result
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getInvoicesByClient', error);
    return res.status(500).json(error);
  }
};
