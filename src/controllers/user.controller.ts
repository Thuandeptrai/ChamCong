import { Request, Response, NextFunction, response } from 'express';
import UserModel from '../models/user.model';
import logging from '../config/logging';
import { UserService } from '../services';
import { convertDataToSyncData, RESPONSE_STATUS } from '../utils';
import config from '../config/config';
import { callApiViettel } from '../middleware';
import axios, { HttpStatusCode } from 'axios';
import Joi from 'joi';
import { responseModel } from '../utils/responseModel';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { ErrorResponse } from '../utils/ErrorResponse';
import { authentication, axiosClient, axiosClientAuth } from '../services/axiosClient';
import jwt from 'jsonwebtoken';
import { AuthRquest } from '../interfaces';
import { ResponseMessage } from '../utils/ResonseMessage';
import { userEndPoint } from '../utils/endpoint';
import emailToken from '../models/emailToken';
import crypto from 'crypto'
import { sendMailHelper } from '../helpers/sendEmail';
import userModel from '../models/user.model';
import supportModel from '../models/support.model';
import servicesModel from '../models/services.model';

const NAME_SPACE = 'User';

export const verifyTokenEmail = async (req: Request, res: Response) => {
  try {
    const user_id = req.params.user_id
    const token = req.params.token

    const find = await emailToken.findOne({ user: user_id })

    if (!find) {
      return res.redirect('/authentication-fail.html')
    }

    if (find.token != token) {
      return res.redirect(`/authentication-fail.html`)
    }

    const updateUser = await userModel.findByIdAndUpdate(user_id, {
      verified: true
    })

    const deleteToken = await emailToken.deleteOne({ user: user_id })

    return res.redirect('/authentication-success.html')
  } catch (error) {
    console.log(error)
  }
}

export const syncDataUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'syncDataUser');

    const allClients = await callApiViettel({
      call: 'getClients',
    });

    const allClientIds = allClients?.clients?.map((client: any) => client?.id);

    await UserModel.remove({});

    const listClientsToAdd = await Promise.all(
      allClientIds?.map(async (id: string) => {
        const clientDetail = await callApiViettel({
          call: 'getClientDetails',
          id,
        });

        const { client } = clientDetail;

        // await new UserModel(client).save();
        return client;
      })
    );

    const dataToAdd = convertDataToSyncData(listClientsToAdd);

    const resData = await UserModel.insertMany(dataToAdd);

    return res.status(200).json({
      status: RESPONSE_STATUS.SUCCESS,
      allClients: resData,
      message: 'Sync data user from Manager idcviettel to my database',
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error syncDataUser', error);
    return res.status(500).json(error);
  }
};

