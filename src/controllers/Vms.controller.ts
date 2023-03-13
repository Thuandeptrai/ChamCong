/* eslint-disable @typescript-eslint/ban-ts-comment */
import { axiosClientAuth } from '../services/axiosClient';
import logging from '../config/logging';
import { Request, Response, NextFunction } from 'express';
import ListVMSModel from '../models/ListVMS.model';
import ServicesModel from '../models/services.model';
import { RESPONSE_STATUS } from '../utils';
import { AuthRquest } from '../interfaces';
import { ErrorResponse } from '../utils/ErrorResponse';
import { all, HttpStatusCode } from 'axios';
import { responseModel } from '../utils/responseModel';
import { ResponseMessage } from '../utils/ResonseMessage';
import { delay } from '../helpers/delay';
import userModel from '../models/user.model';

const NAME_SPACE = 'listVMS';

export const syncListVMS = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'listVMS');
    const services = await axiosClientAuth(req.user?.accesstoken).get(
      `/service`
    );
    await ListVMSModel.remove({ client_id: req.user?.object_id });
    const { services: allServices } = services?.data;
    const result: any[] = [];

    await Promise.all(
      allServices.map(async (item: any) => {
        const allListVMS = await axiosClientAuth(req.user?.accesstoken).get(
          `/service/${item?.id}/vms`
        );
        if (allListVMS?.data !== undefined) {
          const resData1 = allListVMS?.data?.vms;
          const objectValues = Object.values(resData1);
          const temp = await Promise.all(
            objectValues.map(async (it: any) => {
              const a = {
                service_id: item?.id,
                object_id: it?.id,
                ha: it?.ha,
                built: it?.built,
                locked: it?.locked,
                power: it?.power,
                status: it?.status,
                status_lang: it?.status_lang,
                password: it?.password,
                sshkeys: it?.sshkeys,
                username: it?.username,
                memory: it?.memory,
                disk: it?.disk,
                swap: it?.swap,
                uptime: it?.uptime,
                template_id: it?.template_id,
                template_name: it?.template_name,
                template_data: it?.template_data,
                replication: it?.replication,
                cloudinit: it?.cloudinit,
                ipv4: it?.ipv4,
                ipv6: it?.ipv6,
                bandwidth: it?.bandwidth,
                label: it?.label,
                ip: it?.ip[Object.keys(it?.ip)[0]],
                cpus: it?.cpus,
                client_id: req.user?.client_id,
              };

              return await ListVMSModel.create(a);
            })
          );
          result.push(...temp);
          return temp;
        }
        return null;
      })
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Sync Vms from viettel to database',
      result as any
    );

    return res.status(200).json(response);
  } catch (error) {
    // logging.error(NAME_SPACE, 'Error syncServiceTemplate', error);
    return res.status(500).json(error);
  }
};

export const getpagingListVMS = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;

    let searchObj = {};
    if (req.query.search) {
      searchObj = {
        label: { $regex: '.*' + req.query.search + '.*' },
      };
    }
    // const service = await ServicesModel.find({
    //   client_id: req.user?.client_id,
    // });
    searchObj = {
      ...searchObj,
      // service: service.map((item) => item.id),
      client_id: Number(req.user?.client_id),
    };
    const data = await ListVMSModel.find(searchObj)
      .populate('service')
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize))
      .sort({
        createdAt: 'desc',
      });
    const count = await ListVMSModel.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / Number(pageSize));
    return res.status(200).json({
      data: data,
      pageSize: Number(pageSize),
      pageIndex: Number(pageIndex),
      totalItem: count,
      totalPages: totalPages,
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error syncServiceTemplate', error);
    return res.status(500).json(error);
  }
};

