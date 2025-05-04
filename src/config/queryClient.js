import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  //   defaultOptions: {
  //     queries: {
  //       staleTime: 1000 * 60 * 5, // Dữ liệu cache trong 5 phút
  //       cacheTime: 1000 * 60 * 10, // Cache sẽ bị xóa sau 10 phút
  //       refetchOnWindowFocus: false, // Không tự động refetch khi chuyển màn hình
  //     },
  //   },
});

export default queryClient;