export const addUserCredit = async (req: AuthRquest,
  res: Response,
  next: NextFunction) => {
  const schema = Joi.object({
    credit: Joi.number().required()
  })
  try {
    const check = schema.validate(req.body)
    if(check.error){
      throw new Error(check.error.message)
    }
    const userId = req.params.id
    const user = await UserModel.findOne({id: userId})
    const addClientCredit = await callApiViettel({
      call: 'addClientCredit',
      client_id: user?.client_id,
      amount: Number(req.body.credit)
    });

    if(!addClientCredit.success){
      throw ErrorResponse(HttpStatusCode.InternalServerError, "Nạp tiền thất bại do lỗi từ hệ thống")
    }

    const updateUserCredit = await userModel.findByIdAndUpdate(userId, {
      $inc: {
        credit: Number(req.body.credit)
      }
    })

    const response = responseModel(RESPONSE_STATUS.SUCCESS, "Nạp tiền thành công", true)
    return res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}

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

    if (!checkExist.verified) {
      const checkToken = await emailToken.findOne({ user: checkExist.id })
      let token = null
      if (!checkToken) {
        token = await emailToken.create({
          user: checkExist.id,
          token: crypto.randomBytes(32).toString("hex")
        })
      } else {
        token = await emailToken.findOneAndUpdate({ user: checkExist.id }, {
          token: crypto.randomBytes(32).toString("hex")
        })
      }

      const url = `
      <p style="font-weight: bold">GOFIBER xin chào quý khách</p>
      <p>Cảm ơn bạn đã đăng kí tài khoản để sử dụng dịch vụ của GOFIBER</p>
      <p>Bấm vào nút dưới đây để xác thực tài khoản của bạn</p>
      <a href="${process.env.BASE_URL}/api/v1/users/${checkExist.id}/verify/${token?.token}"><button style="padding: 5px 10px; color: white; background-color: #1890ff; border: none; border-radius: 6px">Xác thực</button></a>
      <p>Chúc bạn có những trải nghiệm tốt nhất khi sử dụng dịch vụ của GOFIBER</p>
    `
      const send = await sendMailHelper(checkExist.email, url)
      throw ErrorResponse(401, ResponseMessage.LOGIN_FAILED_ACCOUNT_NOT_VERIFY)
    }
    const result = await authentication({
      username: req.body.username,
      password: req.body.password,
      remember: true,
    });
    if (!result.data.token) {
      throw ErrorResponse(401, ResponseMessage.LOGIN_FAILED);
    }
    const updateUserToken = await UserModel.findByIdAndUpdate(
      checkExist._id,
      { accesstoken: result.data?.token, refreshtoken: result.data?.refresh },
      { new: true }
    ).populate('role');

    const accessToken = jwt.sign(
      { user_id: checkExist._id },
      config.auth.jwtSecretKey,
      { expiresIn: '1d' }
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.LOGIN_SUCCESS,
      {
        user: updateUserToken,
        accessToken: accessToken,
      }
    );

    return res.status(HttpStatusCode.Ok).json(response);
  } catch (error: any) {
    next(error);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    firstname: Joi.string().max(8).required(),
    lastname: Joi.string().max(8).required(),
    password: Joi.string().min(6).max(32).required(),
    password2: Joi.ref('password'),
    address1: Joi.string().required(),
    country: Joi.string().required(),
    phonenumber: Joi.string().required(),
    email: Joi.string().email(),  
  });
  try {
    const checkValidBody = schema.validate(req.body);
    if (checkValidBody.error) {
      throw new Error(checkValidBody.error.message);
    }

    const checkExistGmail = await UserModel.find({ email: req.body.email })

    if (checkExistGmail.length > 0) {
      throw ErrorResponse(400, ResponseMessage.SIGN_UP_FAILED_EMAIL_EXIST)
    }

    const newUser: any = await callApiViettel({
      ...req.body,
      call: 'addClient',
    });
    if (!newUser?.success) {
      throw new Error(newUser.error.toString());
    }

    const userDetail = await callApiViettel({
      id: newUser.client_id,
      call: 'getClientDetails',
    });
    const syncUser = await UserModel.create(userDetail.client);

    const token = await emailToken.create({
      user: syncUser.id,
      token: crypto.randomBytes(32).toString("hex")
    })


    const url = `
      <p style="font-weight: bold">GOFIBER xin chào quý khách</p>
      <p>Cảm ơn bạn đã đăng kí tài khoản để sử dụng dịch vụ của GOFIBER</p>
      <p>Bấm vào nút dưới đây để xác thực tài khoản của bạn</p>
      <a href="${process.env.BASE_URL}/api/v1/users/${syncUser.id}/verify/${token.token}"><button style="padding: 5px 10px; color: white; background-color: #1890ff; border: none; border-radius: 6px">Xác thực</button></a>
      <p>Chúc bạn có những trải nghiệm tốt nhất khi sử dụng dịch vụ của GOFIBER</p>
      `

    const send = await sendMailHelper(syncUser.email, url)

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

export const getUserBalance = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userBalance = await axiosClientAuth(req.user?.accesstoken).get(
      userEndPoint.GET_USER_BALANCE
    );

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      ResponseMessage.GET_USER_BALANCE_SUCCESS,
      userBalance.data
    );

    return res.status(HttpStatusCode.Ok).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getUserDetail = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userDetail = await UserModel.findById(req.user?.id).populate('role')

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

export const getpagingQLUser = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    const dataUser = await UserModel.find()
    const dataId: any = []
    dataUser.map((item: any) => {
      const a = {
        id_client: item?.client_id,
        id: item._id
      }
      dataId.push(a)
    })

    const userStats = await Promise.all(dataId?.map(async (item: any) => {
      const data = await axiosClient.get(`/api.php?api_id=0d9687d614d03f5c62fa&api_key=957ee008ea71470c0830&call=getClientStats&id=${item?.id_client}
      `);
      const item1 = data?.data.stats
      const suport = await supportModel.find({
        userId: item?.id
      })
      const dem = suport.length
      const dem1 = suport?.map((item: any) => {
        if (item?.level === 3 || item.level !== undefined) {
          return item?.level
        }
      })
      const user = await UserModel.find({
        _id: item?.id
      })

      const service = await servicesModel.find({
        client_id: item.id_client
      })

      const a = {
        invoice_paid: item1?.invoice_paid,
        paid: item1?.paid,
        invoice_cancelled: item1?.invoice_cancelled,
        cancelled: item1?.cancelled,
        invoice_unpaid: item1?.invoice_unpaid,
        unpaid: item1?.unpaid,
        shared: item1?.shared,
        reseller: item1?.reseller,
        dedicated: item1?.dedicated,
        other: item1?.other,
        domain: item1?.domain,
        ticket: item1?.ticket,
        credit: item1?.credit,
        affiliate: item1?.affiliate,
        currency_id: item1?.currency_id,
        income: item1?.income,
        accounts: item1?.accounts,
        count_ticket: dem,
        name: user[0]?.lastname,
        soTicket: dem1,
        service: service.length
      }
      return a
    }))

    return res.status(200).json(
      {
        data: userStats,
      }
    )
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const getAllUser = async (req: AuthRquest, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find({})
    const response = responseModel(RESPONSE_STATUS.SUCCESS, 'Get All User Success', users)

    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const getPaging = async (req: AuthRquest, res: Response, next: NextFunction) => {
  try {
    const pageSize = req.query.pageSize || 10
    const pageIndex = req.query.pageIndex || 1
    const search = req.query.search || null

    const query: { search?: string } = {

    }

    if (search) {
      query.search = search.toString()
    }

    const users = await UserModel.find(query).skip((Number(pageSize) * Number(pageIndex) - Number(pageSize))).limit(Number(pageSize))

    const totalDocs = await UserModel.countDocuments()

    const response = responseModel(RESPONSE_STATUS.SUCCESS, "Get users success", {
      users: users,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / Number(pageSize))
    })

    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    next(error)
  }
}