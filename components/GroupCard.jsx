import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { assignQR, changeQR, generateQRPayload } from "../utils/qrManager";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  cards,
  buttons,
  text,
  qrModal,
  lists,
  colors,
} from "../styles/globalStyles";

export default function GroupCard({ item, onPress, onEdit, onClone, onDelete }) {
  const [qrVisible, setQrVisible] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrListVisible, setQrListVisible] = useState(false);
  const [freeQRCodes, setFreeQRCodes] = useState([]);
  const viewShotRef = useRef(null);

  // 📸 Capturar QR como imagen y compartir
  const handleDownloadQR = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.log("Error al guardar QR:", err);
      Alert.alert("Error", "No se pudo guardar la imagen del QR.");
    }
  };

  // 📄 Mostrar o asignar QR
  async function handleShowQR() {
    try {
      setLoading(true);
      const assigned = await assignQR("group", item.id);
      setQrData(assigned);
      setQrVisible(true);
    } catch (e) {
      console.error("Error mostrando QR:", e);
      Alert.alert("Error", e.message || "No se pudo generar el código QR.");
    } finally {
      setLoading(false);
    }
  }

  // 🔄 Cargar lista de QR libres
  async function loadFreeQRCodes() {
    try {
      const q = query(collection(db, "qrCodes"), where("available", "==", true));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFreeQRCodes(list);
    } catch (err) {
      console.error("Error cargando QR libres:", err);
      Alert.alert("Error", "No se pudieron cargar los QR disponibles.");
    }
  }

  // 🔁 Cambiar QR
  async function handleChangeQR(newQRId = null) {
    try {
      setLoading(true);
      let newQR;
      if (newQRId) {
        newQR = freeQRCodes.find((q) => q.id === newQRId);
        if (!newQR) return Alert.alert("Error", "QR no encontrado.");
        await changeQR("group", item.id);
      } else {
        newQR = await changeQR("group", item.id);
      }
      setQrData(newQR);
      setQrListVisible(false);
      Alert.alert("Éxito", "QR cambiado correctamente.");
    } catch (e) {
      console.error("Error cambiando QR:", e);
      Alert.alert("Error", e.message || "No se pudo cambiar el código QR.");
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

      {/* 📦 Modal QR */}
      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={qrModal.backdrop}>
          <View style={qrModal.box}>
            <Text style={text.title}>Código QR del Grupo</Text>

            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : qrData ? (
              <>
                <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
                  <QRCode
                    value={generateQRPayload("group", item.id)}
                    size={200}
                    backgroundColor="white"
                  />
                </ViewShot>
                <Text style={text.subtitle}>Código: {qrData.code}</Text>
              </>
            ) : (
              <Text style={text.subtitle}>Sin QR asignado</Text>
            )}

            <TouchableOpacity style={buttons.greenOutline} onPress={handleDownloadQR}>
              <Text style={text.greenButton}>Descargar QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={buttons.blueOutline}
              onPress={async () => {
                await loadFreeQRCodes();
                setQrListVisible(true);
              }}
            >
              <Text style={{ color: "#007AFF", fontWeight: "700" }}>Cambiar QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={buttons.redOutline}
              onPress={() => setQrVisible(false)}
            >
              <Text style={text.redButton}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📋 Lista de QR disponibles */}
      <Modal visible={qrListVisible} transparent animationType="fade">
        <View style={qrModal.backdrop}>
          <View style={[qrModal.box, { maxHeight: "70%", width: "85%" }]}>
            <Text style={text.title}>Seleccionar QR disponible</Text>
            {freeQRCodes.length === 0 ? (
              <Text style={text.subtitle}>No hay QR disponibles.</Text>
            ) : (
              <FlatList
                data={freeQRCodes}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={lists.item}
                    onPress={() => handleChangeQR(item.id)}
                  >
                    <Text style={lists.itemText}>{item.code}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={buttons.redOutline}
              onPress={() => setQrListVisible(false)}
            >
              <Text style={text.redButton}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}
