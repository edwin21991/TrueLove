import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import {
  assignQR,
  changeQR,
  generateQRPayload,
  downloadQRImage,
} from "../utils/qrManager";
import { db } from "../firebase";
import { collection, getDocs, where, query } from "firebase/firestore";
import { forms, buttons, text, colors, utils } from "../styles/globalStyles";

export default function QRManagerModal({
  visible,
  onClose,
  entityType,
  entityId,
  groupId,
}) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [freeQRCodes, setFreeQRCodes] = useState([]);
  const [qrListVisible, setQrListVisible] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    if (visible) loadOrAssignQR();
  }, [visible]);

  // 🧩 Cargar o asignar QR
  async function loadOrAssignQR() {
    try {
      setLoading(true);
      const assigned = await assignQR(entityType, entityId);
      setQrData(assigned);
    } catch (e) {
      Alert.alert("Error", e.message || "No se pudo asignar el QR.");
    } finally {
      setLoading(false);
    }
  }

  // 💾 Descargar QR con su número consecutivo
  async function handleDownloadQR() {
    try {
      if (!qrData?.code)
        return Alert.alert("Error", "No se encontró el código del QR.");
      const base64 = await new Promise((resolve) =>
        qrRef.current.toDataURL(resolve)
      );
      await downloadQRImage(base64, qrData.code);
    } catch {
      Alert.alert("Error", "No se pudo guardar la imagen del QR.");
    }
  }

  // 🔁 Cambiar QR
  async function handleChangeQR(newQRId = null) {
    try {
      setLoading(true);
      const newQR = await changeQR(entityType, entityId);
      setQrData(newQR);
      setQrListVisible(false);
    } catch (e) {
      Alert.alert("Error", e.message || "No se pudo cambiar el QR.");
    } finally {
      setLoading(false);
    }
  }

  // 🔍 Cargar QR disponibles
  async function loadFreeQRCodes() {
    try {
      const q = query(collection(db, "qrCodes"), where("available", "==", true));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFreeQRCodes(list);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los QR disponibles.");
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={forms.backdrop}>
        <View style={[forms.box, { alignItems: "center" }]}>
          <Text style={forms.title}>Código QR</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : qrData ? (
            <>
              <ViewShot options={{ format: "png", quality: 1 }}>
                <QRCode
                  getRef={(r) => (qrRef.current = r)}
                  value={generateQRPayload(entityType, entityId, groupId)}
                  size={200}
                  backgroundColor="white"
                />
              </ViewShot>
              <Text
                style={[
                  text.subtitle,
                  { color: colors.dark, marginTop: 10, fontWeight: "600" },
                ]}
              >
                Código: {qrData.code}
              </Text>
            </>
          ) : (
            <Text style={[text.subtitle, { color: "#666" }]}>
              Sin QR asignado
            </Text>
          )}

          {/* 🔘 Botones principales */}
          <View
            style={[
              utils.row,
              {
                justifyContent: "space-between",
                width: "100%",
                marginTop: 20,
                gap: 8,
              },
            ]}
          >
            <TouchableOpacity
              style={[buttons.greenOutline, { flex: 1 }]}
              onPress={handleDownloadQR}
              disabled={loading}
            >
              <Text style={text.greenButton}>Descargar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttons.blueOutline, { flex: 1 }]}
              onPress={async () => {
                await loadFreeQRCodes();
                setQrListVisible(true);
              }}
              disabled={loading}
            >
              <Text style={{ color: "#007AFF", fontWeight: "700" }}>
                Cambiar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttons.redOutline, { flex: 1 }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={text.redButton}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 📋 Lista de QR libres */}
      <Modal visible={qrListVisible} transparent animationType="fade">
        <View style={forms.backdrop}>
          <View style={[forms.box, { maxHeight: "70%", width: "85%" }]}>
            <Text style={forms.title}>Seleccionar QR disponible</Text>

            {freeQRCodes.length === 0 ? (
              <Text style={text.subtitle}>No hay QR disponibles.</Text>
            ) : (
              <FlatList
                data={freeQRCodes}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      borderBottomWidth: 1,
                      borderColor: "#ddd",
                    }}
                    onPress={() => handleChangeQR(item.id)}
                  >
                    <Text style={{ fontWeight: "600" }}>{item.code}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={[buttons.redOutline, { marginTop: 10 }]}
              onPress={() => setQrListVisible(false)}
            >
              <Text style={text.redButton}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
