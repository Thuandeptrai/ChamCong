import authRouter from './auth.router';
import dateRouter from './dateToCheck.router';
import userRouter from './user.router';
import dateForUserRouter from './dateforuser.router';
import workListRouter from './workList.router';
import workdayRouter from './workDay.router';


const version = {
  v1: '/api/v1',
};
const useRoutes = (app: any) => {
  app.use(`${version.v1}/auth`, authRouter);
  app.use(`${version.v1}/users`, userRouter);
  app.use(`${version.v1}/workList`, workListRouter);
  app.use(`${version.v1}/workDay`, workdayRouter);

  app.use(`${version.v1}/date`, dateRouter);
  app.use(`${version.v1}/dateForUser`, dateForUserRouter);

};
export default useRoutes;
