import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { AuthRquest } from '../interfaces';
import { callApiViettel } from '../middleware';

import { default as UserModel, default as userModel } from '../models/user.model';
import { RESPONSE_STATUS } from '../utils';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ResponseMessage } from '../utils/ResonseMessage';
import { hashPassword, verifyPassword } from '../utils/auth';
import { responseModel } from '../utils/responseModel';

const NAME_SPACE = 'User';





export const addUserCredit = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    credit: Joi.number().required(),
  });
  try {
    const check = schema.validate(req.body);
    if (check.error) {
      throw new Error(check.error.message);
    }
    const userId = req.params.id;
    const user = await UserModel.findOne({ id: userId });
    const addClientCredit = await callApiViettel({
      call: 'addClientCredit',
      client_id: user?.client_id,
      amount: Number(req.body.credit),
    });

    if (!addClientCredit.success) {
      throw ErrorResponse(
        HttpStatusCode.InternalServerError,
        'Nạp tiền thất bại do lỗi từ hệ thống'
      );
    }

    const updateUserCredit = await userModel.findByIdAndUpdate(userId, {
      $inc: {
        credit: Number(req.body.credit),
      },
    });

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Nạp tiền thành công',
      true
    );
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(32).required(),
    password: Joi.string().min(6).max(32).required(),
  });
  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }

    const checkExist = await UserModel.findOne({ email: req.body.username });

    if (!checkExist) {
      throw ErrorResponse(401, ResponseMessage.USER_NOT_EXIST);
    }

    const verify = await verifyPassword(req.body.password, checkExist.password);

    if (!verify) {
      throw ErrorResponse(401, ResponseMessage.LOGIN_FAILED);
    }

    const accessToken = jwt.sign(
      { user_id: checkExist._id },
      config.auth.jwtSecretKey,
      { expiresIn: '1d' }
    );

    return res.status(HttpStatusCode.Ok).json(accessToken);
  } catch (error: any) {
    next(error);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  req.body.password = "ádasdasd"
  req.body.password2 = "ádasdasd"

  const schema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
    password2: Joi.ref('password'),
    employeeNumber: Joi.number().required(),
    bankName: Joi.string().required(),
    userBankNumber: Joi.string().required(),
    salary: Joi.number().required(),
    email: Joi.string().email(),
    department: Joi.string(),
    isAdmin: Joi.string().required(),
    phonenumber: Joi.string().required(),
    thisUser: Joi.object()
  });
  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }

    const checkExistGmail = await UserModel.find({ email: req.body.email });

    if (checkExistGmail.length > 0) {
      throw ErrorResponse(400, ResponseMessage.SIGN_UP_FAILED_EMAIL_EXIST);
    }
    req.body.password = await hashPassword(req.body.password);
    const syncUser = await UserModel.create(req.body);

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.SIGN_UP_SUCCESS,
      {}
    );

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};



export const getUserDetail = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDetail = await UserModel.findById(req.params?.userId).sort({ createdAt: -1 });

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.GET_USER_DETAIL_SUCCESS,
      userDetail
    );
    return res.status(HttpStatusCode.Ok).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const checkValidToken = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.status(HttpStatusCode.Ok).json(ResponseMessage.LOGIN_SUCCESS);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// export const getpagingQLUser = async(
//   req: AuthRquest,
//   res: Response,
//   next: NextFunction
// )=>{
//   try {
//     const userId = req?.user?.id

//     const pageSize = req.query.pageSize || 10;
//     const pageIndex = req.query.pageIndex || 1;
//     const search = req.query?.search || "";
//     const data = await UserModel.aggregate([
//       {
//         $match: {
//           ...(search
//             ? {
//               lastname: {
//                   $regex: ".*" + search + ".*",
//                   $options: "i",
//                 },
//               }
//             : {}),
//         },
//       },
//       {
//         $lookup: {
//           from: "supports",
//           localField: "_id",
//           foreignField: "userId",
//           as: "support",

//         },
//       },
//       {
//         $lookup: {
//           from: "Services",
//           localField: "client_id",
//           foreignField:"client_id",
//           as : "service"
//         }
//       },
//       {
//         $sort: {
//           createdAt: -1,
//         },
//       },
//       {
//         $skip: Number(pageIndex) * Number(pageSize) - Number(pageSize),
//       },
//       {
//         $limit: Number(pageSize) || 9999999,
//       },
//     ])

//     const count = await UserModel.find().countDocuments();
//     const totalPages = Math.ceil(count / Number(pageSize));
//     return res.status(200).json(
//       {

//         data,
//         pageIndex,
//         pageSize,
//         count,
//         totalPages,
//       }
//     )
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// }

export const updateUser = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  const schema = Joi.object({
    name: Joi.string(),
    password: Joi.string().min(6).max(32),
    password2: Joi.ref('password'),
    employeeNumber: Joi.number(),
    bankName: Joi.string().min(6).max(32),
    userBankNumber: Joi.string().min(6).max(32),
    salary: Joi.number(),
    email: Joi.string().email(),
    isAdmin: Joi.string(),
    phonenumber: Joi.string(),
    department: Joi.string(),
    thisUser: Joi.object().allow()
  });
  try {
    if (userId) {
      const checkValidBody = schema.validate(req.body);
      if (checkValidBody.error) {
        throw new Error(checkValidBody.error.message);
      }
      const updateUser = await UserModel.findByIdAndUpdate(userId, req.body, { new: true })
      return res.status(200).json({ status: 200, message: "Thành công", updateUser });
    } else {
      throw ErrorResponse(
        HttpStatusCode.BadRequest,
        'UserId id is required'
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const getAllUser = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await UserModel.find({});
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get All User Success',
      users
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getPaging = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;
    const search = req.query.search || null;

    const query: { search?: string } = {};

    if (search) {
      query.search = search.toString();
    }

    const users = await UserModel.find(query)
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize));

    const totalDocs = await UserModel.countDocuments();

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get users success',
      {
        users: users,
        totalDocs: totalDocs,
        totalPages: Math.ceil(totalDocs / Number(pageSize)),
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
