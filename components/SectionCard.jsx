// components/SectionCard.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import FieldCreator from "../components/FieldCreator/FieldCreator";
import { Audio } from "expo-av";
import { Video } from "expo-av";
import QRManagerModal from "./QRManagerModal";
import { cards, buttons, text, fields, mediaModal } from "../styles/globalStyles";

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

// 💵 Formatear dinero
function formatoDinero(valor) {
  return `$${Number(valor).toLocaleString("es-CO")}`;
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
  const [mediaVisible, setMediaVisible] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [mediaUri, setMediaUri] = useState(null);

  // 🔄 Escuchar los campos de la sección
  useEffect(() => {
    if (!groupId || !item?.id) return;
    const q = query(
      collection(db, `groups/${groupId}/sections/${item.id}/fields`),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFieldsData(arr);
    });
    return () => unsub();
  }, [groupId, item.id]);

  // 🎧 Reproducir audio
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

  // 🧮 Recalcular resultados dinámicos
  useEffect(() => {
    async function recalcularResultados() {
      const resultados = fieldsData.filter((f) => f.options?.modo === "resultado");
      for (const res of resultados) {
        const baseIds = res.options?.baseFields || [];
        const op = res.options?.op;
        if (baseIds.length !== 2 || !op) continue;

        try {
          const [id1, id2] = baseIds;
          const base1 = fieldsData.find((f) => f.id === id1);
          const base2 = fieldsData.find((f) => f.id === id2);
          if (!base1 || !base2) continue;

          const v1 = parseFloat(base1.options?.valor || 0);
          const v2 = parseFloat(base2.options?.valor || 0);
          let resultado = 0;
          switch (op) {
            case "suma":
              resultado = v1 + v2;
              break;
            case "resta":
              resultado = v1 - v2;
              break;
            case "multiplicar":
              resultado = v1 * v2;
              break;
            case "dividir":
              resultado = v2 !== 0 ? v1 / v2 : 0;
              break;
          }

          const esDinero =
            base1.type === "dinero" || base2.type === "dinero" || res.type === "dinero";

          const valorFinal = esDinero ? Number(resultado.toFixed(2)) : resultado;

          if (res.options?.valor !== valorFinal) {
            await updateDoc(
              doc(db, `groups/${groupId}/sections/${item.id}/fields/${res.id}`),
              { "options.valor": valorFinal }
            );
          }
        } catch (e) {
          console.error("Error recalculando resultado:", e);
        }
      }
    }
    if (fieldsData.length > 0) recalcularResultados();
  }, [fieldsData]);

  // 🗑️ Eliminar campo resultado
  async function eliminarCampoResultado(f) {
    try {
      await deleteDoc(doc(db, `groups/${groupId}/sections/${item.id}/fields/${f.id}`));
      const baseId = f.options?.baseFields?.[0];
      if (baseId) {
        await updateDoc(
          doc(db, `groups/${groupId}/sections/${item.id}/fields/${baseId}`),
          { "options.modo": "documentar" }
        );
      }
    } catch (e) {
      console.error("Error eliminando resultado:", e);
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
        <Text style={[text.title, { color: "#000", textAlign: "left" }]}>
          {item.emoji ? <Text style={text.sectionEmoji}>{item.emoji}</Text> : null}{" "}
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
              valorMostrado = v != null ? formatoDinero(v) : "$0";
            else if (f.type === "texto") valorMostrado = v ?? "-";
            else if (f.type === "voz") valorMostrado = "🎙️ Nota de voz";
            else if (f.type === "foto") valorMostrado = "📷 Foto";
            else if (f.type === "video") valorMostrado = "🎥 Video";

            const esResultado = f.options?.modo === "resultado";

            return (
              <View key={f.id} style={fields.card}>
                <View style={fields.row}>
                  <Text style={fields.title}>{f.title}:</Text>

                  {/* 📸 Mostrar miniatura o valor */}
                  {f.type === "foto" && f.options?.valor ? (
                    <TouchableOpacity
                      onPress={() => {
                        setMediaUri(f.options.valor);
                        setMediaType("foto");
                        setMediaVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: f.options.valor }}
                        style={{ width: 50, height: 50, borderRadius: 8 }}
                      />
                    </TouchableOpacity>
                  ) : f.type === "voz" ? (
                    <TouchableOpacity onPress={() => reproducirAudio(f.options?.valor)}>
                      <Text style={text.link}>▶️ Reproducir</Text>
                    </TouchableOpacity>
                  ) : f.type === "video" ? (
                    <TouchableOpacity
                      onPress={() => {
                        setMediaUri(f.options.valor);
                        setMediaType("video");
                        setMediaVisible(true);
                      }}
                    >
                      <Text style={text.link}>▶️ Ver video</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={fields.value}>{valorMostrado}</Text>
                  )}
                </View>

                {/* 🧭 Íconos a la derecha, horizontales */}
                <View style={[fields.iconsRight, { flexDirection: "row" }]}>
                  {!esResultado && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          console.log("✏️ Editar campo presionado:", f.id);
                          setEditingField(f);
                          // 🕒 Esperamos un poquito para asegurar que se guarde el estado antes de abrir el modal
                          setTimeout(() => setCreatorVisible(true), 50);
                        }}
                      >
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
                    </>
                  )}
                  {esResultado && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert("Eliminar resultado", "¿Seguro que deseas eliminar este resultado?", [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Eliminar", style: "destructive", onPress: () => eliminarCampoResultado(f) },
                        ])
                      }
                    >
                      <Text style={[text.icon, { color: "#ff3b30" }]}>🗑️</Text>
                    </TouchableOpacity>
                  )}
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

      {/* 🧩 Acciones de sección (alineadas a la derecha) */}
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

      {/* 🎥 Modal multimedia */}
      <Modal visible={mediaVisible} transparent animationType="fade">
        <View style={mediaModal.backdrop}>
          <TouchableOpacity
            style={mediaModal.closeBtn}
            onPress={() => setMediaVisible(false)}
          >
            <Text style={mediaModal.closeText}>✖</Text>
          </TouchableOpacity>

          {mediaType === "foto" ? (
            <Image source={{ uri: mediaUri }} style={mediaModal.image} />
          ) : mediaType === "video" ? (
            <Video
              source={{ uri: mediaUri }}
              useNativeControls
              resizeMode="contain"
              style={mediaModal.video}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
