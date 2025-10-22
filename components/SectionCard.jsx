import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import FieldCreator from "../components/FieldCreator/FieldCreator";
import { Audio } from "expo-av";
import QRManagerModal from "./QRManagerModal";
import { cards, buttons, text, fields } from "../styles/globalStyles";

const { width } = Dimensions.get("window");

// 🧮 Calcular cuenta regresiva
function calcularCuentaRegresiva(fechaISO) {
  try {
    const fechaObjetivo = new Date(fechaISO);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaObjetivo.setHours(0, 0, 0, 0);
    const diff = fechaObjetivo - hoy;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (isNaN(dias)) return "";
    const fecha = fechaObjetivo.toLocaleDateString("es-CO");
    if (dias > 0) return `${fecha} • Faltan ${dias} día${dias !== 1 ? "s" : ""}`;
    if (dias === 0) return `${fecha} • Hoy 🎉`;
    return `${fecha} • Cumplido`;
  } catch {
    return "";
  }
}

export default function SectionCard({
  item,
  groupId,
  navigation,
  onEdit,
  onClone,
  onDelete,
}) {
  const [fieldsData, setFieldsData] = useState([]);
  const [creatorVisible, setCreatorVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [sound, setSound] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    if (!groupId || !item?.id) return;
    const q = query(
      collection(db, `groups/${groupId}/sections/${item.id}/fields`),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFieldsData(arr);
    });
    return () => unsub();
  }, [groupId, item.id]);

  async function reproducirAudio(uri) {
    try {
      if (!uri) return Alert.alert("Nada que reproducir");
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    } catch (e) {
      console.error("playAudio", e);
    }
  }

  return (
    <View style={cards.sectionCard}>
      {/* 🔹 Título con botón QR */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <Text style={[text.title, { color: "#000" }]}>
          {item.emoji ? (
            <Text style={text.sectionEmoji}>{item.emoji}</Text>
          ) : null}{" "}
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => setQrVisible(true)} style={buttons.qrIcon}>
          <Text style={{ fontSize: 18 }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* --- Campos --- */}
      <View style={{ marginTop: 4 }}>
        {fieldsData.length === 0 ? (
          <Text style={[text.subtitle, { textAlign: "center" }]}>
            Sin campos todavía
          </Text>
        ) : (
          fieldsData.map((f) => {
            const v = f.options?.valor;
            let valorMostrado = "-";

            if (
              f.type === "fecha_regresiva" ||
              (f.type === "fecha" && f.options?.modo === "regresiva")
            )
              valorMostrado = calcularCuentaRegresiva(v);
            else if (f.type === "fecha")
              valorMostrado = v ? new Date(v).toLocaleDateString("es-CO") : "-";
            else if (f.type === "número")
              valorMostrado = v?.toLocaleString("es-CO") ?? "0";
            else if (f.type === "dinero")
              valorMostrado = v != null ? `$${v.toLocaleString("es-CO")}` : "$0";
            else if (f.type === "texto") valorMostrado = v ?? "-";
            else if (f.type === "voz") valorMostrado = "🎙️ Nota de voz";
            else if (f.type === "foto") valorMostrado = "📷 Foto";
            else if (f.type === "video") valorMostrado = "🎥 Video";

            return (
              <View key={f.id} style={fields.card}>
                <View style={fields.row}>
                  <Text style={fields.title}>{f.title}:</Text>
                  {f.type === "foto" && f.options?.valor ? (
                    <Image source={{ uri: f.options.valor }} style={fields.thumb} />
                  ) : f.type === "voz" ? (
                    <TouchableOpacity onPress={() => reproducirAudio(f.options?.valor)}>
                      <Text style={text.link}>▶️ Reproducir</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={fields.value}>{valorMostrado}</Text>
                  )}
                </View>

                {/* 🧭 Íconos más pequeños y juntos (alineados a la derecha) */}
                <View style={fields.iconsRight}>
                  <TouchableOpacity onPress={() => setEditingField(f)}>
                    <Text style={[text.icon, { color: "#ff9500" }]}>✏️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      const clone = { ...f, title: f.title + " (copia)" };
                      delete clone.id;
                      await addDoc(
                        collection(db, `groups/${groupId}/sections/${item.id}/fields`),
                        clone
                      );
                    }}
                  >
                    <Text style={[text.icon, { color: "#00C851" }]}>📄</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Eliminar", "¿Seguro que deseas eliminar este campo?", [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: async () =>
                            await deleteDoc(
                              doc(db, `groups/${groupId}/sections/${item.id}/fields/${f.id}`)
                            ),
                        },
                      ])
                    }
                  >
                    <Text style={[text.icon, { color: "#ff3b30" }]}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ➕ Crear campo */}
      <TouchableOpacity
        style={buttons.createField}
        onPress={() => {
          setEditingField(null);
          setCreatorVisible(true);
        }}
      >
        <Text style={text.greenButton}>+ Crear nuevo campo</Text>
      </TouchableOpacity>

      {/* 🧩 Acciones de sección */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 8,
        }}
      >
        <TouchableOpacity onPress={onEdit}>
          <Text style={[text.icon, { color: "#ff9500" }]}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClone}>
          <Text style={[text.icon, { color: "#00C851" }]}>📄</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={[text.icon, { color: "#ff3b30" }]}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* 🧰 Modal creador */}
      <FieldCreator
        visible={creatorVisible}
        onClose={() => setCreatorVisible(false)}
        onCreated={() => {
          setCreatorVisible(false);
          setEditingField(null);
        }}
        groupId={groupId}
        sectionId={item.id}
        editData={editingField}
      />

      {/* ✅ Modal QR */}
      <QRManagerModal
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        entityType="section"
        entityId={item.id}
        groupId={groupId}
      />
    </View>
  );
}
