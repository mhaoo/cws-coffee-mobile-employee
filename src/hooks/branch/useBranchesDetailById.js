import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";
import { useAuth } from "../../contexts/authContext";

const useBranchDetailById = () => {
  const { branchId } = useAuth();

  return useQuery({
    queryKey: ["branchDetail", branchId],
    queryFn: () =>
      authApi.getBranchesDetailById(branchId).then((res) => res.data),
    enabled: !!branchId,
    staleTime: 1000 * 60 * 10, // Cache trong 10 phút
    retry: 1, // Thử lại 1 lần nếu lỗi
  });
};

export default useBranchDetailById;
