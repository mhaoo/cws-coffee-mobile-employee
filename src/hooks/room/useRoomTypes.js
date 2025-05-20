import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch all room types.
 */
const useRoomTypes = () => {
  return useQuery({
    queryKey: ["roomTypes"],
    queryFn: () =>
      authApi.getRoomTypes().then((res) => res.data.content ?? res.data),
    staleTime: 1000 * 60 * 10, // cache 10 minutes
    retry: 1,
  });
};

export default useRoomTypes;
