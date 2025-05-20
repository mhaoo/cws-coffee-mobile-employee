// src/hooks/profile/useCustomerInformation.js
import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

export default function useCustomerInformation(email) {
  return useQuery({
    queryKey: ["customerInformation", email],
    queryFn: async () => {
      if (!email) return null;
      try {
        const res = await authApi.getCustomerInformation(email);
        return res.data;
      } catch (err) {
        // nếu server trả về { message: "..." } trong body
        const msg = err.response?.data?.message || "Lỗi không xác định";
        // ném error với message của server
        throw new Error(msg);
      }
    },
    enabled: !!email,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
  });
}
