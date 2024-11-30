import { appAxios } from "./apiInterceptors.js";
import { BASE_URI } from "./ApiManager.js";


export const createAgoraToken = async (data) => {
  try {
    const apiRes = await appAxios.post(`${BASE_URI}/token/agora_token`,data);

    return apiRes.data.data;
  } catch (error) {
    console.log("check data==>",error)
    throw error;
  }
};