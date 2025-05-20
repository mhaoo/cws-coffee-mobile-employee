import apiClient from "./apiClient";

const authApi = {
  login: (email, password) =>
    apiClient.post("/api/auth/login", { email, password }),

  refreshAccessToken: (refreshToken) =>
    apiClient.post("/api/auth/refresh-token", { refreshToken }),

  getProfile: () => apiClient.get("/api/employee"),

  getCustomerInformation: (email) =>
    apiClient.get("/api/employee/bookings/info-user", { params: { email } }),

  getBranchesDetailById: (branchId) =>
    apiClient.get(`/api/employee/branches/${branchId}`),

  getRoomsByBranchId: (branchId) =>
    apiClient.get(`/api/employee/rooms/${branchId}`),

  getRoomsDetailById: (id) =>
    apiClient.get(`/api/employee/rooms/details/${id}`),

  //* API lấy danh sách tất cả các loại phòng
  getRoomTypes: () => apiClient.get(`/api/employee/room-type/all`),

  //* API lấy danh sách các phòng theo BranchId và RoomTypeId
  getRoomsByBranchIdAndRoomTypeId: (branchId, roomTypeId) =>
    apiClient.get(
      `/api/employee/rooms/rooms-with-type/b/${branchId}/rt/${roomTypeId}`
    ),

  //* API kiểm tra slot trống trước khi đặt chỗ
  getAvailableSlots: (roomId, date) =>
    apiClient.get(`/api/employee/bookings/available-slots`, {
      params: { roomId, date },
    }),

  //* API gửi yêu cầu đặt chỗ
  bookSeat: (roomId, bookingData) =>
    apiClient.post(`/api/employee/bookings/${roomId}`, bookingData),

  getBookingsDetailById: (id) =>
    apiClient.get(`/api/customer/bookings/details/${id}`), //TODO lấy thông tin đơn đặt chỗ bằng id đơn hàng

  //* API hủy booking đã đặt
  cancelBooking: (bookingId) =>
    apiClient.put(`/api/employee/bookings/cancel/${bookingId}`),

  //! CATEGORY:
  //* API lấy danh sách toàn bộ tên category
  getCategories: () => apiClient.get(`/api/employee/categories`),

  //* API lấy thông tin chi tiết từng category theo id
  getCategoryById: (id) => apiClient.get(`/api/employee/categories/${id}`),

  //! PRODUCT:
  //* API lấy thông tin chi tiết từng product theo id
  getProductsById: (id) => apiClient.get(`/api/employee/product/${id}`),

  //* API tìm kiếm product
  searchProducts: (queryParams) =>
    apiClient.get(`/api/employee/product/search`, { params: queryParams }),

  //* API lấy danh sách các product theo từng groupId
  getProductsByGroupId: (groupId) =>
    apiClient.get(`/api/public/products/groups/${groupId}`),

  //* API lấy danh sách tên các product-group theo categoryId
  getProductGroupsByCategoryId: (
    categoryId,
    page = 0,
    limit = 30,
    sortBy = "createdAt",
    sortDir = "desc"
  ) =>
    apiClient.get(`/api/public/product-groups/${categoryId}`, {
      params: { page, limit, sortBy, sortDir },
    }),

  //* API lấy danh sách các product theo categoryId
  getProductsByCategoryId: (categoryId) =>
    apiClient.get(`/api/employee/product/category/${categoryId}`),

  //! ORDER
  //* API lấy các đơn Booking theo ngày
  getBookingsByDate: (date) =>
    apiClient.get(`/api/employee/bookings/bookings-by-date`, {
      params: { date },
    }),

  //* API lấy các đơn Booking theo email của khách hàng
  getBookingsByEmail: (email) =>
    apiClient.get(`/api/employee/bookings/bookings-by-email`, email),

  //* API lấy các đơn Booking theo ngày hiện tại và Email của khách hàng
  getBookingsByCurrentDateAndEmail: (email) =>
    apiClient.get(
      `/api/employee/bookings/bookings-by-current-date-and-email`,
      email
    ),

  //* API lấy danh sách các đơn Order của đơn Booking theo BookingId
  getOrdersByBookingId: (bookingId) =>
    apiClient.get(`/api/employee/orders/by-booking/${bookingId}`, {
      params: { bookingId },
    }),

  //* API lấy thông tin chi tiết của đơn Order theo id
  getOrderDetailsById: (id) =>
    apiClient.get(`/api/employee/orders/details/${id}`),

  //* API thêm các sản phẩm vào đơn Order
  addItemToOrder: (bookingId, item) =>
    apiClient.post(`/api/employee/orders/add-item`, { bookingId, item }),

  //* API xóa các sản phẩm khỏi đơn Order
  deleteItemToOrder: (itemId) =>
    apiClient.delete(`/api/employee/orders/delete-item/${itemId}`),

  //* API cập nhật trạng thái đơn order thành completed
  completedOrder: (id) => apiClient.put(`/api/employee/orders/completed/${id}`),

  //! PAYMENT
  //* API gửi yêu cầu thanh toán của đơn booking
  // body should include { paymentMethod: 'CASH'|'CARD', usedMemberPoint: number, cash: number }
  payBooking: (bookingId, body) =>
    apiClient.post(`/api/employee/bookings/payment/${bookingId}`, body),

  //* API tạo payment intent
  createPaymentIntentBooking: (amount, bookingId) =>
    apiClient.post("/api/payments/create-payment-intent-booking", {
      amount,
      bookingId,
    }),

  //! SEAT MANAGEMENT
  //* API lấy danh sách các phòng với trạng thái chi tiết
  getRoomsWithStatus: (branchId) =>
    apiClient.get(`/api/employee/rooms/rooms-with-status/${branchId}`),
};

export default authApi;
