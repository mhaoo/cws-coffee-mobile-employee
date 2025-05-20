import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch rooms with status for a given branch
 * @param {string|number} branchId - ID of the branch
 * @returns {object} Query object from react-query
 */
const useRoomsWithStatus = (branchId) => {
  return useQuery({
    queryKey: ["roomsWithStatus", branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const response = await authApi.getRoomsWithStatus(branchId);
      return response.data;
    },
    enabled: !!branchId,
    staleTime: 1000 * 60 * 5, // cache 5 minutes
    cacheTime: 1000 * 60 * 30, // keep cache 30 minutes
    retry: 1, // retry once on failure
  });
};

export default useRoomsWithStatus;
