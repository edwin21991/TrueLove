import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Keyboard,
} from "react-native";
import { emojiList } from "../utils/emojiList";
import { emojiPicker } from "../styles/globalStyles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const EMOJI_COLUMNS = 8;
const EMOJI_SIZE = Math.floor((SCREEN_WIDTH - 80) / EMOJI_COLUMNS);
const EMOJI_FONT = Math.min(28, Math.max(16, EMOJI_SIZE - 8));

export default function EmojiPicker({
  visible,
  search = "",
  onSearch = () => {},
  onSelect,
  onClose,
}) {
  const filteredEmojis = useMemo(() => {
    const s = (search || "").trim();
    if (!s) return emojiList;
    return emojiList.filter((e) => e.includes(s));
  }, [search]);

  function handleSelect(emoji) {
    Keyboard.dismiss();
    onSelect(emoji);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={emojiPicker.backdrop}>
        <View style={emojiPicker.box}>
          <Text style={emojiPicker.title}>Elige un emoji</Text>

          <TextInput
            placeholder="Buscar emoji"
            value={search}
            onChangeText={(text) => {
              Keyboard.dismiss();
              onSearch(text);
            }}
            style={emojiPicker.searchInput}
            placeholderTextColor="#888"
          />

          <FlatList
            data={filteredEmojis}
            keyExtractor={(it, idx) => `${it}-${idx}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[emojiPicker.emojiCell, { width: EMOJI_SIZE, height: EMOJI_SIZE }]}
              >
                <Text style={{ fontSize: EMOJI_FONT }}>{item}</Text>
              </TouchableOpacity>
            )}
            numColumns={EMOJI_COLUMNS}
            style={{ maxHeight: 300 }}
          />

          <View style={emojiPicker.footerRow}>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                onClose();
              }}
              style={emojiPicker.cancelBtn}
            >
              <Text style={emojiPicker.btnTextRed}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                onClose();
              }}
              style={emojiPicker.saveBtn}
            >
              <Text style={emojiPicker.btnTextGreen}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
