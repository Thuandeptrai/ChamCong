import { authorize } from './../middleware/index';
import { authentication, axiosClientAuth } from './../services/axiosClient';
import { Request, Response, NextFunction } from 'express';
import logging from '../config/logging';
import ServiceTemplatesModel from '../models/serviceTemplates.model';
import { RESPONSE_STATUS } from '../utils';

const NAME_SPACE = 'serviceTempalte';
// export const syncServiceTemplate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     logging.info(NAME_SPACE, 'syncServiceTemplate');
//     const allServiceTempalte = await axiosClientAuth(req.user.accessToken).get(
//       `https://manager.idcviettel.com/api/service/50/templates`
//     );

//     await ServiceTemplatesModel.remove({});

//     const resData = await ServiceTemplatesModel.insertMany(
//       allServiceTempalte.data?.templates
//     );

//     return res.status(200).json({
//       status: RESPONSE_STATUS.SUCCESS,
//       allClients: resData,
//       message:
//         'Sync data service template from Manager idcviettel to my database',
//     });
//   } catch (error) {
//     logging.error(NAME_SPACE, 'Error syncServiceTemplate', error);
//     return res.status(500).json(error);
//   }
// };

export const getpaging = async(req: Request,
    res: Response,
    next: NextFunction)=>{
        logging.info(NAME_SPACE, 'syncServiceTemplate');
        try {
            const pageSize = req.query.pageSize  || 10 ;
            const pageIndex = req.query.pageIndex || 1 ;
            let searchObj = {}
            if (req.query.search) {
                searchObj = {
                  name: { $regex: ".*" + req.query.search + ".*" },
                };
            }
            const service = await ServiceTemplatesModel.find(searchObj).skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
            .limit(Number(pageSize))
            .sort({
              createdAt: "desc", 
            });
            const count = await ServiceTemplatesModel.find(searchObj).countDocuments();
            const totalPages = Math.ceil(count / Number(pageSize));
            return res.status(200).json({
                data: service,
                pageSize: pageSize,
                pageIndex: pageIndex,
                totalItem: count,
                totalPages: totalPages
            })

        } catch (error) {
             logging.error(NAME_SPACE, 'Error syncServiceTemplate', error);
            return res.status(500).json(error);
        }
    }
