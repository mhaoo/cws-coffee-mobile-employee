import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch all orders for a given booking ID
 * @param {string|number} bookingId - The ID of the booking
 */
const useOrdersByBookingId = (bookingId) => {
  return useQuery({
    queryKey: ["ordersByBookingId", bookingId],
    queryFn: async () => {
      if (!bookingId) return [];
      const response = await authApi.getOrdersByBookingId(bookingId);
      return response.data.content;
    },
    enabled: !!bookingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
};

export default useOrdersByBookingId;
