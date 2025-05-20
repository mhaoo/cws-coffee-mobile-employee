import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useBookingsByDate = (date) => {
  return useQuery({
    queryKey: ["bookingsByDate", date],
    queryFn: async () => {
      if (!date) return [];
      const response = await authApi.getBookingsByDate(date);
      return response.data.content;
    },
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // dữ liệu trong 5 phút
    cacheTime: 1000 * 60 * 5, // cache giữ 30 phút
    retry: 1, // thử lại 1 lần khi lỗi
  });
};

export default useBookingsByDate;
