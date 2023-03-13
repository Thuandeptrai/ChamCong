import config from '../config/config';
import { UserType } from '../interfaces';
import UserModel from '../models/user.model';
import { createToken, hashPassword } from '../utils/auth';

export const UserService = {
  registry: async (user: UserType) => {
    try {
      const { password: pwd } = user;

      const password = await hashPassword(pwd);

      const newUser = new UserModel({
        ...user,
        password,
      });

      return await newUser.save();
    } catch (error) {
      throw error;
    }
  },
};
