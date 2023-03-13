import { NextFunction, Request, Response } from "express"

export const errorHandler = (err:any, req: Request, res: Response, next:NextFunction) => {
    console.log(err)
    return res.status(err.status || 400).send(err.message)
}