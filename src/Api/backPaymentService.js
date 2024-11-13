import { useState, useEffect } from "react";
import { appAxios } from "./apiInterceptors.js";
import { BASE_URI } from "./ApiManager.js";

export const getAllPayment = async (page = 1) => {
  try {
    const apiRes = await appAxios.get(`${BASE_URI}/payment/getbankPayment?page=${page}&limit=10`);
    return apiRes.data.data;
  } catch (error) {
    throw error;
  }
};

export const useBankPaymentList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentList, setPaymentList] = useState([]);
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true); 

  const getAllpaymentList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPayment(page);
      const transactions = Array.isArray(data.transactions_users) ? data.transactions_users : []; 
      setPaymentList(prevList => [...prevList, ...transactions]); 
      setHasMore(transactions.length > 0); 
    } catch (error) {
      setError(error.response);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    getAllpaymentList();
  }, [page]); 

  const loadMore = () => {
    if (hasMore) setPage(prevPage => prevPage + 1);
  };

  return { loading, error, paymentList, loadMore, hasMore };
};
