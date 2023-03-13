import { axiosClientAuth } from './../services/axiosClient';
import { Request, Response, NextFunction } from 'express';
import logging from '../config/logging';
import servicesModel from '../models/services.model';
import {
  FORM_CREATE_NEW_SERVICE,
  removeUndefinedProperties,
  RESPONSE_STATUS,
  SUB_ORDER_PAGE_ID,
} from '../utils';
import { responseModel } from '../utils/responseModel';
import { AuthRquest } from '../interfaces';
import querystring from 'querystring';
import { callApiViettel } from '../middleware';
import ListVMSModel from '../models/ListVMS.model';
import { delay } from '../helpers/delay';
import config from '../config/config';

const NAME_SPACE = 'service';

export const syncService = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'syncService');
    const { client_id } = req.user as any;

    await servicesModel.deleteMany({
      client_id,
    });

    const allService = await axiosClientAuth(req.user?.accesstoken)(`/service`);
    const data = allService?.data?.services;

    const addData = [] as any;
    data.map((item: any) => {
      const a = {
        service_id: item?.id,
        domain: item?.domain,
        total: item?.total,
        firstpayment: item?.firstpayment,
        status: item?.status,
        billingcycle: item?.billingcycle,
        next_due: item?.next_due,
        expires: item?.expires,
        next_invoice: item?.next_invoice,
        category: item?.category,
        category_url: item?.category_url,
        name: item?.name,
        client_id,
      };
      addData.push(a);
    });
    await servicesModel.insertMany(addData);
    return res.status(200).json();
  } catch (error) {
    logging.error(NAME_SPACE, 'Error syncService', error);
    return res.status(500).json(error);
  }
};

// export const getpagingService = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     //getpaging
//     const pageSize = req.query.pageSize || 10;
//     const pageIndex = req.query.pageIndex || 1;
//     let searchObj = {};
//     if (req.query.search) {
//       searchObj = {
//         name: { $regex: '.*' + req.query.search + '.*' },
//       };
//     }

//     const service = await servicesModel
//       .find(searchObj)
//       .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
//       .limit(Number(pageSize))
//       .sort({
//         createdAt: 'desc',
//       });

//     const count = await servicesModel.find(searchObj).countDocuments();
//     const totalPages = Math.ceil(count / Number(pageSize));
//     return res.status(200).json({
//       data: service,
//       pageSize: pageSize,
//       pageIndex: pageIndex,
//       totalItem: count,
//       totalPages: totalPages,
//     });
//   } catch (error) {
//     logging.error(NAME_SPACE, 'Error syncServiceTemplate', error);
//     return res.status(500).json(error);
//   }
// };

// Tạo service. Chuyển từ req.body thành formData để request đến ViettelAPI tạo

