// components/FieldCreator/FieldCreator.jsx
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

// 🧩 Subcomponentes
import FechaOptions from "./FechaOptions";
import NumeroDineroOptions from "./NumeroDineroOptions";
import TextoVozOptions from "./TextoVozOptions";
import CamaraVideoOptions from "./CamaraVideoOptions";

// 🎨 Estilos
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

  // 🧩 Cargar datos al editar
  function loadEditData(data) {
    if (!data) return;
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

    if (data.type === "foto" || data.type === "video") {
      setMediaUri(opts.valor || null);
    }

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
  }

  // ⚡ Cuando se abre el modal
  useEffect(() => {
    if (visible) {
      if (editData) {
        loadEditData(editData);
      } else {
        reset();
      }
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
      if (numMode === "documentar")
        return setIsFormValid(String(valueNumber).trim() !== "");
      return setIsFormValid(!!targetFieldId);
    }
    if (type === "texto" || type === "voz")
      return setIsFormValid(!!valueText || type === "voz");
    if (type === "fecha") return setIsFormValid(!!dateValue);
    return setIsFormValid(false);
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

        if (numMode === "operar" && targetFieldId) {
          fieldDoc.options.operación = { op: operation, targetFieldId };
        }
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

      // 🔹 Si estamos editando, actualizamos en lugar de crear nuevo
      let savedRef;
      if (editData?.id) {
        const refDoc = doc(
          db,
          `groups/${groupId}/sections/${sectionId}/fields/${editData.id}`
        );
        await updateDoc(refDoc, fieldDoc);
        savedRef = refDoc;
      } else {
        savedRef = await addDoc(
          collection(db, `groups/${groupId}/sections/${sectionId}/fields`),
          fieldDoc
        );
      }

      // 🔹 Campo de operación
      if ((type === "número" || type === "dinero") && numMode === "operar" && targetFieldId) {
        const targetFieldSnap = await getDoc(
          doc(db, `groups/${groupId}/sections/${sectionId}/fields/${targetFieldId}`)
        );

        if (targetFieldSnap.exists()) {
          const targetField = targetFieldSnap.data();
          const opSimbolos = {
            suma: "+",
            resta: "−",
            multiplicar: "×",
            dividir: "÷",
          };
          const simbolo = opSimbolos[operation] || "?";
          const esDinero =
            type === "dinero" || targetField.type === "dinero";

          const resultField = {
            title: `${title} ${simbolo} ${targetField.title}`,
            type: esDinero ? "dinero" : "número",
            options: {
              modo: "resultado",
              baseFields: [savedRef.id, targetFieldId],
              op: operation,
            },
            createdAt: new Date(),
          };

          await addDoc(
            collection(db, `groups/${groupId}/sections/${sectionId}/fields`),
            resultField
          );
        }
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
          style={forms.fullWidth}
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
              <Text style={text.blackButton}>Tipo de campo</Text>
              <View style={forms.typeGrid}>
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
                    style={[
                      forms.typeBtn,
                      type === btn.key && forms.typeBtnActive,
                    ]}
                    onPress={() => setType(btn.key)}
                    disabled={!!editData}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={text.blackButton}>{btn.icon}</Text>
                      <Text style={text.blackButton}>{btn.key.charAt(0).toUpperCase() + btn.key.slice(1)}</Text>
                    </View>
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
                setNumericFields={setNumericFields}
                valueNumber={valueNumber}
                setValueNumber={setValueNumber}
                groupId={groupId}
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

              {(type === "foto" || type === "video") && (
                <CamaraVideoOptions
                  type={type}
                  mediaUri={mediaUri}
                  setMediaUri={setMediaUri}
                  uploading={uploading}
                  setUploading={setUploading}
                />
              )}

              {/* 🔘 Botones finales */}
              <View style={[utils.row, { marginTop: 18 }]}>
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
                      {editData ? "Guardar cambios" : "Guardar"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}