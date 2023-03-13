import authRouter from './auth.router';
import userRouter from './user.router';
import orderPageRouter from './orderPage.router';
import supportRouter from './support.router';
import serviceTemplateRouter from './serviceTemplate.router';
import listVMSRouter from './listVMS.router';
import ServiceRouter from './service.router';

import productRouter from './product.router';
import clientOrderRouter from './clientOrder.router';
import paymentMethodRouter from './paymentMethod.router';
import clientTicketRouter from './clientTicket.router';
import ActionHistoryRouter from './actionHistory.router';
import DepartmentRouter from './department.router';
import NotificationRouter from './notification.router';
import invoiceRouter from './invoice.router';

const version = {
  v1: '/api/v1',
};
const useRoutes = (app: any) => {
  app.use(`${version.v1}/auth`, authRouter);
  app.use(`${version.v1}/users`, userRouter);
  app.use(`${version.v1}/order-pages`, orderPageRouter);
  app.use(`${version.v1}/support`, supportRouter);
  app.use(`${version.v1}/serviceTemplate`, serviceTemplateRouter);
  app.use(`${version.v1}/listVMS`, listVMSRouter);
  app.use(`${version.v1}/services`, ServiceRouter);
  app.use(`${version.v1}/products`, productRouter);
  app.use(`${version.v1}/client-order`, clientOrderRouter);
  app.use(`${version.v1}/payment-methods`, paymentMethodRouter);
  app.use(`${version.v1}/client-ticket`, clientTicketRouter);
  app.use(`${version.v1}/action-history`, ActionHistoryRouter);
  app.use(`${version.v1}/department`, DepartmentRouter);
  app.use(`${version.v1}/notification`, NotificationRouter);
  app.use(`${version.v1}/invoices`, invoiceRouter);
};

export default useRoutes;
