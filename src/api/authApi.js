import apiClient from "./apiClient";

const authApi = {
  login: (email, password) =>
    apiClient.post("/api/auth/login", { email, password }),

  refreshAccessToken: (refreshToken) =>
    apiClient.post("/api/auth/refresh-token", { refreshToken }),

  getProfile: () => apiClient.get("/api/employee"),

  getRoomsByBranchId: (branchId) =>
    apiClient.get(`/api/employee/rooms/${branchId}`),

  getRoomsDetailById: (id) =>
    apiClient.get(`/api/employee/rooms/details/${id}`),

  //* API kiểm tra slot trống trước khi đặt chỗ
  getAvailableSlots: (roomId, date) =>
    apiClient.get(`/api/employee/bookings/available-slots`, {
      params: { roomId, date },
    }),

  //* API gửi yêu cầu đặt chỗ
  bookSeat: (roomId, bookingData) =>
    apiClient.post(`/api/employee/bookings/${roomId}`, bookingData),
  // bookSeat: (roomId, bookingData, accessToken) =>
  //   apiClient.post(`/api/customer/bookings/${roomId}`, bookingData, {
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //   }),

  //* API tạo payment intent
  createPaymentIntentBooking: (amount, bookingId) =>
    apiClient.post("/api/payments/create-payment-intent-booking", {
      amount,
      bookingId,
    }),

  getBookingsDetailById: (id) =>
    apiClient.get(`/api/customer/bookings/details/${id}`), //TODO lấy thông tin đơn đặt chỗ bằng id đơn hàng
};
export default authApi;
