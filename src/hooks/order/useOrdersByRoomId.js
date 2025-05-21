import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch all orders for a given room ID
 * @param {string|number} roomId - The ID of the room
 */
const useOrdersByRoomId = (roomId) => {
  return useQuery({
    queryKey: ["ordersByRoomId", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const response = await authApi.getOrdersByRoomId(roomId);
      return response.data.content;
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
};

export default useOrdersByRoomId; 