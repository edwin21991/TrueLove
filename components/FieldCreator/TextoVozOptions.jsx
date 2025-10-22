import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

export default function TextoVozOptions({
  type,
  valueText,
  setValueText,
  isReminder,
  setIsReminder,
  reminderDate,
  setReminderDate,
  reminderTime,
  setReminderTime,
  showReminderDatePicker,
  setShowReminderDatePicker,
  showReminderTimePicker,
  setShowReminderTimePicker,
}) {
  const [recording, setRecording] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sound, setSound] = useState(null);

  const isVoice = type === "voz";

  // 🎙️ Iniciar grabación
  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted)
        return Alert.alert("Permiso requerido", "Activa el micrófono para grabar audio.");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error("startRecording", err);
      Alert.alert("Error", "No se pudo iniciar la grabación");
    }
  }

  // ⏹️ Detener grabación
  async function stopRecording() {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setValueText(uri);
    } catch (err) {
      console.error("stopRecording", err);
      Alert.alert("Error", "No se pudo detener la grabación");
    }
  }

  // ☁️ Subir audio a Firebase Storage
  async function uploadAudio() {
    if (!valueText) return Alert.alert("Nada que subir", "Primero graba una nota de voz.");

    try {
      setUploading(true);
      const response = await fetch(valueText);
      const blob = await response.blob();
      const fileName = `audios/${Date.now()}.m4a`;
      const audioRef = ref(storage, fileName);
      await uploadBytes(audioRef, blob);
      const url = await getDownloadURL(audioRef);
      setAudioUrl(url);
      setValueText(url);
      Alert.alert("✅ Éxito", "Audio subido correctamente.");
    } catch (err) {
      console.error("uploadAudio", err);
      Alert.alert("Error", "No se pudo subir el audio.");
    } finally {
      setUploading(false);
    }
  }

  // ▶️ Reproducir audio
  async function playAudio() {
    try {
      const uri = audioUrl || valueText;
      if (!uri) return Alert.alert("Nada que reproducir");
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error("playAudio", err);
      Alert.alert("Error", "No se pudo reproducir el audio");
    }
  }

  return (
    <View style={{ marginTop: 16 }}>
      {/* 📝 Campo de texto si no es voz */}
      {!isVoice && (
        <View>
          <Text style={{ fontWeight: "600", color: "#000", marginBottom: 6 }}>
            📝 Escribe tu nota
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              backgroundColor: "#fff",
              padding: 10,
              minHeight: 80,
              textAlignVertical: "top",
            }}
            multiline
            placeholder="Escribe aquí tu texto..."
            placeholderTextColor="#999"
            value={valueText}
            onChangeText={setValueText}
          />
        </View>
      )}

      {/* 🎙️ Opciones de voz */}
      {isVoice && (
        <>
          <Text style={{ fontWeight: "600", color: "#000" }}>🎙️ Nota de voz</Text>

          {recording ? (
            <TouchableOpacity
              onPress={stopRecording}
              style={{
                marginTop: 10,
                backgroundColor: "#EF4444",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "500" }}>⏹️ Detener grabación</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={startRecording}
              style={{
                marginTop: 10,
                backgroundColor: "#10B981",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "500" }}>🎤 Iniciar grabación</Text>
            </TouchableOpacity>
          )}

          {/* Subir / reproducir */}
          {valueText && !audioUrl && (
            <TouchableOpacity
              onPress={uploadAudio}
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: "#2563EB",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              {uploading ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <Text style={{ color: "#2563EB" }}>☁️ Subir grabación</Text>
              )}
            </TouchableOpacity>
          )}

          {(audioUrl || valueText) && (
            <TouchableOpacity
              onPress={playAudio}
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: "#10B981",
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#10B981", fontWeight: "500" }}>▶️ Reproducir nota</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* 🔔 Modo Documentar / Recordatorio */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: "600", color: "#000" }}>Modo</Text>
        <View style={{ flexDirection: "row", marginTop: 6, gap: 8 }}>
          <TouchableOpacity
            onPress={() => setIsReminder(false)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: !isReminder ? "#2563EB" : "#E5E7EB",
              backgroundColor: !isReminder ? "#2563EB20" : "#fff",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: !isReminder ? "#2563EB" : "#374151",
                fontWeight: "500",
              }}
            >
              📝 Documentar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsReminder(true);
              setShowReminderDatePicker(true);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isReminder ? "#2563EB" : "#E5E7EB",
              backgroundColor: isReminder ? "#2563EB20" : "#fff",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: isReminder ? "#2563EB" : "#374151",
                fontWeight: "500",
              }}
            >
              ⏰ Recordatorio
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🗓️ Fecha y hora de recordatorio */}
      {isReminder && (
        <View style={{ marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => setShowReminderDatePicker(true)}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 6,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ color: "#000" }}>
              📅 Fecha: {reminderDate.toLocaleDateString("es-CO")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowReminderTimePicker(true)}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ color: "#000" }}>
              ⏰ Hora:{" "}
              {reminderTime.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ⏰ Pickers automáticos */}
      {showReminderDatePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowReminderDatePicker(false);
            if (date) {
              setReminderDate(date);
              // 👉 Abrir hora inmediatamente
              setTimeout(() => setShowReminderTimePicker(true), 300);
            }
          }}
        />
      )}

      {showReminderTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display="default"
          onChange={(e, time) => {
            setShowReminderTimePicker(false);
            if (time) setReminderTime(time);
          }}
        />
      )}
    </View>
  );
}
