import { NextFunction } from "express";
import config from "../config/config";
import jwt from 'jsonwebtoken'
import { socketService } from "./socketService";

export const socket = (io:any) => {
    io.use((socket:any, next:NextFunction) => {
        const secretKey = config.auth.jwtSecretKey
        const token = socket.handshake.auth.token;
        jwt.verify(token, secretKey, async (err:any, authorizedData:any ) => {
          if (err) {
            next(new Error('Authentication error'));
          } else {
            if (authorizedData.user_id) {
              console.log(authorizedData.user_id)
              socket.userId = authorizedData.user_id
              //@ts-ignore
              global._io = io
              next()
            }
          }
        });
      })
    io.on("connection", socketService)
    
}