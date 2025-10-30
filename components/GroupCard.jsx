// components/GroupCard.jsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import QRManagerModal from "./QRManagerModal"; // ✅ Modal centralizado
import { assignQR } from "../utils/qrManager";
import { cards, buttons, text } from "../styles/globalStyles";

export default function GroupCard({ item, onPress, onEdit, onClone, onDelete }) {
  const [qrVisible, setQrVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 📄 Mostrar o asignar QR (como antes)
  async function handleShowQR() {
    try {
      setLoading(true);
      await assignQR("group", item.id); // Asignación previa si no tiene QR
      setQrVisible(true);
    } catch (e) {
      console.error("❌ Error mostrando QR:", e);
      Alert.alert("Error", e.message || "No se pudo generar el código QR.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableOpacity
      style={cards.groupCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* 🔹 Contenido principal */}
      <View style={{ alignItems: "center" }}>
        <Text style={text.emoji}>{item.emoji}</Text>
        <Text style={text.cardTitle}>{item.title}</Text>
      </View>

      {/* 📷 Botón QR */}
      <TouchableOpacity
        style={buttons.qrIcon}
        onPress={(e) => {
          e.stopPropagation();
          handleShowQR();
        }}
      >
        <Text style={text.icon}>📷</Text>
      </TouchableOpacity>

      {/* ⚙️ Acciones inferiores */}
      <View style={text.iconsRow}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
        >
          <Text style={[text.icon, { color: "#ff9500" }]}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onClone && onClone();
          }}
        >
          <Text style={[text.icon, { color: "#00C851" }]}>📄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
        >
          <Text style={[text.icon, { color: "#ff3b30" }]}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Modal QR unificado */}
      <QRManagerModal
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        entityType="group"
        entityId={item.id}
      />
    </TouchableOpacity>
  );
}
