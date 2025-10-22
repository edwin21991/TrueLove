import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import EmojiPicker from "./EmojiPicker";
import { sectionModal, text, colors } from "../styles/globalStyles";

export default function SectionModal({
  visible,
  onClose,
  onCreate,
  groupId,
  editData = null,
}) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  // 🧩 Cuando se abre el modal, precargar datos si se está editando
  useEffect(() => {
    if (visible) {
      if (editData) {
        setTitle(editData.title || "");
        setEmoji(editData.emoji || null);
      } else {
        reset();
      }
    }
  }, [visible, editData]);

  function reset() {
    setTitle("");
    setEmoji(null);
    setIsSaving(false);
    setEmojiPickerVisible(false);
  }

  async function handleSave() {
    if (!title.trim())
      return Alert.alert("Título obligatorio", "Escribe un nombre para la sección.");
    if (!emoji)
      return Alert.alert("Emoji obligatorio", "Elige un emoji para la sección.");

    try {
      setIsSaving(true);

      if (editData?.id) {
        // ✏️ Editar sección existente
        const ref = doc(db, `groups/${groupId}/sections/${editData.id}`);
        await updateDoc(ref, {
          title: title.trim(),
          emoji,
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Sección actualizada (${editData.id})`);
      } else {
        // 🆕 Crear nueva sección
        await addDoc(collection(db, `groups/${groupId}/sections`), {
          title: title.trim(),
          emoji,
          createdAt: serverTimestamp(),
        });
        console.log("✅ Nueva sección creada");
      }

      reset();
      onCreate && onCreate();
      onClose();
    } catch (e) {
      console.error("Error guardando sección", e);
      Alert.alert("Error", "No se pudo guardar la sección.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={sectionModal.backdrop}>
        <View style={sectionModal.box}>
          <Text style={sectionModal.title}>
            {editData ? "Editar Sección" : "Nueva Sección"}
          </Text>

          <TextInput
            placeholder="Título de la sección"
            value={title}
            onChangeText={setTitle}
            style={sectionModal.input}
            placeholderTextColor="#888"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <TouchableOpacity
            style={sectionModal.chooseEmojiBtn}
            onPress={() => {
              Keyboard.dismiss();
              setEmojiPickerVisible(true);
            }}
          >
            <Text style={{ fontSize: 18, color: colors.dark }}>
              {emoji ? `${emoji} Elegido` : "Elige un emoji"}
            </Text>
          </TouchableOpacity>

          <View style={sectionModal.actionsRow}>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
              style={sectionModal.cancelBtn}
              disabled={isSaving}
            >
              <Text style={text.redButton}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={sectionModal.saveBtn}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.light} />
              ) : (
                <Text style={text.whiteButton}>
                  {editData ? "Guardar" : "Crear"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 🎨 Selector de emoji */}
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
    </Modal>
  );
}
