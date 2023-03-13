import axios from 'axios';
import { IAuthentication } from '../interfaces';

const source = axios.CancelToken.source();

export const axiosClientNonAuth = axios.create({
  baseURL: 'https://manager.idcviettel.com/api',
});

export const axiosClient = axios.create({
    baseURL :'http://manager.idcviettel.com/admin'
})

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
// export const axiosClientAuth = (token: string = '') => axios.create({
export const axiosClientAuth = (token = '') =>
  axios.create({
    baseURL: 'https://manager.idcviettel.com/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const authentication = (data: IAuthentication) => {
  return axiosClientNonAuth.post(`/login`, data);
};

export const refreshVietelToken = (refreshtoken: string) => {
  return axiosClientNonAuth.post(`/token`, {
    refresh_token: refreshtoken,
  });
};
