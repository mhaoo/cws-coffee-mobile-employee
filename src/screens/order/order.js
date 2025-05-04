import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { toCurrency } from "../../utils/currency";

/* ------------ mock bookings ------------- */
const seed = [
  {
    id: "bkg01",
    code: "#100123",
    date: "29/03/2025",
    status: "PENDING",
    customerEmail: "",
    staffEmail: "staff@cafe.vn",
    room: {
      name: "Phòng VIP 1",
      capacity: 10,
      price: 50000,
      time: "08:00 - 10:00",
      paid: false,
      img: "https://i.imgur.com/1z6hLwX.png",
    },
    products: [
      {
        id: "p1",
        name: "Cà phê sữa",
        price: 35000,
        qty: 1,
        img: "https://i.imgur.com/BbYI5Pt.png",
      },
    ],
  },
  {
    id: "bkg02",
    code: "#100124",
    date: "29/03/2025",
    status: "DOING",
    customerEmail: "user@mail.com",
    staffEmail: "staff@cafe.vn",
    room: {
      name: "Phòng Thường 2",
      capacity: 6,
      price: 40000,
      time: "09:00 - 11:00",
      paid: true,
      img: "https://i.imgur.com/1z6hLwX.png",
    },
    products: [],
  },
  {
    id: "bkg03",
    code: "#099998",
    date: "27/03/2025",
    status: "DONE",
    customerEmail: "",
    staffEmail: "staff@cafe.vn",
    room: {
      name: "Phòng VIP 3",
      capacity: 12,
      price: 60000,
      time: "14:00 - 16:00",
      paid: true,
      img: "https://i.imgur.com/1z6hLwX.png",
    },
    products: [
      {
        id: "p2",
        name: "Bánh croissant",
        price: 25000,
        qty: 2,
        img: "https://i.imgur.com/BbYI5Pt.png",
      },
    ],
  },
];

/* ------------ badge màu theo trạng thái ------------- */
const badgeColor = {
  PENDING: "#f0ad4e",
  DOING: "#0275d8",
  DONE: "#999",
};

/* ------------ card component ------------- */
const BookingCard = ({ order, onPress }) => {
  const imgs = [order.room, ...order.products];
  const total =
    order.room.price + order.products.reduce((s, p) => s + p.price * p.qty, 0);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[styles.badge, { backgroundColor: badgeColor[order.status] }]}
      />

      <View style={styles.cardHeader}>
        <Text style={styles.title}>{order.room.name}</Text>
        <Text style={styles.date}>{order.date}</Text>
      </View>
      <Text style={styles.code}>{order.code}</Text>
      <Text style={styles.small}>
        Khách: {order.customerEmail || "Khách lẻ"} | NV: {order.staffEmail}
      </Text>

      <FlatList
        horizontal
        data={imgs}
        keyExtractor={(it, i) => it.id ?? `room${i}`}
        renderItem={({ item }) => (
          <View style={styles.thumbWrap}>
            <Image source={{ uri: item.img }} style={styles.thumb} />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 8 }}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>{toCurrency(total)} VNĐ</Text>
        {order.status !== "DONE" && <Text style={styles.arrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );
};

/* ------------ screen ------------ */
export default function OrderScreen() {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState(seed);
  const [tab, setTab] = useState("PENDING"); // PENDING | DOING | DONE

  const filtered = bookings.filter((b) => b.status === tab);

  const tabs = [
    { key: "PENDING", label: "Chờ thanh toán" },
    { key: "DOING", label: "Đang thực hiện" },
    { key: "DONE", label: "Lịch sử" },
  ];

  const goDetail = (order) =>
    navigation.navigate("OrderDetail", {
      order,
      updateStatus: (id, newStatus) =>
        setBookings((bs) =>
          bs.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        ),
    });

  return (
    <View style={styles.container}>
      {/* tab bar */}
      <View style={styles.tabRow}>
        {tabs.map((t) => (
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

      {/* list */}
      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <BookingCard order={item} onPress={() => goDetail(item)} />
        )}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ------------ styles ------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },

  tabRow: { flexDirection: "row", paddingHorizontal: 24, marginTop: 12 },
  tabBtn: { marginRight: 28, paddingBottom: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#93540A" },
  tabTxt: { fontSize: 16, color: "#666" },
  tabTxtA: { color: "#93540A", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 22,
    padding: 14,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 10,
    height: "100%",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "600", color: "#333" },
  date: { fontSize: 13, color: "#666" },
  code: { fontSize: 13, color: "#999", marginTop: 2 },
  small: { fontSize: 12, color: "#666", marginTop: 2 },

  thumbWrap: { marginRight: 8 },
  thumb: { width: 40, height: 40, borderRadius: 6 },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  total: { fontSize: 15, fontWeight: "700", color: "#333" },
  arrow: { fontSize: 26, lineHeight: 26, color: "#ccc" },
});
