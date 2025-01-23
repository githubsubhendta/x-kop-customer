import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URI } from '../Api/ApiManager';
import userStoreAction from '../stores/user.store';

const useHttpRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const User = userStoreAction();

  const fetchData = async (endpoint, method = 'GET', requestData = null) => {
    setLoading(true);
  
    try {
      let response;
      if (method === 'GET') {
        response = await axios.get(BASE_URI+endpoint, { headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${User.accessToken}`,
    } });
      } else if (method === 'POST') {
        response = await axios.post(BASE_URI+endpoint, requestData, {  headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${User.accessToken}`,
          } });
      } else if(method === "PUT"){
        response = await axios.put(BASE_URI+endpoint, requestData, {  headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${User.accessToken}`,
        } });
      }
      else if(method === "PATCH"){
        response = await axios.patch(BASE_URI+endpoint, requestData, {  headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${User.accessToken}`,
        } });
      }
       else if(method === "DELETE"){
        response = await axios.delete(BASE_URI+endpoint, {  headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${User.accessToken}`,
        } });
      }
      setData(response.data);
    } catch (error) {
      setError(error.response);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, fetchData };
};

export default useHttpRequest;
