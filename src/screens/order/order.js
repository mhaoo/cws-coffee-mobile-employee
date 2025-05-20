import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BookingCard from "../../screens/order/bookingCard";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useCancelBooking from "../../hooks/booking/useCancelBooking";
import useBookingsByDate from "../../hooks/booking/useBookingsByDate";
import useBookingsByEmail from "../../hooks/booking/useBookingsByEmail";
import useBookingsByCurrentDateAndEmail from "../../hooks/booking/useBookingsByCurrentDateAndEmail";

export default function OrderScreen() {
  // State
  const [bookings, setBookings] = useState([]);
  const navigation = useNavigation();
  const { mutate: cancelBooking } = useCancelBooking();
  const [tab, setTab] = useState("PENDING"); // PENDING | PAID | DOING | CONFIRMED
  const [date, setDate] = useState(new Date());
  const [searchEmail, setSearchEmail] = useState("");
  const [searchMode, setSearchMode] = useState("date"); // 'date' | 'email' | 'current'
  const [showPicker, setShowPicker] = useState(false);

  // Format ngày DD/MM/YYYY
  const strDate = useMemo(() => {
    const d = date;
    return (
      `${String(d.getDate()).padStart(2, "0")}/` +
      `${String(d.getMonth() + 1).padStart(2, "0")}/` +
      d.getFullYear()
    );
  }, [date]);

  // Format date param for API (YYYY-MM-DD)
  const dateParam = useMemo(() => {
    const d = date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }, [date]);

  // APIs via hooks
  const { data: dateBookings = [], refetch: refetchDateBookings } = useBookingsByDate(dateParam);
  const { data: emailBookings = [], refetch: refetchEmailBookings } = useBookingsByEmail(searchEmail);
  const { data: currentEmailBookings = [], refetch: refetchCurrentBookings } = useBookingsByCurrentDateAndEmail(searchEmail);

  // Refetch bookings when screen is focused (e.g., after payment)
  useFocusEffect(
    useCallback(() => {
      if (searchMode === 'date') {
        refetchDateBookings();
      } else if (searchMode === 'email') {
        refetchEmailBookings();
      } else if (searchMode === 'current') {
        refetchCurrentBookings();
      }
    }, [searchMode, refetchDateBookings, refetchEmailBookings, refetchCurrentBookings])
  );

  const handleSearchByEmail = () => setSearchMode("email");

  const handleSearchCurrent = () => setSearchMode("current");

  // Choose bookings based on mode
  const bookingsToShow = useMemo(() => {
    if (searchMode === "email") return emailBookings;
    if (searchMode === "current") return currentEmailBookings;
    return dateBookings;
  }, [searchMode, dateBookings, emailBookings, currentEmailBookings]);

  // Filter by tab status:
  // PENDING, PAID straightforward;
  // CONFIRMED tab (Đang thực hiện): status CONFIRMED and endTime >= now
  // HISTORY tab: status CANCELED or EXPIRED, or status CONFIRMED and endTime < now
  const filtered = useMemo(() => {
    const now = new Date();
    if (tab === "CONFIRMED") {
      return bookingsToShow.filter((b) => {
        if (b.status !== "CONFIRMED") return false;
        const dt = new Date(`${b.bookingDate}T${b.endTime}`);
        return dt >= now;
      });
    }
    if (tab === "HISTORY") {
      return bookingsToShow.filter((b) => {
        if (b.status === "CANCELED" || b.status === "EXPIRED") return true;
        if (b.status === "CONFIRMED") {
          const dt = new Date(`${b.bookingDate}T${b.endTime}`);
          return dt < now;
        }
        return false;
      });
    }
    // PENDING or PAID
    return bookingsToShow.filter((b) => b.status === tab);
  }, [bookingsToShow, tab]);

  const onChangeDate = (e, sel) => {
    setShowPicker(Platform.OS === "ios");
    if (sel) {
      setSearchMode("date");
      setDate(sel);
    }
  };

  const updateBooking = (upd) => {
    setBookings((bs) => bs.map((b) => (b.id === upd.id ? upd : b)));
  };

  return (
    <View style={styles.container}>
      {/* Date Picker */}
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateTxt}>
          {date.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Email search */}
      <TextInput
        style={styles.emailInput}
        placeholder="Nhập email khách hàng"
        value={searchEmail}
        onChangeText={setSearchEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearchByEmail}>
          <Text>Tìm kiếm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearchCurrent}>
          <Text>Tìm kiếm trong ngày</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabRow}>
        {[
          { key: "PENDING", label: "Chờ thanh toán" },
          { key: "PAID", label: "Đã đặt trước" },
          { key: "CONFIRMED", label: "Đang thực hiện" },
          { key: "HISTORY", label: "Lịch sử" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabTxt, tab === t.key && styles.tabTxtA]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Booking List */}
      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => {
          // extraActions tùy theo trạng thái booking
          const extraActions = [];
          if (item.status === "PENDING") {
            extraActions.push({
              title: "Thanh toán phòng",
              onPress: () => updateBooking({ ...item, status: "PAID" }),
            });
            extraActions.push({
              title: "Hủy đơn",
              onPress: () => cancelBooking(item.id, {
                onSuccess: (response) => {
                  const msg = response.data?.message || 'Hủy đơn thành công';
                  Alert.alert('Thông báo', msg);
                  updateBooking({ ...item, status: 'CANCELED' });
                  if (searchMode === 'date') refetchDateBookings();
                  else if (searchMode === 'email') refetchEmailBookings();
                  else if (searchMode === 'current') refetchCurrentBookings();
                },
                onError: (error) => {
                  Alert.alert('Lỗi', error.message);
                }
              }),
              style: { backgroundColor: "#d9534f" },
              textStyle: { color: "#fff" },
            });
          } else if (item.status === "PAID") {
            extraActions.push(
              {
                title: "Thêm SP",
                onPress: () =>
                  navigation.navigate("Menu", { booking: item, updateBooking }),
              },
              {
                title: "Thêm Thiết bị",
                onPress: () =>
                  navigation.navigate("Device", { bookingId: item.id }),
              },
              {
                title: `Thu tiền Order (${(item.orders || []).filter((o) => o.status === "PENDING").length})`,
                onPress: () =>
                  updateBooking({
                    ...item,
                    status: "DOING",
                    orders: (item.orders || []).map((o) => ({ ...o, status: "PAID" })),
                  }),
              },
              {
                title: "Hủy đơn",
                onPress: () => cancelBooking(item.id, {
                  onSuccess: (response) => {
                    const msg = response.data?.message || 'Hủy đơn thành công';
                    Alert.alert('Thông báo', msg);
                    updateBooking({ ...item, status: 'CANCELED' });
                    if (searchMode === 'date') refetchDateBookings();
                    else if (searchMode === 'email') refetchEmailBookings();
                    else if (searchMode === 'current') refetchCurrentBookings();
                  },
                  onError: (error) => {
                    Alert.alert('Lỗi', error.message);
                  }
                }),
                style: { backgroundColor: "#d9534f" },
                textStyle: { color: "#fff" },
              }
            );
          } else if (item.status === "DOING") {
            extraActions.push({
              title: `Xác nhận Order (${(item.orders || []).filter((o) => o.status === "PAID").length})`,
              onPress: () =>
                updateBooking({
                  ...item,
                  status: "CONFIRMED",
                  orders: (item.orders || []).map((o) => ({
                    ...o,
                    status: "CONFIRMED",
                  })),
                }),
            });
          } else if (item.status === "CONFIRMED") {
            extraActions.push({
              title: `Xác nhận Order (${(item.orders || []).filter((o) => o.status === "PAID").length})`,
              onPress: () =>
                updateBooking({
                  ...item,
                  status: "CONFIRMED",
                  orders: (item.orders || []).map((o) => ({
                    ...o,
                    status: "CONFIRMED",
                  })),
                }),
            });
          }
          return (
            <BookingCard
              order={item}
              onPress={() =>
                navigation.navigate("OrderDetail", {
                  booking: item,
                  updateBooking,
                })
              }
              extraActions={extraActions}
            />
          );
        }}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyTxt}>Không có đơn nào</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  dateBtn: {
    padding: 12,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  dateTxt: {
    fontSize: 16,
    color: "#333",
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#93540A" },
  tabTxt: { fontSize: 14, color: "#666" },
  tabTxtA: { color: "#93540A", fontWeight: "700" },
  emptyTxt: { textAlign: "center", marginTop: 40, color: "#999" },
  emailInput: {
    padding: 12,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  searchRow: {
    flexDirection: "row",
    marginHorizontal: 16,
  },
  searchBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#93540A",
    borderRadius: 8,
  },
});
