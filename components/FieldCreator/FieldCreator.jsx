import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Keyboard,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";

import FechaOptions from "./FechaOptions";
import NumeroDineroOptions from "./NumeroDineroOptions";
import TextoVozOptions from "./TextoVozOptions";
import { forms, text, utils } from "../../styles/globalStyles";

export default function FieldCreator({
  visible,
  onClose,
  onCreated,
  groupId,
  sectionId,
  editData = null,
}) {
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState(null);
  const [title, setTitle] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // -------- FECHA --------
  const [dateValue, setDateValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState("fija");

  // -------- NÚMERO/DINERO --------
  const [numMode, setNumMode] = useState("documentar");
  const [operation, setOperation] = useState("suma");
  const [targetFieldId, setTargetFieldId] = useState(null);
  const [numericFields, setNumericFields] = useState([]);
  const [valueNumber, setValueNumber] = useState("");

  // -------- TEXTO/VOZ --------
  const [valueText, setValueText] = useState("");
  const [isReminder, setIsReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);

  // -------- FOTO/VIDEO --------
  const [mediaUri, setMediaUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const modoNube = true;

  // 📦 Cargar campos numéricos
  async function loadNumericFields() {
    try {
      if (!groupId || !sectionId) return setNumericFields([]);
      const qRef = query(collection(db, `groups/${groupId}/sections/${sectionId}/fields`));
      const snap = await getDocs(qRef);
      const nums = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.type === "número" || data.type === "dinero") {
          nums.push({ id: d.id, title: data.title });
        }
      });
      setNumericFields(nums);
    } catch (e) {
      console.error("load numeric fields", e);
      setNumericFields([]);
    }
  }

  // 🧩 Cargar datos al editar
  function loadEditData(data) {
    setTitle(data.title || "");
    setType(data.type || null);
    const opts = data.options || {};

    if (data.type === "fecha") {
      if (opts.valor) setDateValue(new Date(opts.valor));
      if (opts.modo) setDateMode(opts.modo);
    }

    if (data.type === "número" || data.type === "dinero") {
      setNumMode(opts.modo || "documentar");
      setValueNumber(String(opts.valor || ""));
      if (opts.operación) {
        setOperation(opts.operación.op || "suma");
        setTargetFieldId(opts.operación.targetFieldId || null);
      }
    }

    if (data.type === "texto" || data.type === "voz") {
      setValueText(opts.valor || "");
      if (opts.recordatorio) setIsReminder(true);
      if (opts.recordarEn) {
        const rd = new Date(opts.recordarEn);
        setReminderDate(rd);
        setReminderTime(rd);
      }
    }

    if (data.type === "foto" || data.type === "video") setMediaUri(opts.valor || null);
    setIsFormValid(true);
  }

  // 🔄 Reiniciar estados
  function reset() {
    setCreating(false);
    setType(null);
    setTitle("");
    setDateValue(new Date());
    setDateMode("fija");
    setNumMode("documentar");
    setOperation("suma");
    setTargetFieldId(null);
    setValueNumber("");
    setValueText("");
    setIsReminder(false);
    setMediaUri(null);
    setUploading(false);
    setIsFormValid(false);
    setShowMediaModal(false);
  }

  // ⚡ Cuando se abre el modal
  useEffect(() => {
    if (visible) {
      loadNumericFields();
      if (editData) loadEditData(editData);
      else reset();
    }
  }, [visible, editData]);

  useEffect(() => {
    validateForm();
  }, [title, type, valueNumber, valueText, numMode, targetFieldId, mediaUri]);

  function buildReminderDateTime() {
    const d = new Date(reminderDate);
    const t = new Date(reminderTime);
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return d;
  }

  // ✅ Validar formulario
  function validateForm() {
    if (!title.trim() || !type) return setIsFormValid(false);
    if (type === "foto" || type === "video") return setIsFormValid(!!mediaUri);
    if (type === "número" || type === "dinero") {
      if (numMode === "documentar") return setIsFormValid(String(valueNumber).trim() !== "");
      return setIsFormValid(!!targetFieldId);
    }
    if (type === "texto" || type === "voz") return setIsFormValid(!!valueText || type === "voz");
    if (type === "fecha") return setIsFormValid(!!dateValue);
    return setIsFormValid(false);
  }

  // 📷 Foto / Video
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

  // 💾 Guardar campo
  async function handleSave() {
    if (!isFormValid)
      return Alert.alert("Campos incompletos", "Por favor completa todos los datos.");
    if (!groupId || !sectionId)
      return Alert.alert("Error", "Grupo / sección inválidos");

    Keyboard.dismiss();
    setCreating(true);

    try {
      const fieldDoc = {
        title: title.trim(),
        type,
        options: {},
        createdAt: editData ? editData.createdAt || new Date() : new Date(),
      };

      if (type === "fecha") {
        fieldDoc.options = { valor: dateValue.toISOString(), modo: dateMode };
      } else if (type === "número" || type === "dinero") {
        fieldDoc.options = { modo: numMode };
        const cleaned = String(valueNumber).replace(/[^\d]/g, "").trim();
        const n = parseInt(cleaned || "0", 10);
        fieldDoc.options.valor = n;
        if (numMode === "operar")
          fieldDoc.options.operación = { op: operation, targetFieldId };
      } else if (type === "texto" || type === "voz") {
        fieldDoc.options = {
          valor: valueText.trim?.() || valueText,
          modo: isReminder ? "recordatorio" : "documentar",
          recordatorio: isReminder,
        };
        if (isReminder) {
          const rd = buildReminderDateTime();
          fieldDoc.options.recordarEn = rd.toISOString();
        }
      } else if (type === "foto" || type === "video") {
        fieldDoc.options = { valor: mediaUri };
      }

      if (editData?.id) {
        const refDoc = doc(db, `groups/${groupId}/sections/${sectionId}/fields/${editData.id}`);
        await updateDoc(refDoc, fieldDoc);
      } else {
        await addDoc(collection(db, `groups/${groupId}/sections/${sectionId}/fields`), fieldDoc);
      }

      onCreated && onCreated();
      reset();
      onClose && onClose();
    } catch (e) {
      console.error("save field error", e);
      Alert.alert("Error", e?.message || "No se pudo guardar el campo");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={forms.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "90%" }}
        >
          <View style={forms.box}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={forms.title}>
                {editData ? "Editar campo" : "Crear nuevo campo"}
              </Text>

              {/* 🔹 Título */}
              <TextInput
                placeholder="Título del campo"
                value={title}
                onChangeText={setTitle}
                style={forms.input}
                placeholderTextColor="#888"
              />

              {/* 🔹 Tipo */}
              <Text style={{ marginTop: 8, color: "#000", fontWeight: "600" }}>
                Tipo de campo
              </Text>
              <View
                style={[
                  utils.row,
                  {
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginTop: 8,
                    gap: 8,
                  },
                ]}
              >
                {[
                  { key: "fecha", icon: "📅" },
                  { key: "número", icon: "🔢" },
                  { key: "dinero", icon: "💰" },
                  { key: "texto", icon: "📝" },
                  { key: "voz", icon: "🎙️" },
                  { key: "foto", icon: "📷" },
                  { key: "video", icon: "🎥" },
                ].map((btn) => (
                  <TouchableOpacity
                    key={btn.key}
                    style={[forms.typeBtn, type === btn.key && forms.typeBtnActive]}
                    onPress={() => setType(btn.key)}
                    disabled={!!editData}
                  >
                    <Text style={{ fontWeight: "600", color: "#000" }}>
                      {btn.icon} {btn.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ⚙️ Opciones según tipo */}
              <FechaOptions
                type={type}
                dateValue={dateValue}
                setDateValue={setDateValue}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                dateMode={dateMode}
                setDateMode={setDateMode}
              />

              <NumeroDineroOptions
                type={type}
                numMode={numMode}
                setNumMode={setNumMode}
                operation={operation}
                setOperation={setOperation}
                targetFieldId={targetFieldId}
                setTargetFieldId={setTargetFieldId}
                numericFields={numericFields}
                valueNumber={valueNumber}
                setValueNumber={setValueNumber}
              />

              {(type === "texto" || type === "voz") && (
                <TextoVozOptions
                  type={type}
                  valueText={valueText}
                  setValueText={setValueText}
                  isReminder={isReminder}
                  setIsReminder={setIsReminder}
                  reminderDate={reminderDate}
                  setReminderDate={setReminderDate}
                  reminderTime={reminderTime}
                  setReminderTime={setReminderTime}
                  showReminderDatePicker={showReminderDatePicker}
                  setShowReminderDatePicker={setShowReminderDatePicker}
                  showReminderTimePicker={showReminderTimePicker}
                  setShowReminderTimePicker={setShowReminderTimePicker}
                />
              )}

              {/* 📸 Foto / 🎥 Video */}
              {(type === "foto" || type === "video") && (
                <View style={{ marginTop: 16 }}>
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

                  {mediaUri && (
                    <TouchableOpacity
                      onPress={() => setShowMediaModal(true)}
                      style={{ marginTop: 10, alignItems: "center" }}
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
                </View>
              )}

              {/* 🔘 Botones */}
              <View
                style={[
                  utils.row,
                  { justifyContent: "space-between", marginTop: 18 },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    reset();
                    onClose();
                  }}
                  style={forms.cancelBtn}
                  disabled={creating}
                >
                  <Text style={text.whiteButton}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={[forms.saveBtn, { opacity: isFormValid ? 1 : 0.6 }]}
                  disabled={!isFormValid || creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={text.whiteButton}>
                      {editData ? "Guardar cambios" : "Guardar campo"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* 🎥 Modal imagen / video */}
      {showMediaModal && (
        <Modal visible transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
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
              <Text style={{ color: "#fff", fontSize: 18 }}>✖</Text>
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
                volume={1.0}
              />
            )}
          </View>
        </Modal>
      )}
    </Modal>
  );
}
