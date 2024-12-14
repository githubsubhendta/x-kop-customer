import {appAxios} from './apiInterceptors.js';
import {BASE_URI} from './ApiManager.js';

export const getAllSchedules = async (page = 1) => {
  try {
    const apiRes = await appAxios.get(
      `${BASE_URI}/officer_schedule/schedule-customer`,
    );
    return apiRes.data.data;
  } catch (error) {
    return [];
  }
};
