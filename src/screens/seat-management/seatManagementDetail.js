import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { toCurrency } from "../../utils/currency";
import { useToday } from "../../hooks/utils/useTodayDate";
import useRoomDetailById from "../../hooks/room/useRoomDetailById";
import useOrdersByRoomId from "../../hooks/order/useOrdersByRoomId";

export default function SeatDetailScreen() {
  const route = useRoute();
  const { room: seat } = route.params;
  const today = useToday();
  const {
    data: detail,
    isLoading: isDetailLoading,
    error: detailError,
  } = useRoomDetailById(seat.id);
  // Orders for this room
  const [showOrders, setShowOrders] = useState(false);
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrdersByRoomId(seat.id);
  if (!seat) return null;

  if (isDetailLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#93540A" />
      </View>
    );
  }
  if (detailError) {
    return (
      <View style={styles.loading}>
        <Text>Lỗi: {detailError.message}</Text>
      </View>
    );
  }
  const room = detail;

  // Map seat.status to a human label
  const statusLabel =
    room.status === "EMPTY"
      ? "Đang trống"
      : room.status === "USING"
      ? "Đang được sử dụng"
      : room.status;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with image and name */}
      <View style={styles.header}>
        {room.images?.[0] && (
          <Image source={{ uri: room.images[0] }} style={styles.headerImage} />
        )}
        <Text style={styles.headerTitle}>{room.name}</Text>
      </View>
      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tình trạng</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.cardValue}>{statusLabel}</Text>
          <Text style={styles.cardDate}>{today}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Hoạt động</Text>
          <Text style={styles.cardValue}>{room.active ? "Có" : "Không"}</Text>
        </View>
      </View>
      {/* Section: Thông tin phòng */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin phòng</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Mã vị trí</Text>
            <Text style={styles.value}>{room.code}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Sức chứa</Text>
            <Text style={styles.value}>{room.capacity} người</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Điểm đánh giá trung bình</Text>
            <Text style={styles.value}>{room.ratingAverage}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Trạng thái thuê</Text>
            <Text style={styles.value}>
              {room.status === "EMPTY" ? "Đang thuê" : "Đang trống"}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Giá thuê</Text>
            <Text style={styles.value}>{toCurrency(room.price)} VNĐ/giờ</Text>
          </View>
        </View>
      </View>
      {/* Section: Đơn hàng */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đơn hàng</Text>
        {ordersLoading ? (
          <ActivityIndicator size="small" color="#93540A" />
        ) : ordersError ? (
          <Text style={styles.errorTxt}>Lỗi: {ordersError.message}</Text>
        ) : orders && orders.length > 0 ? (
          <>
            <TouchableOpacity onPress={() => setShowOrders((prev) => !prev)}>
              <Text style={styles.buttonTxt}>
                {showOrders
                  ? "Ẩn danh sách đơn hàng"
                  : "Xem danh sách đơn hàng"}
              </Text>
            </TouchableOpacity>
            {showOrders &&
              orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <Text>Mã đơn: {order.orderCode}</Text>
                  <Text>Trạng thái: {order.status}</Text>
                  <Text>Tổng giá: {toCurrency(order.totalPrice)} VNĐ</Text>
                  <Text>Mã đơn đặt phòng: {order.booking.id}</Text>
                  <Text>Ngày đặt: {order.booking.bookingDate}</Text>
                  <Text>
                    Thời gian đặt phòng: {order.booking.startTime} -{" "}
                    {order.booking.endTime}
                  </Text>
                  <Text>Trạng thái đơn đặt phòng: {order.booking.status}</Text>
                  <Text>
                    Tổng giá đơn đặt phòng: {toCurrency(order.booking.price)}{" "}
                    VNĐ
                  </Text>
                  <Text>
                    Khách hàng: {order.booking.account.firstName}{" "}
                    {order.booking.account.lastName} (
                    {order.booking.account.email})
                  </Text>
                  <Text>
                    Tình trạng tài khoản:{" "}
                    {order.booking.account.active
                      ? "Đang hoạt động"
                      : "Đang tạm khóa"}
                  </Text>
                </View>
              ))}
          </>
        ) : (
          <Text style={styles.emptyTxt}>Chưa có đơn hàng nào</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  contentContainer: { padding: 16 },
  header: { alignItems: "center", marginBottom: 24 },
  headerImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardValue: { fontSize: 14, color: "#555" },
  cardDate: { fontSize: 12, color: "#999" },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 6,
  },
  sectionContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
  },
  col: { flex: 1 },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 16, color: "#333", marginTop: 2 },
  date: { fontSize: 14, color: "#999" },
  emptyTxt: { color: "#777", fontStyle: "italic", marginTop: 8 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorTxt: { color: "red", fontStyle: "italic", marginTop: 8 },
  buttonTxt: { color: "#93540A", fontWeight: "600", marginTop: 8 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
