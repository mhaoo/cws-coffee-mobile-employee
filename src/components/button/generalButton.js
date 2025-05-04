import React from "react";
import { Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";

const { width, height } = Dimensions.get("screen");

const GeneralButton = ({ onPress, text, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={StyleSheet.compose(styles.generalButtonContainer, style)}
      onPress={onPress}
    >
      <Text style={StyleSheet.compose(styles.generalButtonText, textStyle)}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  generalButtonContainer: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.06,
    marginHorizontal: width * 0.075,
    backgroundColor: "#93540A",
  },
  generalButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default GeneralButton;
