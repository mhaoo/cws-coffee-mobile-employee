import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";
import { useAuth } from "../../contexts/authContext";

/**
 * Hook to fetch rooms for a given branch and room type.
 * @param {number|string} roomTypeId - The ID of the room type to filter by.
 */
const useRoomsByBranchIdAndRoomTypeId = (roomTypeId) => {
  const { branchId } = useAuth();

  return useQuery({
    queryKey: ["roomsWithType", branchId, roomTypeId],
    queryFn: () =>
      authApi
        .getRoomsByBranchIdAndRoomTypeId(branchId, roomTypeId)
        .then((res) => res.data),
    enabled: !!branchId && !!roomTypeId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
};

export default useRoomsByBranchIdAndRoomTypeId;
