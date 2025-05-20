import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useBookSeat = () => {
  return useMutation({
    mutationFn: ({ roomId, bookingData }) =>
      authApi.bookSeat(roomId, bookingData),
  });
};

export default useBookSeat;
