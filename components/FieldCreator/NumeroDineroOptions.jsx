// components/FieldCreator/NumeroDineroOptions.jsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { forms, numeric } from "../../styles/globalStyles";

export default function NumeroDineroOptions({
  type,
  numMode,
  setNumMode,
  operation,
  setOperation,
  targetFieldId,
  setTargetFieldId,
  numericFields,
  setNumericFields,
  valueNumber,
  setValueNumber,
  groupId,
}) {
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // 🪙 Detectar símbolo de moneda del dispositivo
  useEffect(() => {
    try {
      const formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      });
      const symbol =
        formatter.formatToParts(1).find((p) => p.type === "currency")?.value ||
        "$";
      setCurrencySymbol(symbol);
    } catch {
      setCurrencySymbol("$");
    }
  }, []);

  // 🔹 Cargar todos los campos numéricos / dinero de TODO el grupo (no solo la sección)
  useEffect(() => {
    if (!groupId) return;
    (async () => {
      try {
        const sectionsSnap = await getDocs(
          query(collection(db, `groups/${groupId}/sections`), orderBy("createdAt", "asc"))
        );
        const allFields = [];

        for (const sec of sectionsSnap.docs) {
          const secData = sec.data();
          const fieldsSnap = await getDocs(
            collection(db, `groups/${groupId}/sections/${sec.id}/fields`)
          );

          fieldsSnap.forEach((f) => {
            const data = f.data();
            if (data.type === "número" || data.type === "dinero") {
              allFields.push({
                id: f.id,
                title: `${secData.title || "Sin sección"} – ${data.title}`,
              });
            }
          });
        }

        setNumericFields(allFields);
      } catch (err) {
        console.error("Error cargando campos numéricos del grupo:", err);
        setNumericFields([]);
      }
    })();
  }, [groupId]);

  // 🔢 Formatear con puntos de miles
  const formatWithDots = (value) => {
    if (!value) return "";
    const clean = value.toString().replace(/[^\d]/g, "");
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // ✍️ Manejar cambios de valor
  const handleChangeValue = (text) => {
    const numericValue = text.replace(/[^\d]/g, "");
    if (!numericValue) {
      setValueNumber("");
      return;
    }

    if (type === "dinero") {
      const formatted = `${currencySymbol}${formatWithDots(numericValue)}`;
      setValueNumber(formatted);
    } else {
      setValueNumber(numericValue);
    }
  };

  const shouldShow = type === "número" || type === "dinero";
  if (!shouldShow) return null;

  return (
    <View style={forms.fullWidth}>
      {/* 🔹 Campo numérico o monetario */}
      <Text style={numeric.label}>
        {type === "dinero" ? "Valor monetario" : "Valor numérico"}
      </Text>

      <TextInput
        keyboardType={type === "dinero" ? "default" : "numeric"}
        value={valueNumber}
        onChangeText={handleChangeValue}
        placeholder={type === "dinero" ? `${currencySymbol}0` : "0"}
        style={numeric.input}
        placeholderTextColor="#888"
      />

      {/* 🔹 Selección de modo */}
      <Text style={numeric.label}>Modo</Text>
      <View style={forms.modeRow}>
        <TouchableOpacity
          onPress={() => setNumMode("documentar")}
          style={[
            forms.modeBtn,
            numMode === "documentar" && forms.modeBtnActiveBlue,
          ]}
        >
          <Text
            style={[
              forms.modeText,
              numMode === "documentar" && forms.modeTextActiveBlue,
            ]}
          >
            📝 Documentar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setNumMode("operar")}
          style={[
            forms.modeBtn,
            numMode === "operar" && forms.modeBtnActiveBlue,
          ]}
        >
          <Text
            style={[
              forms.modeText,
              numMode === "operar" && forms.modeTextActiveBlue,
            ]}
          >
            ⚙️ Operar
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Configuración de operación */}
      {numMode === "operar" && (
        <View>
          <Text style={numeric.label}>Operación</Text>

          <View style={forms.modeRow}>
            {[
              { op: "suma", icon: "＋" },
              { op: "resta", icon: "−" },
              { op: "multiplicar", icon: "✖" },
              { op: "dividir", icon: "➗" },
            ].map((item) => (
              <TouchableOpacity
                key={item.op}
                onPress={() => setOperation(item.op)}
                style={[
                  forms.modeBtn,
                  operation === item.op && forms.modeBtnActiveBlue,
                ]}
              >
                <Text
                  style={[
                    forms.modeText,
                    operation === item.op && forms.modeTextActiveBlue,
                  ]}
                >
                  {item.icon}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔹 Campo objetivo */}
          <Text style={numeric.label}>Campo objetivo</Text>
          <View style={forms.input}>
            <Picker
              selectedValue={targetFieldId}
              onValueChange={setTargetFieldId}
              style={{ color: "#000" }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="Selecciona un campo objetivo" value={null} />
              {Array.isArray(numericFields) &&
                numericFields
                  .filter((f) => f && f.title)
                  .map((f) => (
                    <Picker.Item key={f.id} label={f.title} value={f.id} />
                  ))}
            </Picker>
          </View>
        </View>
      )}
    </View>
  );
}
