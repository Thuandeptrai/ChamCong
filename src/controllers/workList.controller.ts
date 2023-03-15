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

export const getWorkListByMonth = async (
    req: Request,
    res: Response,
    next: NextFunction) =>{
        try{

        }catch(error) {
            next(error);
        }
    }
