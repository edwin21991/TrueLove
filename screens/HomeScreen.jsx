import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { releaseQR } from "../utils/qrManager";
import { db } from "../firebase";
import { emojiList } from "../utils/emojiList";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import GroupCard from "../components/GroupCard";
import GroupModal from "../components/GroupModal";
import EmojiPickerModal from "../components/EmojiPickerModal";
import { assignQR } from "../utils/qrManager";
import { colors, buttons, text, headers } from "../styles/globalStyles";

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(null);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // 🔥 Cargar grupos raíz
  useEffect(() => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((g) => !g.parentId)
      );
    });
    return () => unsub();
  }, []);

  const filteredEmojis = useMemo(() => {
    const s = emojiSearch.trim();
    if (!s) return emojiList;
    return emojiList.filter((e) => e.includes(s));
  }, [emojiSearch]);

  // 📦 Crear grupo con QR automático
  async function createGroup() {
    if (!title.trim()) return Alert.alert("Falta título");
    if (!emoji) return Alert.alert("Elige un emoji");

    setIsCreating(true);
    try {
      const newGroupRef = await addDoc(collection(db, "groups"), {
        title: title.trim(),
        emoji,
        createdAt: serverTimestamp(),
      });

      await assignQR("group", newGroupRef.id);
      console.log(`✅ QR asignado automáticamente al grupo ${newGroupRef.id}`);

      setTitle("");
      setEmoji(null);
      setModalVisible(false);
    } catch {
      Alert.alert("Error al crear grupo");
    } finally {
      setIsCreating(false);
    }
  }

  // ✏️ Editar grupo
  async function handleEditGroup(groupId) {
    const ref = doc(db, "groups", groupId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    setTitle(data.title);
    setEmoji(data.emoji);
    setEditingGroup({ id: groupId });
    setModalVisible(true);
  }

  // 💾 Guardar edición
  async function handleSaveEdit() {
    try {
      const ref = doc(db, "groups", editingGroup.id);
      await updateDoc(ref, { title, emoji });
      setEditingGroup(null);
      setModalVisible(false);
      setTitle("");
      setEmoji(null);
    } catch {
      Alert.alert("Error al guardar");
    }
  }

  // 📄 Clonar grupo
  async function handleCloneGroup(groupId) {
    try {
      const ref = doc(db, "groups", groupId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();

      const newGroupRef = await addDoc(collection(db, "groups"), {
        ...data,
        title: `${data.title} (copia)`,
        createdAt: serverTimestamp(),
      });

      await assignQR("group", newGroupRef.id);
      console.log(`✅ QR asignado a grupo clonado ${newGroupRef.id}`);

      const sectionsSnap = await getDocs(
        collection(db, `groups/${groupId}/sections`)
      );
      for (const sDoc of sectionsSnap.docs) {
        const sData = sDoc.data();
        const newSecRef = await addDoc(
          collection(db, `groups/${newGroupRef.id}/sections`),
          { ...sData, createdAt: serverTimestamp() }
        );

        const fieldsSnap = await getDocs(
          collection(db, `groups/${groupId}/sections/${sDoc.id}/fields`)
        );
        for (const fDoc of fieldsSnap.docs) {
          await addDoc(
            collection(
              db,
              `groups/${newGroupRef.id}/sections/${newSecRef.id}/fields`
            ),
            { ...fDoc.data(), createdAt: serverTimestamp() }
          );
        }
      }
    } catch (e) {
      console.error("Error al clonar grupo", e);
      Alert.alert("Error", "No se pudo clonar el grupo.");
    }
  }


// 🗑️ Borrar grupo + liberar QR
async function deleteGroupById(id) {
  Alert.alert("Confirmar", "¿Eliminar este grupo?", [
    { text: "Cancelar", style: "cancel" },
    {
      text: "Eliminar",
      style: "destructive",
      onPress: async () => {
        try {
          // 1️⃣ Borrar el grupo
          await deleteDoc(doc(db, "groups", id));

          // 2️⃣ Liberar su QR
          await releaseQR(id);

          console.log(`♻️ Grupo eliminado y QR liberado (${id})`);
        } catch (e) {
          console.error("Error al borrar grupo", e);
          Alert.alert("Error al borrar grupo");
        }
      },
    },
  ]);
}


  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.dark,
        padding: 16,
        paddingTop: insets.top,
      }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* 🔹 HEADER */}
      <LinearGradient colors={["#111", "#000"]} style={headers.container}>
        <Text style={headers.title}>💰 TrueLove</Text>
      </LinearGradient>

      {/* 🔹 LISTA DE GRUPOS */}
      <FlatList
        data={groups}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <GroupCard
            item={item}
            onPress={() => navigation.navigate("Group", { groupId: item.id })}
            onEdit={() => handleEditGroup(item.id)}
            onClone={() => handleCloneGroup(item.id)}
            onDelete={() => deleteGroupById(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.gray, textAlign: "center", marginTop: 40 }}>
            No hay grupos aún
          </Text>
        }
      />

      {/* 🔹 BOTONES INFERIORES */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 16,
          marginBottom: insets.bottom + 6,
        }}
      >
        {/* 🟢 Nuevo grupo */}
        <TouchableOpacity
          style={buttons.greenBottom}
          onPress={() => setModalVisible(true)}
        >
          {isCreating ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <Text style={text.greenButton}>➕ Nuevo Grupo</Text>
          )}
        </TouchableOpacity>

        {/* 🔴 Escanear QR */}
        <TouchableOpacity
          style={buttons.redBottom}
          onPress={() => navigation.navigate("QR")}
        >
          <Text style={text.redButton}>📷 Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 MODALES */}
      <GroupModal
        visible={modalVisible}
        title={title}
        setTitle={setTitle}
        emoji={emoji}
        setEmoji={setEmoji}
        onClose={() => {
          setModalVisible(false);
          setTitle("");
          setEmoji(null);
        }}
        onSave={editingGroup ? handleSaveEdit : createGroup}
        isCreating={isCreating}
        openEmojiPicker={() => setEmojiPickerVisible(true)}
        editing={!!editingGroup}
      />

      <EmojiPickerModal
        visible={emojiPickerVisible}
        emojiSearch={emojiSearch}
        setEmojiSearch={setEmojiSearch}
        filteredEmojis={filteredEmojis}
        onSelect={(em) => {
          setEmoji(em);
          setEmojiPickerVisible(false);
        }}
        onClose={() => setEmojiPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
