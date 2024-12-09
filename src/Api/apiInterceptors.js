import axios from "axios";
import { BASE_URI } from "./ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const appAxios = axios.create({
    baseURL:BASE_URI
});

export const refresh_tokens = async()=>{
    try {
        const refreshToken = await AsyncStorage.getItem('Authorized_data');
       
        const response = await axios.post(`${BASE_URI}/users/refresh-token`, { refreshToken: JSON.parse(refreshToken).refreshToken }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const authData = {
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          };
          await AsyncStorage.setItem('Authorized_data', JSON.stringify(authData));
          return authData.accessToken;
          
    } catch (error) {
       await AsyncStorage.removeItem('Authorized_data');
        throw error
    }
}

appAxios.interceptors.request.use(async config =>{
    const token = await AsyncStorage.getItem('Authorized_data');
    if(token?.accessToken){
      config.headers.Authorization = `Bearer ${token.accessToken}`
    }
    return config;
})

appAxios.interceptors.response.use(
    response => response,
    async error=>{
        if(error.response && error.response.status == 401){
            try {
                const newToken = await refresh_tokens();
                if(newToken){
                  error.config.headers.Authorization = `Bearer ${newToken}`;
                  return axios(error.config);
                }
            } catch (error) {
                console.log("Error Refreshing Token",error)
            }
        }
        if(error.response && error.response.status != 401){
            const message = error.response.message || "Token Expired";
        console.log("check updated token error===",message)
        }
        return Promise.reject(error);
    }
)

