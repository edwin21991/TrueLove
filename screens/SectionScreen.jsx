import { Audio } from "expo-av";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"; // ✅ AJUSTE
import FieldCreator from "../components/FieldCreator/FieldCreator";
import { db } from "../firebase";

export default function SectionScreen({ route, navigation }) {
  const { groupId, sectionId } = route.params || {};
  const insets = useSafeAreaInsets(); // ✅ AJUSTE

  console.log("🧭 MONTANDO SectionScreen CORRECTO con:", { groupId, sectionId });

  const [fields, setFields] = useState([]);
  const [creatorVisible, setCreatorVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Escuchar los campos en tiempo real
  useEffect(() => {
    if (!groupId || !sectionId) {
      console.warn("⚠️ No hay groupId o sectionId, no se monta el snapshot");
      return;
    }

    console.log(
      "📡 Escuchando campos en Firestore:",
      `groups/${groupId}/sections/${sectionId}/fields`
    );

    const q = collection(db, `groups/${groupId}/sections/${sectionId}/fields`);
    const unsub = onSnapshot(q, (snap) => {
      const sorted = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.createdAt?.toMillis?.() - b.createdAt?.toMillis?.());
      console.log("✅ Campos obtenidos:", sorted.length);
      setFields(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, [groupId, sectionId]);

  // 🗑️ Eliminar campo
  async function handleDeleteField(fieldId) {
    Alert.alert("Confirmar", "¿Eliminar este campo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("🗑️ Eliminando campo:", fieldId);
            await deleteDoc(
              doc(db, `groups/${groupId}/sections/${sectionId}/fields/${fieldId}`)
            );
          } catch (e) {
            console.error("❌ Error eliminando campo", e);
            Alert.alert("Error", "No se pudo eliminar el campo.");
          }
        },
      },
    ]);
  }

  // 📄 Clonar campo
  async function handleCloneField(fieldId) {
    try {
      console.log("📄 Clonando campo:", fieldId);
      const ref = doc(db, `groups/${groupId}/sections/${sectionId}/fields/${fieldId}`);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      const clone = {
        ...data,
        title: data.title + " (copia)",
        createdAt: new Date(),
      };
      await addDoc(collection(db, `groups/${groupId}/sections/${sectionId}/fields`), clone);
    } catch (e) {
      console.error("❌ Error al clonar campo", e);
    }
  }

  // ✏️ Editar campo
  async function handleEditField(fieldId) {
    try {
      console.log("✏️ Editando campo:", fieldId);
      const ref = doc(db, `groups/${groupId}/sections/${sectionId}/fields/${fieldId}`);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      setEditingField({ id: fieldId, ...snap.data() });
      setCreatorVisible(true);
    } catch (e) {
      console.error("❌ Error cargando campo para editar", e);
    }
  }

  // ▶️ Reproducir nota de voz
  async function playAudio(field) {
    try {
      console.log("▶️ Reproduciendo audio:", field.title);
      if (sound) {
        await sound.unloadAsync();
        setPlayingId(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: field.options?.audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlayingId(field.id);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setPlayingId(null);
      });
    } catch (e) {
      console.warn("❌ Error reproduciendo audio:", e);
      Alert.alert("Error", "No se pudo reproducir la grabación.");
    }
  }

  // 🔢 Mostrar valor según tipo
  function renderValue(field) {
    const opts = field.options || {};

    if (field.type === "texto") return opts.valor || "—";
    if (field.type === "voz") {
      if (opts.audioUri) {
        return (
          <TouchableOpacity onPress={() => playAudio(field)}>
            <Text style={styles.voiceBtn}>
              {playingId === field.id ? "⏸️ Reproduciendo nota" : "▶️ Reproducir nota"}
            </Text>
          </TouchableOpacity>
        );
      }
      return "🎤 Nota de voz";
    }

    return "—";
  }

  function renderField({ item }) {
    return (
      <View style={styles.outerFieldContainer}>
        <View style={styles.fieldContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldTitle}>{item.title}:</Text>

            <View style={styles.fieldValueContainer}>
              <Text style={styles.inlineValue}>{renderValue(item)}</Text>

              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => handleEditField(item.id)} style={styles.iconBtn}>
                  <Text style={[styles.iconText, { color: "#000" }]}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCloneField(item.id)} style={styles.iconBtn}>
                  <Text style={[styles.iconText, { color: "#00C851" }]}>📄</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteField(item.id)} style={styles.iconBtn}>
                  <Text style={[styles.iconText, { color: "#ff3b30" }]}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  console.log("🟢 Render principal ejecutado");

  // ✅ AJUSTE: se cambia View por SafeAreaView y se agrega paddingTop dinámico
  return (
    <SafeAreaView style={[styles.screen, { paddingTop: insets.top }]}>
      {loading ? (
        <>
          {console.log("⏳ Mostrando spinner de carga")}
          <ActivityIndicator size="large" color="#ff3b30" />
        </>
      ) : fields.length === 0 ? (
        <>
          {console.log("ℹ️ No hay campos")}
          <Text style={styles.emptyText}>Sin campos todavía</Text>
        </>
      ) : (
        <>
          {console.log("📋 Renderizando campos en FlatList")}
          <FlatList
            data={fields}
            keyExtractor={(i) => i.id}
            renderItem={renderField}
            scrollEnabled={false}
            contentContainerStyle={{ alignItems: "center" }} // ✅ Ensancha visualmente el contenedor
          />
        </>
      )}

      {console.log("🟢 Renderizando botón Crear nuevo campo")}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => {
          console.log("🟩 Presionado botón Crear nuevo campo");
          setEditingField(null);
          setCreatorVisible(true);
        }}
      >
        <Text style={styles.greenText}>+ Crear nuevo campo</Text>
      </TouchableOpacity>

      <FieldCreator
        visible={creatorVisible}
        onClose={() => setCreatorVisible(false)}
        onCreated={() => {
          console.log("✅ Campo creado o editado correctamente");
          setCreatorVisible(false);
          setEditingField(null);
        }}
        groupId={groupId}
        sectionId={sectionId}
        editData={editingField}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    marginTop: 8,
    backgroundColor: "#000",
    flex: 1,
    padding: 10,
  },
  outerFieldContainer: {
    backgroundColor: "#000",
    padding: 4,
    borderRadius: 16,
    shadowColor: "#ff3b30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 14,
    width: "90%", // ✅ ensancha las cajas
    alignSelf: "center", // ✅ centra visualmente
  },
  fieldContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: "#ff3b30",
  },
  fieldRow: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  fieldTitle: {
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  fieldValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inlineValue: {
    fontWeight: "700",
    color: "#000",
    textAlign: "left",
    flex: 1,
  },
  iconRow: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 10,
  },
  iconBtn: {
    paddingHorizontal: 4,
  },
  iconText: {
    fontSize: 18,
  },
  voiceBtn: {
    color: "#007AFF",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    marginTop: 10,
  },
  createBtn: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: "#00C851",
    width: "96%", // ✅ mismo ancho que las cajas
    alignSelf: "center",
  },
  greenText: {
    color: "#00C851",
    fontWeight: "700",
    fontSize: 16,
  },
});
