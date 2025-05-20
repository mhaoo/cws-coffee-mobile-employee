import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const usePayBooking = () => {
  return useMutation({
    mutationFn: (bookingId) => authApi.payBooking(bookingId),
  });
};

export default usePayBooking; 