export const createNewService = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product_id, domain, cycle, pay_method, os, type, dataCustom } =
      req.body;

    let response = responseModel(
      RESPONSE_STATUS.FAILED,
      'Information for create service is wrong',
      []
    );

    const { accesstoken, client_id } = req.user as any;

    const productDetail = await axiosClientAuth(accesstoken).get(
      `/order/${product_id}`
    );

    const { product } = productDetail?.data;

    if (!product) {
      response = responseModel(
        RESPONSE_STATUS.FAILED,
        'Product is not found',
        []
      );

      return res.status(400).json(response);
    }

    if (!domain || !cycle || !pay_method || !os || !type) {
      response = responseModel(
        RESPONSE_STATUS.FAILED,
        'Information is wrong',
        []
      );
      return res.status(400).json(response);
    }

    const { forms } = product?.config;
    const osItem = (forms as any[])?.find(
      (item) => item?.title === FORM_CREATE_NEW_SERVICE.OS_TEMPLATE
    );

    const templateId = osItem?.items?.find(
      (item: any) => item?.title === os
    )?.id;

    let payload: any = {
      domain: domain,
      cycle: cycle,
      pay_method: pay_method,
      [osItem?.name]: templateId,
    };

    if (!templateId) {
      response = responseModel(
        RESPONSE_STATUS.FAILED,
        'OS Template is not exist',
        []
      );
      return res.status(400).json(response);
    }

    if (type === 'custom') {
      if (!dataCustom) {
        response = responseModel(
          RESPONSE_STATUS.FAILED,
          'Information is wrong',
          []
        );

        return res.status(400).json(response);
      }
      dataCustom.forEach((value: string) => {
        const [value1, value2] = value.split(': ');
        payload = {
          ...payload,
          [value1]: Number(value2),
        };
      });
    }
    const user = await callApiViettel({
      call: 'getClientDetails',
      id: client_id,
    });

    const { credit } = user?.client;

    if (!credit) {
      response = responseModel(RESPONSE_STATUS.FAILED, 'User is not found', []);

      return res.status(400).json(response);
    }

    const body = querystring.stringify(payload);

    const result = await axiosClientAuth(accesstoken).post(
      `/order/${product_id}`,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { id } = result?.data?.items[0];
    const { invoice_id } = result?.data;
    const serviceReq = await axiosClientAuth(accesstoken).get(`/service/${id}`);

    const { service } = serviceReq?.data;
    const newService = new servicesModel({
      client_id,
      service_id: Number(service?.id),
      domain: service?.domain,
      firstpayment: Number(service?.firstpayment),
      total: Number(service?.total),
      status: service?.status,
      billingcycle: service?.billingcycle,
      next_due: service?.next_due,
      expires: service?.expires,
      next_invoice: service?.next_invoice,
      label: service?.label,
      username: service?.username,
      password: service?.password,
      name: service?.name,
    });

    const resultNewservice = await newService.save();

    await delay(4000);
    const vms = await axiosClientAuth(accesstoken).get(
      `/service/${Number(service?.id)}/vms`
    );

    if (Number(credit) <= Number(service?.total)) {
      //throw event credit < service's total response to frontend redirect to payment invoice

      const { invoice } = await callApiViettel({
        call: 'getInvoiceDetails',
        id: invoice_id,
      });

      const newVM = {
        service: resultNewservice.id,
        service_id: id,
        client_id,
        object_id: 0,
        ha: false,
        built: true,
        locked: false,
        power: true,
        status_lang: 'vm_state_pending',
        password: false,
        sshkeys: [],
        username: false,
        memory: 0,
        disk: 0,
        swap: 0,
        uptime: 0,
        template_id: '',
        template_name: os,
        template_data: [],
        replication: false,
        cloudinit: false,
        ipv4: '',
        ipv6: '',
        bandwidth: {
          data_received: 0,
          data_sent: 0,
        },
        status: 'pending',
        label: service?.label,
        invoice_id,
      };

      await ListVMSModel.create(newVM);

      response = responseModel(
        RESPONSE_STATUS.REDIRECT,
        'Payment for this invoice',
        {
          account: config.bank.account,
          bankcode: config.bank.bankcode,
          amount: invoice?.grandtotal,
          noidung: invoice?.proforma_id,
        } as any
      );

      return res.status(200).json(response);
    }
    const mapVms = await Promise.all(
      Object.keys(vms.data?.vms).map(async (key) => {
        const newVms = vms.data?.vms[key as string];
        return await ListVMSModel.create({
          ...newVms,
          service: resultNewservice.id,
          service_id: Number(service?.id),
          client_id,
          object_id: Number(newVms?.id || 0),
        });
      })
    );

    response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Successfully Create New Service',
      result?.data as any
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error createNewService', error);
    return res.status(500).json(error);
  }
};

