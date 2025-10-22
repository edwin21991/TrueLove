// components/FieldCreator/NumeroDineroOptions.jsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { numeric } from "../../styles/globalStyles";

export default function NumeroDineroOptions({
  type,
  numMode,
  setNumMode,
  operation,
  setOperation,
  targetFieldId,
  setTargetFieldId,
  numericFields,
  valueNumber,
  setValueNumber,
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
        formatter.formatToParts(1).find((p) => p.type === "currency")?.value || "$";
      setCurrencySymbol(symbol);
    } catch {
      setCurrencySymbol("$");
    }
  }, []);

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
  if (!shouldShow) return <View style={{ height: 0, overflow: "hidden" }} />;

  return (
    <View style={{ marginTop: 16 }}>
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
      <View style={numeric.modeRow}>
        <TouchableOpacity
          onPress={() => setNumMode("documentar")}
          style={[
            numeric.modeBtn,
            numMode === "documentar" && numeric.modeBtnActiveBlue,
          ]}
        >
          <Text
            style={[
              numeric.modeText,
              numMode === "documentar" && numeric.modeTextActiveBlue,
            ]}
          >
            📝 Documentar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setNumMode("operar")}
          style={[
            numeric.modeBtn,
            numMode === "operar" && numeric.modeBtnActiveBlue,
          ]}
        >
          <Text
            style={[
              numeric.modeText,
              numMode === "operar" && numeric.modeTextActiveBlue,
            ]}
          >
            ⚙️ Operar
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Configuración de operación */}
      {numMode === "operar" && (
        <View style={{ marginTop: 16 }}>
          <Text style={numeric.label}>Operación</Text>

          <View style={numeric.operationsRow}>
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
                  numeric.opBtn,
                  operation === item.op && numeric.opBtnActive,
                ]}
              >
                <Text
                  style={[
                    numeric.opText,
                    operation === item.op && numeric.opTextActive,
                  ]}
                >
                  {item.icon}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔹 Campo objetivo */}
          <Text style={[numeric.label, { marginTop: 12 }]}>Campo objetivo</Text>
          <View style={numeric.pickerBox}>
            <Picker
              selectedValue={targetFieldId}
              onValueChange={setTargetFieldId}
              style={numeric.picker}
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
