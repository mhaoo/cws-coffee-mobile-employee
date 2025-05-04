import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";
import { useAuth } from "../../contexts/authContext";

export default function useRoomsByBranch() {
  const { branchId } = useAuth();

  return useQuery({
    queryKey: ["rooms", branchId],
    queryFn: () =>
      authApi.getRoomsByBranchId(branchId).then((res) => res.data.content),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 10,
  });
}
