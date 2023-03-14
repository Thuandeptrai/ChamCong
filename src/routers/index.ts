import authRouter from './auth.router';
import dateRouter from './dateToCheck.router';
import userRouter from './user.router';


const version = {
  v1: '/api/v1',
};
const useRoutes = (app: any) => {
  app.use(`${version.v1}/auth`, authRouter);
  app.use(`${version.v1}/users`, userRouter);

  app.use(`${version.v1}/date`, dateRouter);

};

export default useRoutes;
