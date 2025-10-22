// screens/QRScreen.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function QRScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Pantalla QRScreen cargada correctamente</Text>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Todo funciona 👌</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#00C851",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
