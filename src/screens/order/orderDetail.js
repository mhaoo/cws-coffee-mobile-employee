import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import GeneralButton from "../../components/button/generalButton";
import { toCurrency } from "../../utils/currency";
import useOrdersByBookingId from "../../hooks/order/useOrdersByBookingId";
import useOrderDetailsById, {
  fetchOrderDetailsById,
} from "../../hooks/order/useOrderDetailsById";
import { useFocusEffect } from "@react-navigation/native";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import useDeleteItemToOrder from "../../hooks/order/useDeleteItemToOrder";
import useCompleteOrder from "../../hooks/order/useCompleteOrder";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderDetailScreen({ route, navigation }) {
  const { booking, updateBooking } = route.params;
  if (!booking) return null;

  // Fetch orders for this booking
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useOrdersByBookingId(booking.id);
  console.log("useOrdersByBookingId data:", orders);
  // Compute confirmed IDs for rendering
  const confirmedIds = useMemo(
    () => orders.filter((o) => o.status === "CONFIRMED").map((o) => o.id),
    [orders]
  );

  // 2) Với mỗi orderSummary.id, fetch chi tiết để lấy mảng items
  const detailsQueries = useQueries({
    queries: orders.map((o) => ({
      queryKey: ["orderDetailsByBooking", o.id],
      queryFn: () => fetchOrderDetailsById(o.id),
      enabled: !!o.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });

  // Hook for deleting order items
  const { mutate: deleteItem, isLoading: isDeleting } = useDeleteItemToOrder();
  // Hook for completing orders
  const { mutate: completeOrder, isLoading: isCompleting } = useCompleteOrder();
  // Expanded orders state
  const [expandedOrders, setExpandedOrders] = useState([]);
  // Query client for invalidation
  const queryClient = useQueryClient();

  // Loading state and map of order details
  const isLoadingDetails = detailsQueries.some((q) => q.isLoading);
  const orderDetailsMap = orders.reduce((map, o, idx) => {
    map[o.id] = detailsQueries[idx].data;
    return map;
  }, {});

  // Determine if booking is in 'Đang thực hiện' (confirmed and not expired)
  const now = new Date();
  const bookingEndDate = new Date(`${booking.bookingDate}T${booking.endTime}`);
  const isOngoingBooking =
    booking.status === "CONFIRMED" && bookingEndDate >= now;
  // Determine if this booking belongs to the History tab (canceled, expired, or past confirmed)
  const isHistoryBooking = !isOngoingBooking && booking.status !== "PENDING" && booking.status !== "PAID";
  // Prepare flattened item list for non-ongoing bookings
  const flattenedItems = detailsQueries.reduce(
    (all, q) => all.concat(q.data?.items || []),
    []
  );

  // Refetch orders when screen is focused (e.g., after adding item)
  useFocusEffect(
    useCallback(() => {
      refetchOrders();
    }, [refetchOrders])
  );

  // Nếu đang load summary hoặc details thì show loading
  if (ordersLoading || isLoadingDetails) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#93540A" />
      </View>
    );
  }

  // Total sum for display
  const totalSum =
    booking.room.price +
    detailsQueries
      .reduce((all, q) => all.concat(q.data?.items || []), [])
      .reduce((sum, x) => sum + x.price * x.quantity, 0);

  // Navigate to PaymentSummary instead of direct payment
  const handlePayBooking = () => {
    // Prepare updated booking for payment: use fetched items as order line items
    const lineItems = detailsQueries
      .reduce((all, q) => all.concat(q.data?.items || []), [])
      .map((i) => ({
        ...i,
        qty: i.quantity,
      }));
    const updatedBooking = {
      ...booking,
      orders: lineItems,
      devices: booking.devices || [],
    };
    // Update booking state before navigating
    updateBooking(updatedBooking);
    navigation.navigate("PaymentSummary", {
      booking: updatedBooking,
      total: totalSum,
      onSuccess: () => {
        // After payment success, update status to CONFIRMED
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        updateBooking({
          ...updatedBooking,
          status: "CONFIRMED",
          orders: updatedBooking.orders.map((o) => ({ ...o, status: "PAID" })),
          devices: updatedBooking.devices.map((d) => ({
            ...d,
            status: "PAID",
          })),
        });
      },
    });
  };

  // Handle confirming a single order/device
  const handleConfirmItem = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // No need to update confirmedIds here, it's already computed

    const newOrders = (booking.orders || []).map((o) =>
      o.id === item.id ? { ...o, status: "CONFIRMED" } : o
    );
    const newDevices = (booking.devices || []).map((d) =>
      d.id === item.id ? { ...d, status: "CONFIRMED" } : d
    );

    updateBooking({
      ...booking,
      orders: newOrders,
      devices: newDevices,
    });
  };

  // Render each order summary, expandable to show its items
  const renderOrder = ({ item: order, index }) => {
    const details = orderDetailsMap[order.id];
    const isExpanded = expandedOrders.includes(order.id);
    return (
      <View style={styles.orderContainer}>
        <View style={styles.orderSummary}>
          <Text style={styles.orderSummaryText}>Đơn #{order.id}</Text>
          {(order.status === "PENDING" || order.status === "CONFIRMED") ? (
            <TouchableOpacity
              style={[styles.completeBtn, order.status === "PENDING" && { borderColor: "#f0ad4e" }]}
              onPress={() =>
                completeOrder(order.id, {
                  onSuccess: () => {
                    Alert.alert("Thông báo", order.status === "PENDING" ? "Thanh toán thành công" : "Hoàn tất đơn thành công");
                    refetchOrders();
                  },
                  onError: (error) => Alert.alert("Lỗi", error.message),
                })
              }
              disabled={isCompleting}
            >
              <Text style={styles.completeBtnText}>
                {isCompleting ? "..." : order.status === "PENDING" ? "Thanh toán" : "Hoàn tất"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.doneLabel}>Đã hoàn tất</Text>
          )}
          <TouchableOpacity
            onPress={() =>
              setExpandedOrders((prev) =>
                prev.includes(order.id)
                  ? prev.filter((id) => id !== order.id)
                  : [...prev, order.id]
              )
            }
          >
            <Text style={styles.expandBtnText}>
              {isExpanded ? "Thu gọn" : "Chi tiết"}
            </Text>
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <View style={styles.orderItemsContainer}>
            {details?.items?.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.orderItem,
                  order.status === "CONFIRMED" && styles.confirmedItem,
                ]}
              >
                <Image
                  source={{ uri: item.images?.[0] }}
                  style={styles.itemImg}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSize}>Size: {item.size}</Text>
                  <Text style={styles.itemPrice}>
                    {toCurrency(item.price)} VNĐ • x{item.quantity}
                  </Text>
                  {item.options?.length > 0 && (
                    <Text style={styles.itemOptions}>
                      Options: {item.options.map((opt) => opt.name).join(", ")}
                    </Text>
                  )}
                  {item.note ? (
                    <Text style={styles.itemNote}>Ghi chú: {item.note}</Text>
                  ) : null}
                </View>
                <Text style={styles.itemTotal}>
                  {toCurrency(item.price * item.quantity)} VNĐ
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render flattened item list for non-ongoing bookings
  const renderFlattenItem = ({ item }) => {
    const isConfirmed = confirmedIds.includes(item.id);
    return (
      <View style={[styles.orderItem, isConfirmed && styles.confirmedItem]}>
        <Image source={{ uri: item.images?.[0] }} style={styles.itemImg} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.size && <Text style={styles.itemSize}>Size: {item.size}</Text>}
          <Text style={styles.itemPrice}>
            {toCurrency(item.price)} VNĐ • x{item.quantity}
          </Text>
          {item.options?.length > 0 && (
            <Text style={styles.itemOptions}>
              Options: {item.options.map((opt) => opt.name).join(", ")}
            </Text>
          )}
          {item.note && (
            <Text style={styles.itemNote}>Ghi chú: {item.note}</Text>
          )}
        </View>
        <Text style={styles.itemTotal}>
          {toCurrency(item.price * item.quantity)} VNĐ
        </Text>
        {!isHistoryBooking && booking.status === "CONFIRMED" && !isConfirmed && (
          <TouchableOpacity
            onPress={() => handleConfirmItem(item)}
            style={styles.confirmBtnWrapper}
          >
            <Text style={styles.confirmBtn}>Xác nhận</Text>
          </TouchableOpacity>
        )}
        {isConfirmed && <Text style={styles.doneLabel}>Đã hoàn tất</Text>}
        {!isHistoryBooking && (
          <TouchableOpacity
            onPress={() =>
              deleteItem(item.id, {
                onSuccess: () => {
                  Alert.alert("Thông báo", "Xóa sản phẩm thành công");
                  queryClient.invalidateQueries({
                    queryKey: ["orderDetailsByBooking"],
                  });
                  refetchOrders();
                },
                onError: (error) => Alert.alert("Lỗi", error.message),
              })
            }
            style={styles.deleteBtnWrapper}
            disabled={isDeleting}
          >
            <Text style={styles.deleteBtn}>{isDeleting ? "..." : "Xóa"}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Booking header */}
      <View style={styles.roomCard}>
        <Image
          source={{ uri: booking.room.images[0] }}
          style={styles.roomImg}
        />
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{booking.room.name}</Text>
          <Text style={styles.roomDetail}>
            Email: {booking.account?.email || booking.customerEmail || "-"}
          </Text>
          <Text style={styles.roomDetail}>
            Người đặt chỗ: {booking.account?.lastName}{" "}
            {booking.account?.firstName}
          </Text>
          <Text style={styles.roomDetail}>
            Ngày đặt chỗ: {booking.bookingDate || "-"}
          </Text>
          <Text style={styles.roomDetail}>
            Giờ thuê:{" "}
            {booking.startTime && booking.endTime
              ? `${booking.startTime} - ${booking.endTime}`
              : booking.room?.time || ""}
          </Text>
          <Text style={styles.roomDetail}>
            Vị trí: {booking.room.location || booking.room?.location || "-"}
          </Text>
        </View>
      </View>

      {/* Action buttons: Thêm SP, Thêm Thiết bị */}
      {!isHistoryBooking && (
        <View style={styles.detailActions}>
          <GeneralButton
            text="Thêm sản phẩm"
            onPress={() =>
              navigation.navigate("MainApp", {
                screen: "Menu",
                params: { booking, updateBooking },
              })
            }
            style={styles.detailBtn}
          />
          <GeneralButton
            text="Thêm thiết bị"
            onPress={() =>
              navigation.navigate("MainApp", {
                screen: "Thiết bị",
                params: { booking, updateBooking },
              })
            }
            style={styles.detailBtn}
          />
        </View>
      )}

      {/* Orders or items list depending on booking status */}
      {isOngoingBooking ? (
        <>
          <Text style={styles.sectionTitle}>Danh sách đơn Order</Text>
          <FlatList
            data={orders}
            keyExtractor={(o) => o.id.toString()}
            renderItem={renderOrder}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyTxt}>Chưa có đơn nào</Text>
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Đơn hàng kèm theo</Text>
          <FlatList
            data={flattenedItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFlattenItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyTxt}>Chưa có sản phẩm</Text>
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Footer action: pay booking if pending/paid*/}
      {(booking.status === "PENDING" || booking.status === "PAID") && (
        <View style={styles.footer}>
          <Text style={styles.totalTxt}>
            Tổng thanh toán: {toCurrency(totalSum)} VNĐ
          </Text>
          <GeneralButton text="Thanh toán đơn" onPress={handlePayBooking} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  listContainer: { paddingHorizontal: 16, paddingBottom: 80 },

  roomCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  roomImg: { width: 80, height: 80, borderRadius: 8 },
  roomInfo: { flex: 1, marginLeft: 12 },
  roomName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  roomDetail: { fontSize: 14, color: "#555", marginBottom: 2 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 12,
  },

  orderContainer: {
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    elevation: 1,
  },
  orderSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderSummaryText: { fontSize: 16, fontWeight: "600" },
  completeBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 6,
  },
  completeBtnText: { color: "#4CAF50", fontWeight: "600" },
  cancelOrderBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#d9534f",
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelOrderBtnText: { color: "#d9534f", fontWeight: "600" },
  expandBtnText: { color: "#93540A", fontWeight: "600", marginLeft: 8 },
  orderItemsContainer: { marginTop: 8 },

  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
    elevation: 1,
  },
  confirmedItem: { backgroundColor: "#e0f7fa" },

  itemImg: { width: 50, height: 50, borderRadius: 6 },
  itemInfo: { flex: 1, marginHorizontal: 12 },
  itemName: { fontSize: 15, color: "#333" },
  itemSize: { fontSize: 13, color: "#666", marginTop: 2 },
  itemPrice: { fontSize: 13, color: "#666", marginTop: 2 },
  itemTotal: { fontSize: 15, fontWeight: "600", color: "#222" },

  confirmBtnWrapper: { marginLeft: 8 },
  confirmBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#93540A",
    borderRadius: 6,
    color: "#93540A",
    fontWeight: "600",
  },
  doneLabel: {
    marginLeft: 8,
    color: "#4CAF50",
    fontWeight: "700",
  },

  emptyTxt: { textAlign: "center", marginTop: 12, color: "#777" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalTxt: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  detailActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  detailBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#93540A",
    borderRadius: 6,
    color: "#93540A",
    fontWeight: "600",
    marginHorizontal: 4,
  },

  // Styles for displaying item details
  itemOptions: { fontSize: 12, color: "#555", marginTop: 2 },
  itemNote: { fontSize: 12, color: "#555", fontStyle: "italic", marginTop: 2 },

  deleteBtnWrapper: { marginLeft: 8 },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#93540A",
    borderRadius: 6,
    color: "#93540A",
    fontWeight: "600",
  },
});