export const getServiceDetailForPayment = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // const serviceReq = await axiosClientAuth(req.user?.accesstoken).get(
    //   `/service/${id}`
    // );

    // const { service } = serviceReq?.data;

    const serviceReq = await callApiViettel({
      call: 'getAccountDetails',
      id,
    });

    const { details: service } = serviceReq;
    console.log('serivce', service);
    let response = responseModel(
      RESPONSE_STATUS.FAILED,
      'Service is not found',
      {} as any
    );
    if (!service) {
      return res.status(400).json(response);
    }

    let invoice = {};

    if (service?.status !== 'Active') {
      const invoiceReq = await axiosClientAuth(req.user?.accesstoken).get(
        `/invoice`
      );
      const { invoices } = invoiceReq?.data;

      await Promise.all(
        invoices.map(async (item: any) => {
          const data = await axiosClientAuth(req.user?.accesstoken).get(
            `/invoice/${item?.id}`
          );

          if (
            data?.data?.invoice?.items?.find(
              (item: any) => item?.item_id === id
            )
          ) {
            invoice = data?.data?.invoice;
          }
          return null;
        })
      );
    }

    const vmsReq = await axiosClientAuth(req.user?.accesstoken).get(
      `/service/${id}/vms`
    );

    const { vms } = vmsReq.data;

    const vmReq = await axiosClientAuth(req.user?.accesstoken).get(
      `/service/${id}/vms/${Object.keys(vms)[0]}`
    );

    const { vm } = vmReq?.data;

    // const invoiceReq = await axiosClientAuth(req.user?.accesstoken).get(
    //   `/invoice/${vm?.invoice_id}`
    // );

    // const { invoice } = invoiceReq?.data;

    response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get Service Detail for payment',
      {
        service,
        vm,
        invoice,
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getServiceDetailForPayment', error);
    return res.status(500).json(error);
  }
};

export const getPagingService = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, pageIndex, pageSize } = req.query;
    const { client_id, accesstoken } = req.user as any;

    // let searchObj: any = {
    //   client_id: Number(client_id),
    // };

    // if (search) {
    //   searchObj = {
    //     ...searchObj,
    //     label: { $regex: '.*' + search + '.*' },
    //   };
    // }
    // const result = await servicesModel
    //   .find(searchObj)
    //   // .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
    //   // .limit(Number(pageSize))
    //   .sort({
    //     service_id: -1,
    //   });
    const result = await axiosClientAuth(accesstoken).get('/service');

    const { services } = result?.data;
    // const data = await Promise.all(
    //   result.data?.services?.map(async (item: any) => {
    //     // console.log(item);
    //     const dataServersIp = await axiosClientAuth(accesstoken).get(
    //       `/service/${item.id}/ip`
    //     );
    //     // console.log(dataServersIp.data?.ips[0]);
    //     const dataRef = {
    //       id: item.id,
    //       domain: item.domain,
    //       total: item.total,
    //       status: item.status,
    //       billingcycle: item.billingcycle,
    //       next_due: item.next_due,
    //       category: item.category,
    //       category_url: item.category_url,
    //       name: item.name,
    //       ipaddress: dataServersIp.data?.ips[0]?.ipaddress,
    //       mask: dataServersIp.data?.ips[0]?.mask,
    //       client_description: dataServersIp.data?.ips[0]?.client_description,
    //     };
    //     return dataRef;
    //   })
    // );

    // const count = await servicesModel.find(searchObj).countDocuments();
    // const totalPages = Math.ceil(count / Number(pageSize));
    const response = responseModel(RESPONSE_STATUS.SUCCESS, 'Get Services', {
      data: services || [],
      // pageSize: Number(pageSize),
      // pageIndex: Number(pageIndex),
      // totalItem: count,
      // totalPages: totalPages,
    });

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getPagingService', error);
    return res.status(500).json(error);
  }
};

export const getServiceDetailsByIds = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { serviceIds } = req.body;
    let response = responseModel(
      RESPONSE_STATUS.FAILED,
      'Service Details not found',
      []
    );

    if (serviceIds?.length === 0) {
      return res.status(200).json(response);
    }

    const result = await Promise.all(
      serviceIds?.map(async (id: string) => {
        const temp = await axiosClientAuth(req.user?.accesstoken).get(
          `/service/${id}/vms`
        );

        const { vms } = temp?.data;
        const item = Object.values(vms)?.[0];

        return {
          ...(item as any),
          service_id: id,
        };
      })
    );

    response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get Service details by service ids',
      result as any
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getServiceDetailsByIds', error);
    return res.status(500).json(error);
  }
};
