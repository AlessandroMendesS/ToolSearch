import React from "react";
import { View, StyleSheet, TouchableOpacity, text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  return (
    <View style={estilos.container}>
      
      <View style={estilos.menu}>
        <text>Home</text>
      </View>
    </View>
  );
};

export default HomeScreen;

const estilos = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: "#fff",
  //   justifyContent: "flex-end",
  // },
  // menu: {
  //   flexDirection: "row",
  //   justifyContent: "space-around",
  //   alignItems: "center",
  //   height: 70,
  //   backgroundColor: "#001B0A",
  //   borderTopLeftRadius: 24,
  //   borderTopRightRadius: 24,
  //   paddingHorizontal: 20,
  // },
  // botaoHome: {
  //   backgroundColor: "#fff",
  //   padding: 12,
  //   borderRadius: 50,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
});
