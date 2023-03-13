import mongoose from "mongoose"
import ActionHistory from "../models/ActionHistory"
import { AuthRquest } from "../interfaces"
import { NextFunction, Response } from "express"
import { responseModel } from "../utils/responseModel"
import { RESPONSE_STATUS } from "../utils"
import { ResponseMessage } from "../utils/ResonseMessage"
import { HttpStatusCode } from "axios"


export const updateActionHistory = async (id:string, status:string, actionName  ='') => {
    const updateAction:{status: string, successAt:Date, action?: string} = {
        status: status,
        successAt: new Date(),
        action: actionName
    }

    // if(!actionName){
    //     updateAction.action = actionName
    // }

    try {
        const action = await ActionHistory.findByIdAndUpdate(id,updateAction)

        return action
    } catch (error) {
        console.log(error)
    }
}


export async function createAction(actionName: string, user_id: mongoose.Types.ObjectId, IP ?: string, FP ?: any) {
    try {
      const action = await ActionHistory.create({
        IP:IP,
        FP: FP,
        action: actionName,
        user: user_id,
        createdAt: new Date(),
        status: 'pending',
      })
      return action
    } catch (error) {
      console.log(error);
    }
  }

export const getActionByUserId = async (req: AuthRquest, res: Response, next:NextFunction) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10
        const pageIndex = Number(req.query.pageIndex) || 1
        let searchObj ={
            user: req.user?.id
        } as any
        if(req.query.search){
            searchObj = {
                action : { $regex: '.*' + req.query.search + '.*' },
            }
        }
        const action = await ActionHistory.find(searchObj)
        .populate('user')
        .skip((pageSize * pageIndex) - pageSize)
        .limit(pageSize)
        const count =  await ActionHistory.find({user: req.user?.id}).countDocuments()
        
        const totalPage = Math.ceil(count / pageSize)

        const response = responseModel(RESPONSE_STATUS.SUCCESS, ResponseMessage.GET_ACTION_HISTORY_SUCCES, {
            actions: action,
            totalDocs: count,
            totalPage,
            pageIndex: pageIndex,
            pageSize: pageSize
        })

        return res.status(HttpStatusCode.Ok).json(response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export const getActionHistory = async (req:AuthRquest, res:Response, next:NextFunction) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10
        const pageIndex = Number(req.query.pageIndex) || 1
        let searchObj ={} as any
        if(req.query.search){
            searchObj = {
                action : { $regex: '.*' + req.query.search + '.*' },
            }
        }
        const action = await ActionHistory.find(searchObj)
        .populate('user')
        .skip((pageSize * pageIndex) - pageSize)
        .limit(pageSize)
        .sort(
            {createdAt :'desc'}
        )
        const count =  await ActionHistory.find({}).countDocuments()
        
        const totalPage = Math.ceil(count / pageSize)
      
        

        const response = responseModel(RESPONSE_STATUS.SUCCESS, ResponseMessage.GET_ACTION_HISTORY_SUCCES, {
            actions: action,
            totalDocs: count,
            totalPage,
            pageIndex: pageIndex,
            pageSize: pageSize
        })

        return res.status(HttpStatusCode.Ok).json(response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
