import axios from "axios";
import { BASE_URI } from "./ApiManager";

export const appAxios = axios.create({
    baseURL:BASE_URI
});

export const refresh_tokens = async()=>{
    try {
        const refreshToken = await AsyncStorage.getItem('Authorized_data');
        const response =await axios.post(`${BASE_URI}/users/refresh-token`, { refreshToken: refreshToken.refreshToken }, {
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
        console.log("refresh token error");
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
        if(error.response && error.status == 401){
            try {
                const newToken = await refresh_tokens();
                if(newToken){
                  error.config.headers.Authorization = `Bearer ${newToken}`;
                  return axios(error.config);
                }
            } catch (error) {
                console.log("Error Refreshing Token")
            }
        }
        if(error.response && error.response.status != 401){
            const message = error.response.message || "Token Expired";
        }
        return Promise.reject(error);
    }
)
