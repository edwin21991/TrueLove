import React from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { emojiPicker } from "../styles/globalStyles"; // ✅ usa emojiPicker, no emojiModal

export default function EmojiPickerModal({
  visible,
  emojiSearch,
  setEmojiSearch,
  filteredEmojis,
  onSelect,
  onClose,
}) {
  if (!emojiPicker) {
    console.error("❌ emojiPicker no está definido, revisa globalStyles.js");
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={emojiPicker.backdrop}>
        <View style={emojiPicker.box}>
          <Text style={emojiPicker.title}>Elige un emoji</Text>

          <TextInput
            placeholder="Buscar (pega un emoji)"
            value={emojiSearch}
            onChangeText={setEmojiSearch}
            style={emojiPicker.searchInput}
            placeholderTextColor="#888"
          />

          <FlatList
            data={filteredEmojis}
            keyExtractor={(it, i) => `${it}-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                style={emojiPicker.emojiCell}
              >
                <Text style={{ fontSize: 26 }}>{item}</Text>
              </TouchableOpacity>
            )}
            numColumns={8}
            contentContainerStyle={{ paddingBottom: 10 }}
          />

          <TouchableOpacity onPress={onClose} style={emojiPicker.cancelBtn}>
            <Text style={{ fontWeight: "700", color: "#000" }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
