import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const usePayBooking = () => {
  return useMutation({
    mutationFn: ({ bookingId, ...body }) => authApi.payBooking(bookingId, body),
  });
};

export default usePayBooking; 