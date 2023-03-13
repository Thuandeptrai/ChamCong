/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Response } from 'express';
import { GenerateRandomString as randomString } from '../helpers/generateRandomString';
import { AuthRquest, NotificationType } from '../interfaces';
import Notification from '../models/Notification';
import userModel from '../models/user.model';
import { responseModel } from '../utils/responseModel';
import { RESPONSE_STATUS } from '../utils';
import { ErrorResponse } from '../utils/ErrorResponse';
import { HttpStatusCode } from 'axios';

export async function createNotification(
  reciever: string,
  name: string,
  type: NotificationType,
  content: string,
  status = true
) {
  const code = randomString(10);
  const slug = code;

  try {
    const notification = await Notification.create({
      code: code,
      slug: slug,
      reciever: [reciever],
      name: name,
      type: type,
      content: content,
      status: status,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function insertNotification(
  req: AuthRquest,
  res: Response,
  next: NextFunction
) {
  try {
    const code = randomString(10);
    req.body.code = code;
    req.body.slug = code;
    req.body.sender = req.user?.id

    const newNotification = await Notification.create(req.body);

    const users = await userModel.find({ _id: req.body.reciever });

    console.log(users)

    const socketIdToEmit: string[] = [];

    users.forEach((item) => {
      item.socketId.map((socket) => {
        socketIdToEmit.push(socket);
      });
    });


    if(socketIdToEmit.length > 0){
    //@ts-ignore
    _io.to(socketIdToEmit).emit('new notification is sent', newNotification);

    }

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Create Notification Success',
      newNotification
    );

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function updateNotification(
  req: AuthRquest,
  res: Response,
  next: NextFunction
) {
  try {
    const updatedNoti = await Notification.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Update Notification Success',
      updatedNoti
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function deleteNotification(
  req: AuthRquest,
  res: Response,
  next: NextFunction
) {
  if (req.params.id) {
    try {
      const thisNoti = await Notification.findById(req.params.id);
      const noti = await Notification.findByIdAndDelete(req.params.id);

      const response = responseModel(
        RESPONSE_STATUS.SUCCESS,
        'Delete notification suceess',
        true
      );
      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  } else {
    throw ErrorResponse(
      HttpStatusCode.BadRequest,
      'Notification id is required'
    );
  }
}

//   async function getNotificationById(req, res) {
//     if (req.body.notiId) {
//       try {
//         let notification = await Notification.findById(req.body.notiId);
//         res.json(notification);
//       } catch (error) {
//         let response = new ResponseModel(-2, error.message, error);
//         res.json(response);
//       }
//     } else {
//       res
//         .status(404)
//         .json(new ResponseModel(404, "NotificationId is not valid!", null));
//     }
//   }

export async function getPaging(
  req: AuthRquest,
  res: Response,
  next: NextFunction
) {
  const pageSize = Number(req.query.pageSize) || 10;
  const pageIndex = Number(req.query.pageIndex) || 1;

  let searchObj = {};
  if (req.query.search) {
    searchObj = { name: { $regex: '.*' + req.query.search + '.*' } };
  }
  try {
    const noti = await Notification.find(searchObj)
      .populate('sender')
      .populate([{ path: "user", strictPopulate: false }])
      .skip(pageSize * pageIndex - pageSize)
      .limit(pageSize)
      .sort({
        createdTime: 'desc',
      });

    const count = await Notification.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / pageSize);

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get notification success',
      {
        notifications: noti,
        totalPages: totalPages,
        totalDocs: count,
      }
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getNotificationByUserId(
  req: AuthRquest,
  res: Response,
  next: NextFunction
) {
  const searchObj: {
    type?: NotificationType;
    reciever?: string;
  } = {};
  if (req.query.type) {
    searchObj.type = req.query.type as NotificationType;
  }
  searchObj.reciever = req.user?.id.toString();
  try {
    const result = await Notification.find(searchObj);
    const updateNotificationReadBy = await Promise.all(
      result.map(async (item) => {
        if (!item.readBy.includes(req.user?.id as string))
          return await Notification.findByIdAndUpdate(item._id, {
            $addToSet: {
              readBy: req.user?.id,
            },
          });
      })
    );
    return res.status(200).json({ notifications: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
}

export async function getNotificationBySlug(
  req: AuthRquest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.query.slug) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    const slug = req.query.slug;
    const userId = req.user?.id;
    const result = await Notification.findOne({
      slug: slug,
      reciever: userId,
    }).populate('sender');
    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get Notification Success',
      result
    );
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
}
