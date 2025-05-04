import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import GeneralButton from "../../components/button/generalButton";
import { toCurrency } from "../../utils/currency";

const { width } = Dimensions.get("window");

const CartItem = ({ item }) => (
  <View style={styles.cartItem}>
    <Image source={{ uri: item.img }} style={styles.itemImg} />
    <View style={{ flex: 1, marginHorizontal: 12 }}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>
        {toCurrency(item.price)} VNĐ • x{item.qty}
      </Text>
    </View>
    <Text style={styles.itemTotal}>
      {toCurrency(item.price * item.qty)} VNĐ
    </Text>
  </View>
);

export default function OrderDetail() {
  const nav = useNavigation();
  const { params } = useRoute();
  const updateStatus = params?.updateStatus ?? (() => {});
  const order = params?.order;

  if (!order) return null;

  /* ---- tổng tiền ---- */
  const prodSum = order.products.reduce((t, p) => t + p.price * p.qty, 0);
  const totalPay = order.room.price + prodSum;

  /* ---- handlers ---- */
  const markPaid = () => {
    updateStatus(order.id, "DOING");
    nav.goBack();
  };
  const markDone = () => {
    updateStatus(order.id, "DONE");
    nav.navigate("OrderSummary", { order });
  };

  return (
    <View style={styles.container}>
      {/* phòng */}
      <View style={styles.roomCard}>
        <Image source={{ uri: order.room.img }} style={styles.roomImg} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.roomName}>{order.room.name}</Text>
          <Text style={styles.roomInfo}>
            Sức chứa tối đa: {order.room.capacity}
          </Text>
          <Text style={styles.roomInfo}>
            Giá phòng: {toCurrency(order.room.price)} VNĐ
          </Text>
          <Text style={styles.roomInfo}>Khung giờ: {order.room.time}</Text>
          <Text style={styles.roomInfo}>
            Khách: {order.customerEmail || "Khách lẻ"}
          </Text>
          <Text style={styles.roomInfo}>NV: {order.staffEmail}</Text>
        </View>
      </View>

      {/* sản phẩm */}
      <Text style={styles.sectionTitle}>Sản phẩm</Text>
      <FlatList
        data={order.products}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => <CartItem item={item} />}
        ListEmptyComponent={
          <Text style={{ color: "#777", textAlign: "center", marginTop: 8 }}>
            Chưa có sản phẩm
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* footer */}
      <View style={styles.bottom}>
        <Text style={styles.label}>Tổng thanh toán</Text>
        <Text style={styles.total}>{toCurrency(totalPay)} VNĐ</Text>

        {order.status === "PENDING" && (
          <GeneralButton text="Thanh toán & Bắt đầu" onPress={markPaid} />
        )}

        {order.status === "DOING" && (
          <GeneralButton text="Hoàn thành" onPress={markDone} />
        )}
      </View>
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fafafa" },
  roomCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
  },
  roomImg: { width: 80, height: 80, borderRadius: 8 },
  roomName: { fontSize: 18, fontWeight: "700" },
  roomInfo: { fontSize: 14, color: "#555", marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: "600", marginVertical: 8 },

  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  itemImg: { width: 60, height: 60, borderRadius: 6 },
  itemName: { fontSize: 15, color: "#333" },
  itemPrice: { fontSize: 13, color: "#666", marginTop: 2 },
  itemTotal: { fontSize: 15, fontWeight: "600", color: "#222" },

  bottom: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 14,
  },
  label: { fontSize: 15, color: "#666" },
  total: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
});
