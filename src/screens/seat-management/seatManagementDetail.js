import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { toCurrency } from "../../utils/currency";
import { useToday } from "../../hooks/utils/useTodayDate";

export default function SeatDetailScreen() {
  const route = useRoute();
  const { seat } = route.params;
  const today = useToday();
  if (!seat) return null;

  // Map seat.status to a human label
  const statusLabel = seat.status === "available" ? "Sẵn sàng" : "Đang sử dụng";

  return (
    <ScrollView style={styles.container}>
      {/* Section: Tình trạng chỗ ngồi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tình trạng chỗ ngồi</Text>
        <View style={styles.sectionContentRow}>
          <Text style={styles.value}>{statusLabel}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
      </View>

      {/* Section: Thông tin chỗ ngồi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin chỗ ngồi</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Mã vị trí</Text>
            <Text style={styles.value}>{seat.label}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Sức chứa</Text>
            <Text style={styles.value}>{seat.capacity} người</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Trạng thái thuê</Text>
            <Text style={styles.value}>
              {seat.status === "available" ? "Chưa sử dụng" : "Đang thuê"}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Giá thuê</Text>
            <Text style={styles.value}>
              {toCurrency(seat.price || 50000)} VNĐ/giờ
            </Text>
          </View>
        </View>
      </View>

      {/* Section: Hóa đơn */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hóa đơn</Text>
        {/* If there were orders, list them here */}
        <Text style={styles.emptyTxt}>Chưa có giao dịch nào</Text>
      </View>

      {/* Section: Tổng tiền */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng tiền</Text>
        <View style={styles.sectionContentRow}>
          <Text style={styles.label}>Thành tiền</Text>
          <Text style={styles.value}>{toCurrency(0)} VNĐ</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
});
