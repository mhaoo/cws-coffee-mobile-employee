// src/screens/payment/PaymentSummary.js

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { toCurrency } from "../../utils/currency";

export default function PaymentSummaryScreen({ route, navigation }) {
  const { booking, total, onSuccess } = route.params;

  // Tổng hợp các mục cần thanh toán: phòng + orders + devices
  const items = [
    booking.room,
    ...(booking.orders || []),
    ...(booking.devices || []),
  ];

  const doPay = () => {
    // Navigate to QR payment only
      navigation.navigate("QrPayment", {
        amount: total,
        onSuccess: onSuccess,
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán đơn {booking.code}</Text>
      <FlatList
        data={items}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>
            <Text>{toCurrency(item.price * (item.qty || 1))} VNĐ</Text>
          </View>
        )}
      />

      <Text style={styles.total}>Tổng: {toCurrency(total)} VNĐ</Text>

      <TouchableOpacity style={styles.payBtn} onPress={doPay}>
        <Text style={styles.payTxt}>Thanh toán (Quét QR)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 12,
    textAlign: "right",
  },
  payBtn: { backgroundColor: "#93540A", padding: 14, borderRadius: 6 },
  payTxt: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
