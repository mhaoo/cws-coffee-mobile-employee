// src/screens/menu/menu.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToday } from "../../hooks/utils/useTodayDate";
import useProductGroupsByCategoryId from "../../hooks/product/useProductGroupsByCategoryId";
import useSearchProducts from "../../hooks/product/useSearchProducts";
import useCategories from "../../hooks/category/useCategories";
import useProductsByGroupId from "../../hooks/product/useProductsByGroupId";

/* ────────────── CONSTANTS ────────────── */
const { width: WIN_W } = Dimensions.get("window");
const SIDEBAR_W = 160;
const SIDE_PAD = 32;
const GAP = 20;
const NUM_COL = 5;
const GRID_W = WIN_W - SIDEBAR_W;
// tính CARD_W vuông, CARD_H = CARD_W + phần text
const CARD_W =
  Math.floor((GRID_W - SIDE_PAD * 2 - GAP * (NUM_COL - 1)) / NUM_COL) - 10;
const CARD_H = CARD_W + 40;

export default function MenuScreen() {
  const route = useRoute();
  const categoryId = route.params?.categoryId; // category from parent if any
  // Params for adding to booking demo
  const booking = route.params?.booking;
  const updateBooking = route.params?.updateBooking;
  const nav = useNavigation();
  // selectedGroup: 'all' or groupId
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [kw, setKw] = useState("");
  const today = useToday();

  // 1) fetch categories, pick FOOD & DRINK
  const { data: categoriesList = [] } = useCategories();
  const foodCat = categoriesList.find((c) => c.name?.toUpperCase() === "ĐỒ ĂN");
  const drinkCat = categoriesList.find(
    (c) => c.name?.toUpperCase() === "NƯỚC UỐNG"
  );
  const foodCatId = foodCat?.id;
  const drinkCatId = drinkCat?.id;

  // 2) fetch product groups for each category
  const { data: groupsFood = [] } = useProductGroupsByCategoryId(foodCatId);
  const { data: groupsDrink = [] } = useProductGroupsByCategoryId(drinkCatId);
  const productGroups = [...groupsFood, ...groupsDrink];

  // when categoryId or categoriesList load, reset selectedGroup
  useEffect(() => setSelectedGroup("all"), [foodCatId, drinkCatId]);

  // 3) fetch products for selected group
  const groupParam = selectedGroup === "all" ? null : selectedGroup;
  const { data: productsList = [] } = useProductsByGroupId(groupParam);

  // Prefetch images when switching group
  const [imagesLoading, setImagesLoading] = useState(false);
  useEffect(() => {
    if (selectedGroup === "all" || productsList.length === 0) {
      setImagesLoading(false);
      return;
    }
    setImagesLoading(true);
    const uris = productsList
      .map((item) => item.images?.[0] || item.imageUrl || item.img)
      .filter(Boolean);
    Promise.all(uris.map((uri) => Image.prefetch(uri)))
      .then(() => setImagesLoading(false))
      .catch(() => setImagesLoading(false));
  }, [selectedGroup, productsList]);

  /* Render category button */
  const renderGroupTab = useCallback(
    ({ item }) => {
      const active = item.id === selectedGroup;
      return (
        <TouchableOpacity
          style={[styles.categoryItem, active && styles.categoryItemActive]}
          onPress={() => setSelectedGroup(item.id)}
        >
          <Text
            style={[styles.categoryText, active && styles.categoryTextActive]}
          >
            {item.name || item.categoryName}
          </Text>
          {active && <View style={styles.categoryUnderline} />}
        </TouchableOpacity>
      );
    },
    [selectedGroup]
  );

  /* Render product card */
  const renderProd = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        { marginRight: (index + 1) % NUM_COL === 0 ? 0 : GAP },
      ]}
      onPress={() =>
        nav.navigate("ProductDetail", { product: item, booking, updateBooking })
      }
    >
      <Image source={{ uri: item.images[0] }} style={styles.cardImg} />
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  /* Render product-group card when showing groups */
  const renderGroupCard = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        { marginRight: (index + 1) % NUM_COL === 0 ? 0 : GAP },
      ]}
      onPress={() => setSelectedGroup(item.id)}
    >
      <Image
        source={{ uri: item.images?.[0] || item.imageUrl || item.img }}
        style={styles.cardImg}
      />
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name || item.categoryName}
      </Text>
    </TouchableOpacity>
  );

  // Compute section title based on selected product group
  const displayTitle = useMemo(() => {
    if (selectedGroup === "all") return "Tất cả";
    const grp = productGroups.find((g) => g.id === selectedGroup);
    return grp?.name || grp?.categoryName || "Tất cả";
  }, [selectedGroup, productGroups]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.date}>{today}</Text>
        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={20}
            color="#93540A"
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#888"
            value={kw}
            onChangeText={setKw}
          />
        </View>
      </View>

      {/* ============ SECTION TITLE ============ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{displayTitle}</Text>
      </View>

      {/* ============ PRODUCT GROUPS (Horizontal Tabs) ============ */}
      <FlatList
        data={[{ id: "all", name: "Tất cả" }, ...productGroups]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.categoryList}
        renderItem={renderGroupTab}
      />

      {/* GRID: show productGroups or products */}
      {selectedGroup === "all" ? (
        <FlatList
          data={productGroups}
          numColumns={NUM_COL}
          columnWrapperStyle={{ justifyContent: "flex-start" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGroupCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          getItemLayout={(_, i) => ({
            length: CARD_H + GAP,
            offset: (CARD_H + GAP) * i,
            index: i,
          })}
        />
      ) : imagesLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#93540A" />
        </View>
      ) : (
        <FlatList
          data={productsList}
          numColumns={NUM_COL}
          columnWrapperStyle={{ justifyContent: "flex-start" }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProd}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          getItemLayout={(_, i) => ({
            length: CARD_H + GAP,
            offset: (CARD_H + GAP) * i,
            index: i,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 14,
  },
  date: {
    fontSize: 16,
    color: "#A8A8A8",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff", // trắng
    borderRadius: 10,
    marginLeft: 28,
    paddingHorizontal: 12,
    flex: 1,
    height: 42,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },

  /* SECTION TITLE */
  sectionHeader: {
    paddingHorizontal: SIDE_PAD,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  /* CATEGORY TABS */
  categoryList: {
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 8,
  },
  categoryItem: {
    marginRight: 48,
    alignItems: "center",
  },
  categoryText: {
    fontSize: 18,
    color: "#A8A8A8",
  },
  categoryTextActive: {
    color: "#93540A",
    fontWeight: "600",
  },
  categoryUnderline: {
    width: "100%",
    height: 2,
    backgroundColor: "#93540A",
    marginTop: 4,
    borderRadius: 1,
  },

  /* GRID */
  grid: {
    paddingLeft: SIDE_PAD,
    paddingRight: SIDE_PAD,
    paddingTop: 6,
    paddingBottom: 40,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    marginBottom: GAP,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // nền trắng
    borderRadius: 10, // bo góc 10
    // shadow Android
    elevation: 2,
    // shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardImg: {
    width: CARD_W * 0.8,
    height: CARD_W * 0.8,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardName: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 4,
  },
});