export const startVms = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu service id');
    }

    if (!id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu vms id');
    }

    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/vms/${id}/start`
    );
    if (result.data?.status) {
      await delay(20000);

      const updateVms = await ListVMSModel.findOneAndUpdate(
        { object_id: id },
        { power: true }
      );

      //@ts-ignore
      _io.to(req.user?.socketId).emit('Start vms success', true);

      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.START_VMS_SUCCESS,
        true
      );

      return res.status(200).json(response);
    } else {
      //@ts-ignore
      _io.to(req.user?.socketId).emit('Start vms failed', false);
      throw ErrorResponse(
        HttpStatusCode.BadRequest,
        ResponseMessage.SHUTDOWN_VMS_FAILED
      );
    }
  } catch (error) {
    logging.error(NAME_SPACE, 'Error start VMS', error);
    next(error);
  }
};

export const stopVms = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu service id');
    }

    if (!id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu vms id');
    }
    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/vms/${id}/stop`
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.STOP_VMS_SUCCESS,
      true
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error stop VMS', error);
    next(error);
  }
};

export const rebootVms = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu service id');
    }

    if (!id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu vms id');
    }
    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/vms/${id}/reboot`
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.REBOOT_VMS_SUCCESS,
      true
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error reboot VMS', error);
    next(error);
  }
};

export const resetVms = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu service id');
    }

    if (!id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu vms id');
    }
    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/vms/${id}/reset`
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.RESET_VMS_SUCCESS,
      true
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error reset VMS', error);
    next(error);
  }
};

export const destroyVms = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu service id');
    }

    if (!id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu vms id');
    }
    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/vms/${id}`
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.DESTROY_VMS_SUCCESS,
      true
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error destroy VMS', error);
    next(error);
  }
};

export const shutDownVms = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu service id');
    }

    if (!id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu vms id');
    }
    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/vms/${id}/shutdown`
    );

    if (result.data?.status) {
      await delay(20000);
      const updateVms = await ListVMSModel.findOneAndUpdate(
        { object_id: id },
        { power: false }
      );

      //@ts-ignore
      _io.to(req.user?.socketId).emit('Shut down vms success', true);

      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        ResponseMessage.SHUTDOWN_VMS_SUCCESS,
        true
      );

      return res.status(200).json(response);
    } else {
      //@ts-ignore
      _io.to(req.user?.socketId).emit('Shut down vms failed', false);
      throw ErrorResponse(
        HttpStatusCode.BadRequest,
        ResponseMessage.SHUTDOWN_VMS_FAILED
      );
    }
  } catch (error: any) {
    logging.error(NAME_SPACE, 'Error shutdown VMS', error?.data);
    next(error);
  }
};

export const resizeVms = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;
    const memory = req.body.memory;
    const cpu = req.body.cpu;

    if (!id || !service_id || !memory || !cpu) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Thiếu dữ liệu');
    }
    const result = await axiosClientAuth(req.user?.accesstoken).put(
      `/service/${service_id}/vms/${id}`,
      { id, service_id, memory, cpu }
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.UPDATE_VMS_SUCCESS,
      result.data
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const changeServiceLabel = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const service_id = req.params.service_id;
    const label = req.body.label;

    if (!label) {
      throw ErrorResponse(
        HttpStatusCode.BadRequest,
        'Label không được bỏ trống'
      );
    }

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Không có service id');
    }

    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/label`,
      { label }
    );

    if (!result.data?.success) {
      throw ErrorResponse(
        HttpStatusCode.InternalServerError,
        'Cập nhật thất bại'
      );
    }

    const updateServiceLabel = await ServicesModel.findOneAndUpdate(
      { service_id: service_id },
      { label: label },
      { new: true }
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.UPDATE_SERVICE_LABEL_SUCCESS,
      updateServiceLabel
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const cancelService = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const immediate = req.body.type ? true : false;
    const service_id = req.body.service_id;
    const reason = req.body.reason;

    if (!service_id) {
      throw ErrorResponse(HttpStatusCode.BadRequest, 'Không có service id');
    }

    const result = await axiosClientAuth(req.user?.accesstoken).post(
      `/service/${service_id}/cancel`,
      { immediate, reason }
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getVmsDetail = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const service_id = req.params.service_id;

    const vms = await axiosClientAuth(req.user?.accesstoken).get(
      `/service/${service_id}/vms/${id}`
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get VMS detail success',
      vms?.data?.vm
    );

    return res.status(HttpStatusCode.Ok).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
