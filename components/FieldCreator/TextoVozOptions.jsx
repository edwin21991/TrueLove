// components/FieldCreator/TextoVozOptions.jsx
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
import { forms, text, buttons } from "../../styles/globalStyles";

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
    <View style={forms.fullWidth}>
      {/* 📝 Campo de texto si no es voz */}
      {!isVoice && (
        <View>
          <Text style={text.blackButton}>📝 Escribe tu nota</Text>
          <TextInput
            style={forms.input}
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
        <View>
          <Text style={text.blackButton}>🎙️ Nota de voz</Text>

          {recording ? (
            <TouchableOpacity
              onPress={stopRecording}
              style={[forms.mediaBtn, { backgroundColor: "#EF4444" }]}
            >
              <Text style={text.whiteButton}>⏹️ Detener grabación</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={startRecording}
              style={[forms.mediaBtn, { backgroundColor: "#10B981" }]}
            >
              <Text style={text.whiteButton}>🎤 Iniciar grabación</Text>
            </TouchableOpacity>
          )}

          {/* ☁️ Subir / ▶️ Reproducir */}
          {valueText && !audioUrl && (
            <TouchableOpacity
              onPress={uploadAudio}
              style={buttons.blueOutline}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={text.blackButton}>☁️ Subir grabación</Text>
              )}
            </TouchableOpacity>
          )}

          {(audioUrl || valueText) && (
            <TouchableOpacity onPress={playAudio} style={buttons.greenOutline}>
              <Text style={text.blackButton}>▶️ Reproducir nota</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 🔔 Modo Documentar / Recordatorio */}
      <Text style={[text.blackButton, { marginTop: 16 }]}>Modo</Text>
      <View style={forms.modeRow}>
        <TouchableOpacity
          onPress={() => setIsReminder(false)}
          style={[
            forms.modeBtn,
            !isReminder && forms.modeBtnActiveBlue,
          ]}
        >
          <Text
            style={[
              forms.modeText,
              !isReminder && forms.modeTextActiveBlue,
            ]}
          >
            📝 Documentar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsReminder(true);
            setShowReminderDatePicker(true);
          }}
          style={[
            forms.modeBtn,
            isReminder && forms.modeBtnActiveBlue,
          ]}
        >
          <Text
            style={[
              forms.modeText,
              isReminder && forms.modeTextActiveBlue,
            ]}
          >
            ⏰ Recordatorio
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🗓️ Fecha y hora del recordatorio */}
      {isReminder && (
        <View>
          <TouchableOpacity
            onPress={() => setShowReminderDatePicker(true)}
            style={forms.input}
          >
            <Text style={text.blackButton}>
              📅 Fecha: {reminderDate.toLocaleDateString("es-CO")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowReminderTimePicker(true)}
            style={forms.input}
          >
            <Text style={text.blackButton}>
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
