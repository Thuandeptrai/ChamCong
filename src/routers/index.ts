import authRouter from './auth.router';
import userRouter from './user.router';
import supportRouter from './support.router';
import serviceTemplateRouter from './serviceTemplate.router';
import ServiceRouter from './service.router';

import productRouter from './product.router';
import clientOrderRouter from './clientOrder.router';
import DepartmentRouter from './department.router';
import NotificationRouter from './notification.router';

const version = {
  v1: '/api/v1',
};
const useRoutes = (app: any) => {
  app.use(`${version.v1}/auth`, authRouter);
  app.use(`${version.v1}/users`, userRouter);
  app.use(`${version.v1}/support`, supportRouter);

  app.use(`${version.v1}/notification`, NotificationRouter);
};

export default useRoutes;
