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

export const updateSchedule = async (id, updatedData) => {
  try {
    const response = await appAxios.put(
      `${BASE_URI}/officer_schedule/schedules/${id}`,
      updatedData,
    );
    if (response.data) {
      return response.data;
    } else {
      throw new Error('Unexpected response structure');
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const deleteSchedule  = async (scheduleId,userId)=>{
try {
  const res = await appAxios.delete(`${BASE_URI}/officer-schedule/schedules/${scheduleId}`,{
    userId
  });
  return res.data
} catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
}
