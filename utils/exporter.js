// utils/exporter.js
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

// 🔹 Utilidad para formatear valores de campos
function formatFieldValue(field) {
  const opts = field.options || {};
  const t = field.type;

  if (t === "número" || t === "dinero") {
    const val = opts.valor ?? 0;
    const num = Number(val);
    return t === "dinero"
      ? `$${num.toLocaleString("es-CO")}`
      : num.toString();
  }

  if (t === "fecha") {
    if (!opts.valor) return "";
    try {
      return new Date(opts.valor).toLocaleDateString("es-CO");
    } catch {
      return "";
    }
  }

  if (t === "fecha_regresiva") {
    if (!opts.valor) return "";
    try {
      const fecha = new Date(opts.valor);
      const hoy = new Date();
      const diff = fecha - hoy;
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (isNaN(dias)) return "";
      if (dias > 1) return `⏳ Faltan ${dias} días`;
      if (dias === 1) return "⏳ Falta 1 día";
      if (dias === 0) return "📅 Hoy";
      if (dias === -1) return "✅ Pasó 1 día";
      return `✅ Pasaron ${Math.abs(dias)} días`;
    } catch {
      return "";
    }
  }

  if (t === "texto") {
    return opts.valor || "";
  }

  if (t === "voz") {
    return opts.audioUri ? "🎙️ Grabación guardada" : "🎤 Nota de voz";
  }

  return "";
}

// 🔹 Función principal
export async function exportGroupToExcel(groupId, filename = "TrueLove_Export.xlsx") {
  try {
    if (!groupId) throw new Error("groupId requerido");

    const wb = XLSX.utils.book_new();

    // 🔹 Obtener todas las secciones
    const sectionsSnap = await getDocs(
      query(collection(db, `groups/${groupId}/sections`), orderBy("createdAt", "asc"))
    );

    for (const sectionDoc of sectionsSnap.docs) {
      const sectionData = sectionDoc.data();
      const sectionId = sectionDoc.id;

      // 🔹 Obtener campos dentro de la sección
      const fieldsSnap = await getDocs(
        query(collection(db, `groups/${groupId}/sections/${sectionId}/fields`), orderBy("createdAt", "asc"))
      );

      const rows = [["Título del Campo", "Tipo", "Valor", "Fecha de Creación"]];

      fieldsSnap.forEach((fDoc) => {
        const f = fDoc.data();
        const value = formatFieldValue(f);
        const createdAt =
          f.createdAt?.toDate?.()?.toLocaleString("es-CO") ||
          new Date().toLocaleString("es-CO");
        rows.push([f.title || "", f.type || "", value, createdAt]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sectionData.title?.substring(0, 30) || "Sección");
    }

    // 🔹 Guardar y compartir
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const path = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(path, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Sharing.shareAsync(path);
  } catch (e) {
    console.error("Error exportando Excel:", e);
    throw e;
  }
}
