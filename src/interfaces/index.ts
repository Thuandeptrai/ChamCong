import { Request } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export interface UserType {
  salary:number
  object_id: number;
  email: string;
  password: string;
  lastLogin: string;
  ip: string;
  host: string;
  status: string;
  parent_id: string;
  firstname: string;
  lastname: string;
  companyName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  code: string;
  country: string;
  phonenumber: string;
  datecreated: string;
  notes: string;
  language: string;
  company: number;
  credit: number;
  taxexempt: number;
  latefeeoveride: number;
  cardtype: string;
  cardnum: string;
  expdate: string;
  overideduenotices: number;
  client_id: number;
  currency_id: number;
  countryname: string;
  access: any[];
  achrouting: string;
  achaccount: string;
  achtype: string;
  assigned_affiliate: boolean;
  cardcreated: string;
  cardupdated: string;
  group_id: string;
  loginattempts: number;
  mfamodule: number;
  taxrate: number;
  disableemails: number;
  affiliate_id: string;
  billing_contact_id: string;
  group_name: string;
  group_color: string;
  accesstoken: string;
  refreshtoken: string;
  role: string;
  socketId: string[];
  verified: boolean
  isAdmin: string
}

export interface UserToken extends UserType {
  id: string;
  socketId: string[];
}

export interface AuthRquest extends Request {
  user?: UserToken;
  actionId?: mongoose.Types.ObjectId;
  fingerprint ?: any
}

export interface OrderPageType {
  object_id: number;
  parent_id: number;
  contains: string;
  name: string;
  description: string;
  visible: number;
  slug: string;
  sort_order: number;
  template: string;
  ctype: string;
  ptype: string;
  ltype: string;
  otype: string;
  products: number;
  subcategories: number;
  ptype_id: number;
}

export interface RoleType {
  roleName: string;
}

export interface CRequest extends Request {
  user: any;
}

export interface SupportType {
  client_read: number;
  ticket_number: number;
  date: string;
  deptname: string;
  subject: string;
  status: string;
  body: string;
  dept_id: string;
  attachments: [];
  email: string;
  file: string;
  level: number;
  userId: string;
}

export interface ProductType {
  object_id: number;
  category_id: number;
  type: number;
  name: string;
  description: string;
  visible: number;
  domain_options: number;
  stock: number;
  qty: number;
  autosetup: number;
  subdomain: string;
  owndomain: number;
  owndomainwithus: number;
  client_limit: number;
  tax: number;
  tax_group_id: number;
  upgrades: string;
  sort_order: number;
  rel: string;
  welcome_email_id: number;
  suspend_email_id: number;
  unsuspend_email_id: number;
  terminate_email_id: number;
  paytype: string;
  m_upgrade: number;
  q_upgrade: number;
  s_upgrade: number;
  a_upgrade: number;
  b_upgrade: number;
  t_upgrade: number;
  d_upgrade: number;
  w_upgrade: number;
  h_upgrade: number;
  m_setup: number;
  q_setup: number;
  s_setup: number;
  a_setup: number;
  b_setup: number;
  t_setup: number;
  d_setup: number;
  w_setup: number;
  h_setup: number;
  m: number;
  q: number;
  s: number;
  a: number;
  b: number;
  t: number;
  d: number;
  w: number;
  h: number;
  ptype: string;
  options: object;
  module: number;
  server: object;
  tlds: any;
  periods: any;
  free_domain: number;
  hostname: boolean;
  ospick: boolean;
  modules: Array<any>;
  block_cancellation_day: number;
  out_of_stock: boolean;
  main: number;
  modname: string;
  filename: string;
  tags: Array<any>;
  metrics: Array<any>;
  service_type: string;
  product_id: number;
  domain_op: Array<any>;
  autohostname: string;
  username_generation: string;
  p_options: number;
}

export interface ServiceTemplateType {
  service_id: string;
  name: string;
  price: string;
  type: string;
  group: string;
}

