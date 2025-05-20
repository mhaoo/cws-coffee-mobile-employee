import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useBookingsByEmail = (email) => {
  return useQuery({
    queryKey: ["bookingsByEmail", email],
    queryFn: async () => {
      if (!email) return [];
      const response = await authApi.getBookingsByEmail(email);
      return response.data.content;
    },
    enabled: !!email,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
  });
};

export default useBookingsByEmail;
