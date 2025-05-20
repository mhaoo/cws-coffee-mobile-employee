// src/screens/payment/QrPayment.js

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QrPaymentScreen({ route, navigation }) {
  const { amount, onSuccess } = route.params;
  const payload = JSON.stringify({ amount });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quét mã QR để thanh toán</Text>
      <QRCode value={payload} size={200} />
      <Text style={styles.note}>Quét xong nhấn “Hoàn tất”</Text>
      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => {
          onSuccess();
          navigation.pop(3);
        }}
      >
        <Text style={styles.doneTxt}>Hoàn tất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 18, marginBottom: 20 },
  note: { color: "#666", marginTop: 12 },
  doneBtn: {
    marginTop: 24,
    backgroundColor: "#93540A",
    padding: 12,
    borderRadius: 6,
  },
  doneTxt: { color: "#fff", fontWeight: "700" },
});
