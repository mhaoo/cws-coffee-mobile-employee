// src/screens/menu/menu.js
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

/* ────────────── CONSTANTS ────────────── */
const { width: WIN_W } = Dimensions.get("window");
const SIDEBAR_W = 160; // marginLeft của sceneContainerStyle
const SIDE_PAD = 32; // padding hai bên lưới  ⬅️  lề rộng hơn
const GAP = 20; // khoảng cách giữa 2 card
const NUM_COL = 5; // 5 sản phẩm / hàng
const GRID_W = WIN_W - SIDEBAR_W; // phần dành cho grid
const CARD_W = // chiều rộng 1 card (coi như vuông)
  Math.floor((GRID_W - SIDE_PAD * 2 - GAP * (NUM_COL - 1)) / NUM_COL) - 10; // ⬅️ thu nhỏ 10 px
const CARD_H = CARD_W + 40;

/* ────────────── FAKE DATA (thay bằng API) ────────────── */
const categories = [
  { id: "all", label: "Tất cả" },
  { id: "coffee", label: "Cà phê" },
  { id: "tea", label: "Trà" },
  { id: "cloud", label: "Cloud" },
  { id: "shake", label: "Đá xay" },
  { id: "snack", label: "Bánh & Snack" },
  { id: "food", label: "Đồ ăn" },
];

const products = Array.from({ length: 25 }).map((_, i) => ({
  id: i.toString(),
  categoryId: i % 2 ? "coffee" : "tea",
  name: `Sản phẩm ${i + 1}`,
  img: "https://www.shutterstock.com/image-photo/woman-drinking-coffee-sitting-by-600nw-2534533277.jpg",
}));

/* ──────────────────────────────────────── */
export default function MenuScreen() {
  const nav = useNavigation();
  const [cat, setCat] = useState("all");
  const [kw, setKw] = useState("");

  /* ------- Lọc sản phẩm theo cat + keyword ------- */
  const dataProd = useMemo(() => {
    let arr = [...products];
    if (cat !== "all") arr = arr.filter((p) => p.categoryId === cat);
    if (kw.trim())
      arr = arr.filter((p) =>
        p.name.toLowerCase().includes(kw.trim().toLowerCase())
      );
    return arr;
  }, [cat, kw]);

  /* ------------- Date string ------------- */
  const today = useMemo(() => {
    const d = new Date();
    const weekday = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ][d.getDay()];
    return `${weekday}, ${d.getDate()} tháng ${
      d.getMonth() + 1
    }, ${d.getFullYear()}`;
  }, []);

  /* ------------- Render ------------- */
  const renderCat = useCallback(
    ({ item }) => {
      const active = item.id === cat;
      return (
        <TouchableOpacity
          style={[styles.catBtn, active && styles.catBtnActive]}
          onPress={() => setCat(item.id)}
        >
          <Text style={[styles.catTxt, active && styles.catTxtActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [cat]
  );

  const renderProd = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        { marginRight: (index + 1) % NUM_COL === 0 ? 0 : GAP }, // không margin card cuối hàng
      ]}
      // onPress={() => nav.navigate("ProductDetail", { id: item.id })}
    >
      <Image source={{ uri: item.img }} style={styles.cardImg} />
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <Text style={styles.date}>{today}</Text>
        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={18}
            color="#999"
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Danh mục hoặc sản phẩm tìm kiếm..."
            placeholderTextColor="#888"
            value={kw}
            onChangeText={setKw}
          />
        </View>
      </View>

      {/* ============ CATEGORIES ============ */}
      <FlatList
        data={[{ id: "title", label: "Danh mục" }, ...categories]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) =>
          index === 0 ? (
            <Text style={styles.catTitle}>{item.label}</Text>
          ) : (
            renderCat({ item })
          )
        }
        contentContainerStyle={styles.catList}
      />

      {/* Nhãn đang chọn */}
      <Text style={styles.selectedTxt}>
        Danh mục:{" "}
        <Text style={{ fontWeight: "700" }}>
          {categories.find((c) => c.id === cat)?.label}
        </Text>
      </Text>

      {/* ============ PRODUCTS GRID ============ */}
      <FlatList
        data={dataProd}
        numColumns={NUM_COL}
        keyExtractor={(item) => item.id}
        renderItem={renderProd}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        getItemLayout={(_, i) => ({
          length: CARD_H + GAP,
          offset: (CARD_H + GAP) * i,
          index: i,
        })}
      />
    </View>
  );
}

/* ────────────── STYLE ────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 14,
  },
  date: { fontSize: 16, color: "#555" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    marginLeft: 28,
    paddingHorizontal: 12,
    flex: 1,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#222" },

  /* categories */
  catList: {
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 6,
    alignItems: "center",
  },
  catTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginRight: 16,
    lineHeight: 40, // tránh cắt chữ
  },
  catBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 12,
  },
  catBtnActive: { backgroundColor: "#93540A", borderColor: "#93540A" },
  catTxt: { fontSize: 15, color: "#333", lineHeight: 20 },
  catTxtActive: { color: "#fff", fontWeight: "600" },

  selectedTxt: {
    marginLeft: SIDE_PAD,
    marginBottom: 6,
    fontSize: 15,
    color: "#666",
  },

  /* grid */
  grid: {
    paddingLeft: SIDE_PAD,
    paddingRight: SIDE_PAD,
    paddingTop: 6,
    paddingBottom: 40,
  },
  card: {
    width: CARD_W,
    marginBottom: GAP,
    alignItems: "center",
  },
  cardImg: {
    width: CARD_W,
    height: CARD_W,
    borderRadius: 12,
    marginBottom: 6,
  },
  cardName: { textAlign: "center", fontSize: 14, color: "#333" },
});
