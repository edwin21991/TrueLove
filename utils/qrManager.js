// utils/qrManager.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { db } from "../firebase";

/* ============================================================================
   🔹 Asignar un QR libre o mantener el existente
   - Si la entidad ya tiene QR → lo devuelve.
   - Si no tiene → busca uno libre.
   - Si no hay disponibles → crea uno nuevo consecutivo.
============================================================================ */
export async function assignQR(entityType, entityId) {
  try {
    // 1️⃣ Verificar si la entidad ya tiene un QR asignado
    const existingQ = query(
      collection(db, "qrCodes"),
      where("assignedTo", "==", entityId)
    );
    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
      const qrDoc = existingSnap.docs[0];
      return { id: qrDoc.id, ...qrDoc.data() };
    }

    // 2️⃣ Buscar un QR libre (available == true)
    const q = query(collection(db, "qrCodes"), where("available", "==", true));
    const snap = await getDocs(q);

    let qrDocData = null;

    if (!snap.empty) {
      // ✅ Reutilizar el primer QR libre
      const qrDoc = snap.docs[0];
      await updateDoc(doc(db, "qrCodes", qrDoc.id), {
        available: false,
        assignedTo: entityId,
        assignedType: entityType,
        updatedAt: serverTimestamp(),
      });
      qrDocData = { id: qrDoc.id, ...qrDoc.data(), assignedTo: entityId };
    } else {
      // 🚀 Crear un nuevo QR si no hay libres
      const newCode = await getNextCode();
      const newDocRef = await addDoc(collection(db, "qrCodes"), {
        code: newCode,
        available: false,
        assignedTo: entityId,
        assignedType: entityType,
        createdAt: serverTimestamp(),
      });
      qrDocData = {
        id: newDocRef.id,
        code: newCode,
        assignedTo: entityId,
        assignedType: entityType,
      };
    }

    return qrDocData;
  } catch (err) {
    console.error("❌ Error en assignQR:", err);
    throw err;
  }
}

/* ============================================================================
   🔹 Liberar un QR cuando se elimina un grupo o sección
============================================================================ */
export async function releaseQR(entityId) {
  try {
    const q = query(collection(db, "qrCodes"), where("assignedTo", "==", entityId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const qrDoc = snap.docs[0];
      await updateDoc(doc(db, "qrCodes", qrDoc.id), {
        available: true,
        assignedTo: null,
        assignedType: null,
        updatedAt: serverTimestamp(),
      });
      console.log(`🔄 QR liberado (${qrDoc.data().code})`);
    }
  } catch (err) {
    console.error("❌ Error en releaseQR:", err);
  }
}

/* ============================================================================
   🔹 Cambiar QR manualmente
   - Libera el actual y asigna uno nuevo.
   - Si no hay libres, crea uno nuevo automáticamente.
============================================================================ */
export async function changeQR(entityType, entityId) {
  try {
    // 1️⃣ Liberar QR actual
    const q = query(collection(db, "qrCodes"), where("assignedTo", "==", entityId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const oldQR = snap.docs[0];
      await updateDoc(doc(db, "qrCodes", oldQR.id), {
        available: true,
        assignedTo: null,
        assignedType: null,
        updatedAt: serverTimestamp(),
      });
      console.log(`♻️ QR liberado: ${oldQR.data().code}`);
    }

    // 2️⃣ Asignar uno nuevo (si no hay libres se crea)
    const newQR = await assignQR(entityType, entityId);
    console.log(`✅ QR cambiado → ${newQR.code}`);
    return newQR;
  } catch (err) {
    console.error("❌ Error en changeQR:", err);
    throw err;
  }
}

/* ============================================================================
   🔹 Calcular siguiente código secuencial (QR001, QR002, etc.)
============================================================================ */
async function getNextCode() {
  const snap = await getDocs(collection(db, "qrCodes"));
  const total = snap.size;
  const num = (total + 1).toString().padStart(3, "0");
  return `QR${num}`;
}

/* ============================================================================
   🔹 Generar payload JSON para incluir dentro del QR
============================================================================ */
export function generateQRPayload(type, id, groupId = null) {
  if (type === "group") return JSON.stringify({ type: "group", id });
  if (type === "section") return JSON.stringify({ type: "section", id, groupId });
  return "{}";
}

/* ============================================================================
   🔹 Descargar el QR como imagen con su nombre (ej: QR007.png)
   - Soporta base64 o URI directa desde ViewShot.capture()
============================================================================ */
export async function downloadQRImage(data, code = "QR") {
  try {
    const fileUri = `${FileSystem.cacheDirectory}${code}.png`;

    // 🔹 Detectar si el dato es Base64 o URI
    if (data.startsWith("file://") || data.startsWith("data:image")) {
      // Guardar usando la URI directa (ViewShot ya devuelve una ruta)
      const sourceUri = data.startsWith("file://") ? data : fileUri;
      if (data.startsWith("data:image")) {
        await FileSystem.writeAsStringAsync(fileUri, data.replace(/^data:image\/png;base64,/, ""), {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
    } else {
      // Si llega puro Base64 sin prefijo
      await FileSystem.writeAsStringAsync(fileUri, data, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // 📤 Compartir el archivo (descargar / compartir)
    await Sharing.shareAsync(fileUri);
    console.log(`📤 QR descargado como ${code}.png`);
  } catch (err) {
    console.error("❌ Error al descargar QR:", err);
  }
}

