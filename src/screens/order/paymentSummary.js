// src/screens/payment/PaymentSummary.js

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { toCurrency } from "../../utils/currency";
import usePayBooking from "../../hooks/payment/usePayBooking";
import useCustomerInformation from "../../hooks/profile/useCustomerInformation";

export default function PaymentSummaryScreen({ route, navigation }) {
  const { booking, total, onSuccess } = route.params;

  // State for cash payment form
  const [showCashForm, setShowCashForm] = useState(false);
  const [cash, setCash] = useState(total);
  const [usedMemberPoint, setUsedMemberPoint] = useState(0);
  const { mutate: payBooking, isLoading: isPaying } = usePayBooking();
  // State and hook for customer information lookup
  const [searchEmail, setSearchEmail] = useState("");
  const [emailToSearch, setEmailToSearch] = useState("");
  const {
    data: customerInfo,
    isLoading: isCustomerLoading,
    error: customerError,
  } = useCustomerInformation(emailToSearch);

  // Tổng hợp các mục cần thanh toán: phòng + orders + devices
  const items = [
    booking.room,
    ...(booking.orders || []),
    ...(booking.devices || []),
  ];

  // Handler for QR payment flow
  const handleQRPayment = () => {
    payBooking(
      {
        bookingId: booking.id,
        paymentMethod: "CARD",
        usedMemberPoint: 0,
        cash: 0,
      },
      {
        onSuccess: (response) => {
          const qrBase64 = response.data?.qrCode;
          navigation.navigate("QrPayment", { qrBase64, onSuccess });
        },
        onError: (error) => {
          Alert.alert("Lỗi thanh toán", error.message);
        },
      }
    );
  };

  // Handler for cash payment flow
  const handleCashPayment = () => {
    payBooking(
      { bookingId: booking.id, paymentMethod: "CASH", usedMemberPoint, cash },
      {
        onSuccess: () => {
          onSuccess();
          navigation.pop(3);
        },
        onError: (error) => {
          Alert.alert("Lỗi thanh toán", error.message);
        },
      }
    );
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

      {/* Payment method selection */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.payBtn, { flex: 1, marginRight: 8 }]}
          onPress={handleQRPayment}
          disabled={isPaying}
        >
          {isPaying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payTxt}>Thanh toán (Quét QR)</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.payBtn, { flex: 1 }]}
          onPress={() => setShowCashForm(true)}
        >
          <Text style={styles.payTxt}>Thanh toán (Tiền mặt)</Text>
        </TouchableOpacity>
      </View>

      {/* Cash payment form with customer info search */}
      {showCashForm && (
        <View style={styles.cashContainer}>
          <View style={styles.cashForm}>
            <Text style={styles.inputLabel}>Tiền khách đưa (VNĐ):</Text>
            <TextInput
              value={String(cash)}
              onChangeText={(t) => setCash(Number(t))}
              keyboardType="numeric"
              style={styles.textInput}
            />
            <Text style={styles.inputLabel}>Điểm sử dụng:</Text>
            <TextInput
              value={String(usedMemberPoint)}
              onChangeText={(t) => setUsedMemberPoint(Number(t))}
              keyboardType="numeric"
              style={styles.textInput}
            />
            <TouchableOpacity
              style={styles.payBtn}
              onPress={handleCashPayment}
              disabled={isPaying}
            >
              {isPaying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payTxt}>Xác nhận thanh toán</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.customerForm}>
            <Text style={styles.inputLabel}>Email khách hàng:</Text>
            <TextInput
              value={searchEmail}
              onChangeText={setSearchEmail}
              style={styles.textInput}
              placeholder="Nhập email khách hàng"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => setEmailToSearch(searchEmail)}
            >
              <Text style={styles.payTxt}>Tìm kiếm</Text>
            </TouchableOpacity>
            {isCustomerLoading && <ActivityIndicator />}
            {customerError && (
              // <Text style={styles.errorText}>Lỗi tìm kiếm</Text>
              <Text style={styles.errorText}>{customerError.message}</Text>
            )}
            {customerInfo && (
              <View style={styles.customerInfo}>
                <Text>
                  {customerInfo.firstName} {customerInfo.lastName}
                </Text>
                <Text>Điểm thành viên: {customerInfo.memberPoint}</Text>
              </View>
            )}
          </View>
        </View>
      )}
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
  buttonRow: { flexDirection: "row", marginBottom: 12 },
  payBtn: { backgroundColor: "#93540A", padding: 14, borderRadius: 6 },
  payTxt: { color: "#fff", textAlign: "center", fontWeight: "700" },
  cashContainer: { flexDirection: "row", marginTop: 12 },
  cashForm: { flex: 1, marginRight: 12 },
  inputLabel: { fontSize: 14, marginBottom: 4 },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  customerForm: { flex: 1 },
  searchBtn: {
    backgroundColor: "#93540A",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  errorText: { color: "red", marginTop: 8 },
  customerInfo: { padding: 12 },
});
