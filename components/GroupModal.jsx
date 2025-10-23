// components/GroupModal.jsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { groupModal, forms, text } from "../styles/globalStyles";

export default function GroupModal({
  visible,
  title,
  setTitle,
  emoji,
  setEmoji,
  onClose,
  onSave,
  openEmojiPicker,
  isCreating,
  editing,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={groupModal.backdrop}
      >
        <View style={groupModal.box}>
          {/* 🔹 Título del modal */}
          <Text style={forms.title}>
            {editing ? "Editar grupo" : "Nuevo grupo"}
          </Text>

          {/* 🔹 Campo de texto */}
          <TextInput
            placeholder="Título del grupo (ej. Cerdos)"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
            style={forms.input}
            returnKeyType="done"
          />

          {/* 🔹 Botón para elegir emoji */}
          <TouchableOpacity
            style={forms.mediaBtn}
            onPress={openEmojiPicker}
            disabled={isCreating}
          >
            <Text style={text.whiteButton}>
              {emoji ? `${emoji} Elegido` : "Elige un emoji"}
            </Text>
          </TouchableOpacity>

          {/* 🔹 Botones inferiores */}
          <View style={forms.modeRow}>
            <TouchableOpacity
              onPress={onClose}
              style={forms.cancelBtn}
              disabled={isCreating}
            >
              <Text style={text.whiteButton}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSave}
              style={forms.saveBtn}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={text.whiteButton}>
                  {editing ? "Guardar" : "Crear"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
