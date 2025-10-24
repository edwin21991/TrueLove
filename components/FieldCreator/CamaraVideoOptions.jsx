// components/FieldCreator/CamaraVideoOptions.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { forms, text } from "../../styles/globalStyles";

export default function CamaraVideoOptions({
  type,
  mediaUri,
  setMediaUri,
  uploading,
  setUploading,
}) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const modoNube = true;

  // 📸 Tomar foto o grabar video
  async function pickMedia(mediaType) {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted)
        return Alert.alert("Permiso requerido", "Activa la cámara para continuar.");

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes:
          mediaType === "video"
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (modoNube) {
          setUploading(true);
          const response = await fetch(uri);
          const blob = await response.blob();
          const refFile = ref(storage, `${mediaType}s/${Date.now()}`);
          await uploadBytes(refFile, blob);
          const url = await getDownloadURL(refFile);
          setMediaUri(url);
        } else {
          setMediaUri(uri);
        }
      }
    } catch (e) {
      console.error("pickMedia", e);
      Alert.alert("Error", "No se pudo capturar el medio");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={forms.fullWidth}>
      {/* 📷 Botón principal */}
      <TouchableOpacity
        onPress={() => pickMedia(type)}
        style={forms.mediaBtn}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={text.whiteButton}>
            {type === "foto" ? "📷 Tomar foto" : "🎥 Grabar video"}
          </Text>
        )}
      </TouchableOpacity>

      {/* 🖼️ Vista previa */}
      {mediaUri && (
        <TouchableOpacity
          onPress={() => setShowMediaModal(true)}
          style={{ alignItems: "center", marginTop: 10 }}
        >
          {type === "foto" ? (
            <Image
              source={{ uri: mediaUri }}
              style={{ width: 200, height: 200, borderRadius: 8 }}
            />
          ) : (
            <Text style={text.link}>🎥 Ver video grabado</Text>
          )}
        </TouchableOpacity>
      )}

      {/* 🎥 Modal para ver la foto o video */}
      {showMediaModal && (
        <Modal visible transparent>
          <View style={forms.backdrop}>
            <TouchableOpacity
              onPress={() => setShowMediaModal(false)}
              style={{
                position: "absolute",
                top: 40,
                right: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: 10,
                borderRadius: 30,
              }}
            >
              <Text style={text.whiteButton}>✖</Text>
            </TouchableOpacity>

            {type === "foto" ? (
              <Image
                source={{ uri: mediaUri }}
                style={{ width: "90%", height: "70%", borderRadius: 12 }}
                resizeMode="contain"
              />
            ) : (
              <Video
                source={{ uri: mediaUri }}
                style={{ width: "90%", height: "70%", borderRadius: 12 }}
                useNativeControls
                shouldPlay
                resizeMode="contain"
                isLooping
              />
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}
