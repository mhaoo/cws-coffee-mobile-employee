import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useAvailableSlots = ({ roomId, date }) => {
  return useQuery({
    queryKey: ["availableSlots", roomId, date],
    queryFn: async () => {
      if (!roomId || !date) return [];

      console.log("Fetching available slots with:", { roomId, date });

      const response = await authApi.getAvailableSlots(roomId, date);
      console.log("API Response:", response.data);

      return response.data;
    },
    enabled: !!roomId && !!date,
  });
};

export default useAvailableSlots;
