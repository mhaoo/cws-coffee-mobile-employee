import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to add an item to a booking order
 * @returns {object} Mutation object from react-query
 */
const useAddItemToOrder = () => {
  return useMutation({
    mutationFn: ({ bookingId, item }) =>
      authApi.addItemToOrder(bookingId, item),
  });
};

export default useAddItemToOrder; 