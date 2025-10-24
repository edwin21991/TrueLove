import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function FechaOptions({
  type,
  dateMode,
  setDateMode,
  dateValue,
  setDateValue,
  showDatePicker,
  setShowDatePicker,
}) {
  // 📆 Estados internos
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [daysLeft, setDaysLeft] = useState("");

  // 🧮 Calcular días restantes si es cuenta regresiva
  useEffect(() => {
    if (dateMode !== "regresiva") {
      setDaysLeft("");
      return;
    }

    try {
      const fechaObjetivo =
        dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (isNaN(fechaObjetivo)) return setDaysLeft("");

      const hoy = new Date();
      // Quitar horas para evitar desfases por zona horaria
      hoy.setHours(0, 0, 0, 0);
      fechaObjetivo.setHours(0, 0, 0, 0);

      const diffMs = fechaObjetivo - hoy;
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (isNaN(diffDias)) return setDaysLeft("");
      if (diffDias > 0) setDaysLeft(`⏳ Faltan ${diffDias} día${diffDias !== 1 ? "s" : ""}`);
      else if (diffDias === 0) setDaysLeft("📅 Es hoy");
      else
        setDaysLeft(
          `✅ Cumplido hace ${Math.abs(diffDias)} día${Math.abs(diffDias) !== 1 ? "s" : ""}`
        );
    } catch (e) {
      console.warn("❌ Error calculando días restantes:", e);
      setDaysLeft("");
    }
  }, [dateValue, dateMode]);

  // ⚙️ Solo mostrar si el tipo es fecha
  if (type !== "fecha") return null;

  // 🕓 Función para manejar selección de fecha
  const handleDatePicked = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      setDateValue(newDate);
      // Mostrar selector de hora inmediatamente
      setTimeout(() => setShowTimePicker(true), 200);
    }
  };

  // 🕓 Función para manejar selección de hora
  const handleTimePicked = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(dateValue);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDateValue(newDate);
    }
  };

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontWeight: "600", color: "#000", marginBottom: 8 }}>
        Tipo de fecha
      </Text>

      {/* 🔘 Botones de modo */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={() => {
            console.log("🗓️ Modo: documentar");
            setDateMode("documentar");
            setShowDatePicker(true);
          }}
          style={{
            flex: 1,
            backgroundColor: dateMode === "documentar" ? "#e6f0ff" : "#fff",
            borderWidth: 1.5,
            borderColor: dateMode === "documentar" ? "#007bff" : "#ccc",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              color: dateMode === "documentar" ? "#007bff" : "#000",
              fontWeight: "600",
            }}
          >
            🗓️ Documentar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("⏳ Modo: regresiva");
            setDateMode("regresiva");
            setShowDatePicker(true);
          }}
          style={{
            flex: 1,
            backgroundColor: dateMode === "regresiva" ? "#ffecec" : "#fff",
            borderWidth: 1.5,
            borderColor: dateMode === "regresiva" ? "#ff3b30" : "#ccc",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              color: dateMode === "regresiva" ? "#ff3b30" : "#000",
              fontWeight: "600",
            }}
          >
            ⏳ Cuenta regresiva
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📅 Mostrar fecha seleccionada */}
      {dateValue && (
        <View
          style={{
            marginTop: 12,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
          }}
        >
          <Text style={{ color: "#000", fontWeight: "500" }}>
            📅 {new Date(dateValue).toLocaleDateString("es-CO")} 🕓{" "}
            {new Date(dateValue).toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {dateMode === "regresiva" && !!daysLeft && (
            <Text style={{ color: "#ff3b30", fontWeight: "600", marginTop: 4 }}>
              {daysLeft}
            </Text>
          )}
        </View>
      )}

      {/* 📅 Selector de fecha */}
      {showDatePicker && (
        <DateTimePicker
          value={dateValue || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDatePicked}
        />
      )}

      {/* 🕓 Selector de hora */}
      {showTimePicker && (
        <DateTimePicker
          value={dateValue || new Date()}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimePicked}
        />
      )}
    </View>
  );
}
