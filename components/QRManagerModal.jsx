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
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import {
  assignQR,
  changeQR,
  generateQRPayload,
} from "../utils/qrManager";
import { db } from "../firebase";
import { collection, getDocs, where, query } from "firebase/firestore";
import { forms, buttons, text, colors } from "../styles/globalStyles";

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
  const [isCapturing, setIsCapturing] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    if (visible) loadOrAssignQR();
  }, [visible]);

  // 📦 Cargar o asignar QR automáticamente
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

  // 📸 Descargar o compartir QR (versión funcional original)
  const handleDownloadQR = async () => {
    try {
      if (isCapturing) return;
      setIsCapturing(true);

      if (!qrRef.current) {
        Alert.alert("Error", "El QR aún no está listo para capturarse.");
        return;
      }

      console.log("📸 Capturando QR...");
      const uri = await qrRef.current.capture();
      console.log("✅ Captura lista:", uri);

      if (uri) {
        await Sharing.shareAsync(uri);
        console.log("📤 QR compartido correctamente");
      } else {
        Alert.alert("Error", "No se pudo generar la imagen del QR.");
      }
    } catch (error) {
      console.error("❌ Error al guardar QR:", error);
      Alert.alert("Error", "No se pudo guardar ni compartir el código QR.");
    } finally {
      setIsCapturing(false);
    }
  };

  // 🔁 Cambiar QR
  async function handleChangeQR(newQRId = null) {
    try {
      setLoading(true);
      const newQR = await changeQR(entityType, entityId);
      setQrData(newQR);
      setQrListVisible(false);
      Alert.alert("Éxito", "QR cambiado correctamente.");
    } catch (e) {
      Alert.alert("Error", e.message || "No se pudo cambiar el QR.");
    } finally {
      setLoading(false);
    }
  }

  // 📋 Cargar lista de QR disponibles
  async function loadFreeQRCodes() {
    try {
      const q = query(collection(db, "qrCodes"), where("available", "==", true));
      const snap = await getDocs(q);
      setFreeQRCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      Alert.alert("Error", "No se pudieron cargar los QR disponibles.");
    }
  }

  console.log("🧭 Modal QRManager cargado:", entityType);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={forms.backdrop}>
        <View style={[forms.box, { alignItems: "center", width: "85%" }]}>
          <Text style={forms.title}>Código QR</Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : qrData ? (
            <>
              <ViewShot
                ref={qrRef}
                options={{ format: "png", quality: 1 }}
                style={{
                  alignItems: "center",
                  backgroundColor: "#fff",
                  padding: 15,
                  borderRadius: 12,
                }}
              >
                <QRCode
                  value={generateQRPayload(entityType, entityId, groupId || "")}
                  size={200}
                  backgroundColor="white"
                />
                <Text
                  style={{
                    color: colors.dark,
                    fontSize: 18,
                    fontWeight: "700",
                    marginTop: 10,
                  }}
                >
                  {qrData.code}
                </Text>
              </ViewShot>

              {/* 🔘 Botones horizontales (versión estable) */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginTop: 25,
                }}
              >
                {/* Descargar QR */}
                <TouchableOpacity
                  onPress={handleDownloadQR}
                  disabled={isCapturing}
                  style={{
                    flex: 1,
                    backgroundColor: "#E7FBEA",
                    borderColor: "#00C851",
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal:8,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#00C851",
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    {isCapturing ? "Guardando..." : "Descargar"}
                  </Text>
                </TouchableOpacity>

                {/* Cambiar QR */}
                <TouchableOpacity
                  onPress={async () => {
                    await loadFreeQRCodes();
                    setQrListVisible(true);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "#E7F0FB",
                    borderColor: "#007AFF",
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal:8,
                    alignItems: "center",
                    justifyContent: "center",
                    marginHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#007AFF",
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    Cambiar QR
                  </Text>
                </TouchableOpacity>

                {/* Cerrar */}
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    flex: 1,
                    backgroundColor: "#FFECEC",
                    borderColor: "#ff3b30",
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#ff3b30",
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>

            </>
          ) : (
            <Text style={[text.subtitle, { color: "#666" }]}>Sin QR asignado</Text>
          )}
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
