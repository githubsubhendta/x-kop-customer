import { appAxios } from "./apiInterceptors"
import { BASE_URI } from "./ApiManager"


export const bankDetails = async () =>{
    const response = await appAxios.post(`${BASE_URI}/Bank`)
} 