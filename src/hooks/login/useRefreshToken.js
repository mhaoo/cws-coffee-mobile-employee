import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";
import {
  saveTokens,
  getRefreshToken,
  removeTokens,
} from "../../config/secureStore";

const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken)
        throw new Error("Không tìm thấy Refresh Token, yêu cầu đăng nhập lại.");

      const response = await authApi.refreshAccessToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      await saveTokens(accessToken, newRefreshToken);
      console.log("Access Token đã được làm mới!");
      return accessToken;
    },
    onError: async () => {
      console.error("Làm mới token thất bại! Đăng xuất...");
      await removeTokens(); // Xóa token nếu refresh thất bại
    },
  });
};

export default useRefreshToken;
