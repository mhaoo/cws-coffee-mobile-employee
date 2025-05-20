import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useBookingsByCurrentDateAndEmail = (email) => {
  return useQuery({
    queryKey: ["bookingsByCurrentDateAndEmail", email],
    queryFn: async () => {
      if (!email) return [];
      const response = await authApi.getBookingsByCurrentDateAndEmail(email);
      return response.data.content;
    },
    enabled: !!email,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
  });
};

export default useBookingsByCurrentDateAndEmail;
