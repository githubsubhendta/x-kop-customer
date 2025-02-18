import { useState, useCallback, useEffect } from "react";
import { appAxios } from "./apiInterceptors.js";
import { BASE_URI } from "./ApiManager.js";
// import useCallHistoryStore from "../stores/callHistory.store.js";

export const getAllCallHistory = async (page=1) => {
  try {
    const apiRes = await appAxios.get(`${BASE_URI}/consultation/consultList?page=${page}&limit=10`);
    return apiRes.data.data;
  } catch (error) {
    console.log("check data==>",error)
    return [];
  }
};

const useCallHistory = () => {
    const [callHistory, setCallHistory] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
  
    const fetchCallHistory = useCallback(async () => {
      if (loading || !hasMore) return;
      
      setLoading(true);
      try {
        const newData = await getAllCallHistory(page);
        if (newData.consultations.length > 0) {
          setCallHistory((prev) => [...prev, ...newData.consultations]);
          setPage((prevPage) => prevPage + 1);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to load call history:", error);
      } finally {
        setLoading(false);
      }
    }, [page, loading, hasMore]);
  
    useEffect(() => {
      fetchCallHistory();
    }, []);
  
    return { callHistory, fetchCallHistory, loading, hasMore };
  };
  
  export default useCallHistory;