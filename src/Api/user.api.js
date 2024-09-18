// import {BASE_URI} from './ApiManager.js';
// import axios from 'axios';

// export const userLogin = async data => {
//   return await axios.post(BASE_URI + '/users/signin', data, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// };

// export const userSignup = async data => {
//   return await axios.post(BASE_URI + '/users/signup', data, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// };

// export const verifyOTP = async data => {

//   return await axios.post(BASE_URI + '/users/verify', data, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

// };

// export const getCurrentUser = async Auth_data => {
//   return await axios.get(`${BASE_URI}/users/current-user`, {
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${Auth_data.accessToken}`,
//     },
//   });
// };


// export const refreshToken = async data => {
//   return await axios.post(`${BASE_URI}/users/refresh-token`, data, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// };

// export const logoutUser = async Auth_data => {
//   return await axios.post(
//     `${BASE_URI}/users/logout`,
//     {},
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${JSON.parse(Auth_data).accessToken}`,
//       },
//     },
//   );
// };


// export const updateAvatar = async (Auth_data,data) => {

//   return await axios.patch(
//     `${BASE_URI}/users/avatar`,
//     data,
//     {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         'Authorization': `Bearer ${Auth_data}`,
//       },
//     },
//   );
// };


import { BASE_URI } from './ApiManager.js';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: BASE_URI,
  headers: { 'Content-Type': 'application/json' },
});

export const userLogin = (data) => axiosInstance.post('/users/signin', data);
export const userSignup = (data) => axiosInstance.post('/users/signup', data);
export const verifyOTP = (data) => axiosInstance.post('/users/verify', data);

export const getCurrentUser = (Auth_data) => axiosInstance.get('/users/current-user', {
  headers: { Authorization: `Bearer ${Auth_data.accessToken}` },
});

export const refreshToken = (data) => axiosInstance.post('/users/refresh-token', data);

export const logoutUser = (Auth_data) => axiosInstance.post('/users/logout', {}, {
  headers: { Authorization: `Bearer ${JSON.parse(Auth_data).accessToken}` },
});

export const updateAvatar = (Auth_data, data) => {
  return axiosInstance.patch('/users/avatar', data, {
    headers: {
      'Authorization': `Bearer ${Auth_data}`,
      'Content-Type': 'multipart/form-data'
    },
  });
};
