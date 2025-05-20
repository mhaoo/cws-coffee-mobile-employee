import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useCancelBooking = () => {
  return useMutation({
    mutationFn: (bookingId) => authApi.cancelBooking(bookingId),
  });
};

export default useCancelBooking; 