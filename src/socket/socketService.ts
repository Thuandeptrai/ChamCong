import userModel from "../models/user.model";

export const socketService = async (socket:any) => {
    console.log('user connected')

    const updateSocketId = await userModel.findOneAndUpdate({_id: socket.userId}, {
      $addToSet: {
        socketId: socket.id
      }
    }, {new: true})

    socket.on("disconnect", async () => {
      const updateSocketId = await userModel.findOneAndUpdate({_id: socket.userId}, {
       socketId: []
      })
    }, {new: true});
}