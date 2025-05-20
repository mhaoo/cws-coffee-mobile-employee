import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

const useRoomDetailById = (roomId) => {
  return useQuery({
    queryKey: ["roomDetail", roomId], // Cache theo từng roomId
    queryFn: () => authApi.getRoomsDetailById(roomId).then((res) => res.data),
    enabled: !!roomId, // Chỉ chạy nếu có roomId
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
    retry: 1, // Thử lại 1 lần nếu lỗi
  });
};

export default useRoomDetailById;
