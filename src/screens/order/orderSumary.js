import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function OrderSummary() {
  const { params } = useRoute();
  const order = params?.order;
  if (!order) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.big}>Đơn {order.code} đã hoàn tất 🎉</Text>
      <Text>Khách: {order.customerEmail || "Khách lẻ"}</Text>
      <Text>Phòng: {order.room.name}</Text>
      <Text>Tổng thu: {order.room.price} + sản phẩm …</Text>
      {/* tuỳ bạn hiển thị thêm */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  big: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
});