export interface ListVMSType {
  list_id: number;
  ha: boolean;
  built: boolean;
  locked: boolean;
  power: boolean;
  status: string;
  status_lang: string;
  password: boolean;
  sshkeys: string;
  username: boolean;
  memory: number;
  disk: number;
  swap: number;
  uptime: number;
  template_id: string;
  template_name: string;
  template_data: string;
  replication: boolean;
  cloudinit: boolean;
  ipv4: string;
  ipv6: string;
  bandwidth: {
    data_received: number;
    data_sent: number;
  };
  label: string;
  ip: {
    ip_active: {
      id: number;
      vmid: number;
      interface: number;
      ipaddress: string;
      mac: string;
      wanip: string;
      ip: string;
      network: string;
      gateway: string;
      main: number;
      options: {
        private: boolean;
        keep_mac: boolean;
      };
      server_id: number;
      type: string;
    };
  };
  cpus: number;
}

export interface IAuthentication {
  username: string;
  password: string;
  remember: boolean;
}

export interface ServiceTemplateType {
  service_id: string;
  name: string;
  price: string;
  type: string;
  group: string;
}

export interface Services {
  service_id: number;
  domain: string;
  total: number;
  status: string;
  billingcycle: string;
  next_due: string;
  next_invoice: string;
  category: string;
  category_url: string;
  name: string;
  username: string;
  password: string;
  client_id: number;
  expires: string;
}

export interface ClientOrder {
  orders_id: number;
  date_created: string;
  number: number;

  invoice_id: string;
  firstname: string;
  lastname: string;
  companyname: string;
  module: string;
  client_id: string;
  invtotal: number;
  invcredit: number;
  invstatus: string;
  group_id: string;
  invsubtotal2: number;
  currency_id: string;
  balance: string;
  firstpayment: number;
  total: number;
  billingcycle: string;
  next_due: string;
  next_invoice: string;
  status: string;
  label: string;
  username: string;
  password: string;
  name: string;
}

export interface PaymentMethodType {
  object_id: number;
  name: string;
}

export interface ClientTicketType {
  admin_read: number;
  ticket_id: number;
  parent_id: number;
  type: string;
  firstname: string;
  lastname: string;
  companyname: string;
  date: string;
  lastreply: string;
  dept_id: number;
  name: string;
  client_id: number;
  status: string;
  ticket_number: number;
  request_type: string;
  tsubject: string;
  deptname: string;
  priority: number;
  flags: number;
  escalated: number;
  tags: number;
  creator_id: number;
  owner_id: number;
  group_id: number;
  client_parent: number;
  rpname: string;
  last_reply: number;
  status_color: string;
  lastreply_date: string;
}

export interface SocketType {
  user: string[];
  socketId: string[];
}

export type ActionHistoryStatusType = 'pending' | 'success' | 'failed';

export interface ActionHistoryType {
  action: string;
  user: ObjectId;
  status: ActionHistoryStatusType;
  createdAt: Date;
  successAt: Date;
}

export interface DepartmentType {
  code: string;
  name: string;
}

export type NotificationType = 'shopping' | 'cash' | 'ticket' | 'home';

export interface INotification {
  _id?: string;
  code: string;
  name: string;
  slug: string;
  type: NotificationType;
  reciever: string[];
  sender: string;
  content: string;
  status: boolean;
  readBy: string[];
}

export interface InvoiceType {
  object_id: number;
  status: string;
  date: string;
  duedate: string;
  paybefore: string;
  datepaid: string;
  subtotal: number;
  credit: number;
  tax: number;
  taxrate: number;
  tax2: number;
  taxrate2: number;
  taxexempt: number;
  total: number;
  rate: number;
  rate2: number;
  rate3: number;
  notes: string;
  client_id: number;
  items: any[];
  number: string;
  currency: string;
}

export interface EmailTokenType {
  user: string,
  token: string
}