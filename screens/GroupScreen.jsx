import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import EmojiPicker from "../components/EmojiPicker";
import GroupCard from "../components/GroupCard";
import SectionCard from "../components/SectionCard";
import SectionModal from "../components/SectionModal";
import GroupModal from "../components/GroupModal";
import { db } from "../firebase";
import {
  buttons,
  colors,
  headers,
  text,
  utils,
} from "../styles/globalStyles";
import { exportGroupToExcel } from "../utils/exporter";
import { assignQR, releaseQR } from "../utils/qrManager";

export default function GroupScreen({ route }) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [sections, setSections] = useState([]);
  const [subGroups, setSubGroups] = useState([]);

  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 🔄 Escuchar grupo, secciones y subgrupos
  useEffect(() => {
    const gRef = doc(db, "groups", groupId);
    const unsubG = onSnapshot(gRef, (snap) => {
      if (snap.exists()) setGroup({ id: snap.id, ...snap.data() });
      else setGroup(null);
    });

    const qSections = query(
      collection(db, `groups/${groupId}/sections`),
      orderBy("createdAt", "desc")
    );
    const unsubS = onSnapshot(qSections, (snap) =>
      setSections(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const qSub = query(
      collection(db, "groups"),
      where("parentId", "==", groupId),
      orderBy("createdAt", "desc")
    );
    const unsubSub = onSnapshot(qSub, (snap) =>
      setSubGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubG();
      unsubS();
      unsubSub();
    };
  }, [groupId]);

  // 🧩 Crear o editar subgrupo
  async function createOrEditSubGroup() {
    const t = title?.trim();
    if (!t) return Alert.alert("Título obligatorio");
    if (!emoji) return Alert.alert("Emoji obligatorio");
    if (isCreating) return;

    setIsCreating(true);
    Keyboard.dismiss();

    try {
      if (editingGroupId) {
        await updateDoc(doc(db, "groups", editingGroupId), { title: t, emoji });
      } else {
        const newGroupRef = await addDoc(collection(db, "groups"), {
          title: t,
          emoji,
          parentId: groupId,
          createdAt: serverTimestamp(),
        });
        await assignQR("group", newGroupRef.id);
      }

      setGroupModalVisible(false);
      setTitle("");
      setEmoji(null);
      setEditingGroupId(null);
    } catch (err) {
      console.log("Error al crear grupo:", err);
      Alert.alert("Error", "No se pudo crear o editar el grupo");
    } finally {
      setIsCreating(false);
    }
  }

  // 🧬 Clonar subgrupo completo
  async function handleCloneSubgroup(id) {
    try {
      const ref = doc(db, "groups", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();

      const newGroupRef = await addDoc(collection(db, "groups"), {
        ...data,
        title: data.title + " (copia)",
        createdAt: serverTimestamp(),
      });
      await assignQR("group", newGroupRef.id);

      const sectionsSnap = await getDocs(collection(db, `groups/${id}/sections`));
      for (const sec of sectionsSnap.docs) {
        const secData = sec.data();
        const newSecRef = await addDoc(
          collection(db, `groups/${newGroupRef.id}/sections`),
          { ...secData, createdAt: new Date() }
        );
        const fieldsSnap = await getDocs(
          collection(db, `groups/${id}/sections/${sec.id}/fields`)
        );
        await Promise.all(
          fieldsSnap.docs.map((f) =>
            addDoc(
              collection(db, `groups/${newGroupRef.id}/sections/${newSecRef.id}/fields`),
              { ...f.data(), createdAt: new Date() }
            )
          )
        );
      }
    } catch (err) {
      console.error("Error clonando subgrupo:", err);
      Alert.alert("Error", "No se pudo clonar el subgrupo.");
    }
  }

  // 🗑️ Eliminar subgrupo + liberar QR
  async function handleDeleteSubgroup(id) {
    Alert.alert("Eliminar grupo", "¿Seguro que deseas eliminar este subgrupo y sus datos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "groups", id));
            await releaseQR(id);
          } catch (e) {
            console.error("Error eliminando subgrupo", e);
            Alert.alert("Error", "No se pudo eliminar el subgrupo.");
          }
        },
      },
    ]);
  }

  async function handleCloneSection(sectionId) {
    try {
      const sectionRef = doc(db, `groups/${groupId}/sections/${sectionId}`);
      const sectionSnap = await getDoc(sectionRef);
      if (!sectionSnap.exists()) return;
      const data = sectionSnap.data();

      const newSectionRef = await addDoc(
        collection(db, `groups/${groupId}/sections`),
        { ...data, title: data.title + " (copia)", createdAt: new Date() }
      );

      await assignQR("section", newSectionRef.id);
      const fieldsSnap = await getDocs(
        collection(db, `groups/${groupId}/sections/${sectionId}/fields`)
      );
      await Promise.all(
        fieldsSnap.docs.map((f) =>
          addDoc(
            collection(db, `groups/${groupId}/sections/${newSectionRef.id}/fields`),
            { ...f.data(), createdAt: new Date() }
          )
        )
      );
    } catch (e) {
      console.error("Error clonando sección", e);
      Alert.alert("Error", "No se pudo clonar la sección.");
    }
  }

  async function handleDeleteSection(sectionId) {
  Alert.alert("Eliminar sección", "¿Seguro que deseas eliminar esta sección y todos sus campos?", [
    { text: "Cancelar", style: "cancel" },
    {
      text: "Eliminar",
      style: "destructive",
      onPress: async () => {
        try {
          const fieldsSnap = await getDocs(
            collection(db, `groups/${groupId}/sections/${sectionId}/fields`)
          );
          await Promise.all(
            fieldsSnap.docs.map((f) =>
              deleteDoc(
                doc(db, `groups/${groupId}/sections/${sectionId}/fields/${f.id}`)
              )
            )
          );
          await deleteDoc(doc(db, `groups/${groupId}/sections/${sectionId}`));

          // ✅ Liberar QR de la sección eliminada
          await releaseQR(sectionId);

        } catch (e) {
          console.error("delete section", e);
          Alert.alert("Error", "No se pudo eliminar la sección.");
        }
      },
    },
  ]);
}


  const ListHeader = () => (
    <View>
      {subGroups.length > 0 && (
        <>
          <Text style={[text.title, { marginTop: 16 }]}>Grupos</Text>
          <FlatList
            data={subGroups}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => (
              <GroupCard
                item={item}
                navigation={navigation}
                groupId={groupId}
                onPress={() =>
                  navigation.push("Group", { groupId: item.id })
                }
                onEdit={() => {
                  setEditingGroupId(item.id);
                  setTitle(item.title);
                  setEmoji(item.emoji);
                  setGroupModalVisible(true);
                }}
                onClone={() => handleCloneSubgroup(item.id)}
                onDelete={() => handleDeleteSubgroup(item.id)}
              />
            )}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            scrollEnabled={false}
          />
        </>
      )}
      {sections.length > 0 && <Text style={[text.title, { marginTop: 20 }]}>Secciones</Text>}
    </View>
  );

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

      {/* 🔹 Encabezado */}
      {group?.title && (
        <LinearGradient colors={["#111", "#000"]} style={headers.container}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: [{ translateY: -14 }],
              zIndex: 10,
              padding: 8,
            }}
          >
            <Text style={[headers.backArrow, { fontSize: 34 }]}>←</Text>
          </TouchableOpacity>
          <Text style={headers.title}>
            {group.emoji} {group.title}
          </Text>
        </LinearGradient>
      )}

      {/* 🔹 Botones superiores */}
      <View style={[utils.row, { justifyContent: "space-between", marginBottom: 12 }]}>
        <TouchableOpacity style={buttons.topMenu} onPress={() => setGroupModalVisible(true)}>
          <Text style={text.blackButton}>+ Grupo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={buttons.topMenu}
          onPress={() => {
            setEditingSection(null);
            setSectionModalVisible(true);
          }}
        >
          <Text style={text.blackButton}>+ Sección</Text>
        </TouchableOpacity>

        <TouchableOpacity style={buttons.topMenu} onPress={() => exportGroupToExcel(groupId)}>
          <Text style={text.blackButton}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Lista principal */}
      <FlatList
        ListHeaderComponent={ListHeader}
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <SectionCard
              item={item}
              groupId={groupId}
              navigation={navigation}
              onEdit={() => {
                setEditingSection(item);
                setSectionModalVisible(true);
              }}
              onClone={() => handleCloneSection(item.id)}
              onDelete={() => handleDeleteSection(item.id)}
            />
          </View>
        )}
      />

      {/* 🧩 Modal Grupo */}
      <GroupModal
        visible={groupModalVisible}
        title={title}
        setTitle={setTitle}
        emoji={emoji}
        setEmoji={setEmoji}
        onClose={() => {
          setGroupModalVisible(false);
          setEditingGroupId(null);
        }}
        onSave={createOrEditSubGroup}
        openEmojiPicker={() => setEmojiPickerVisible(true)}
        isCreating={isCreating}
        editing={!!editingGroupId}
      />

      {/* 🧩 Modal Sección */}
      <SectionModal
        visible={sectionModalVisible}
        onClose={() => {
          setSectionModalVisible(false);
          setEditingSection(null);
        }}
        groupId={groupId}
        editData={editingSection}
      />

      {/* 🎨 Picker de Emoji */}
      {emojiPickerVisible && (
        <EmojiPicker
          visible={emojiPickerVisible}
          onSelect={(item) => {
            setEmoji(item);
            setEmojiPickerVisible(false);
          }}
          onClose={() => setEmojiPickerVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}
