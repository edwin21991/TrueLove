// utils/qrManager.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { db } from "../firebase";

/* ============================================================================
   🔹 Asignar un QR libre o mantener el existente
============================================================================ */
export async function assignQR(entityType, entityId) {
  try {
    // 1️⃣ Verificar si la entidad ya tiene QR
    const existingQ = query(
      collection(db, "qrCodes"),
      where("assignedTo", "==", entityId)
    );
    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
      const qrDoc = existingSnap.docs[0];
      return { id: qrDoc.id, ...qrDoc.data() };
    }

    // 2️⃣ Buscar QR libre
    const q = query(collection(db, "qrCodes"), where("available", "==", true));
    const snap = await getDocs(q);

    let qrDocData = null;

    if (!snap.empty) {
      // ✅ Reutilizar uno libre
      const qrDoc = snap.docs[0];
      await updateDoc(doc(db, "qrCodes", qrDoc.id), {
        available: false,
        assignedTo: entityId,
        assignedType: entityType,
        updatedAt: serverTimestamp(),
      });
      qrDocData = { id: qrDoc.id, ...qrDoc.data(), assignedTo: entityId };
      console.log(`🔁 QR libre asignado → ${qrDoc.data().code}`);
    } else {
      // 🚀 Crear uno nuevo
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
      console.log(`🆕 Nuevo QR creado → ${newCode}`);
    }

    return qrDocData;
  } catch (err) {
    console.error("❌ Error en assignQR:", err);
    throw err;
  }
}

/* ============================================================================
   🔹 Liberar QR cuando se elimina un grupo o sección
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
   - Libera el actual.
   - Si se pasa un ID específico → asigna ese QR libre.
   - Si no, asigna uno libre o crea uno nuevo.
============================================================================ */
export async function changeQR(entityType, entityId, newQRId = null) {
  try {
    // 1️⃣ Liberar el actual
    const currentQ = query(collection(db, "qrCodes"), where("assignedTo", "==", entityId));
    const currentSnap = await getDocs(currentQ);

    if (!currentSnap.empty) {
      const oldQR = currentSnap.docs[0];
      await updateDoc(doc(db, "qrCodes", oldQR.id), {
        available: true,
        assignedTo: null,
        assignedType: null,
        updatedAt: serverTimestamp(),
      });
      console.log(`♻️ QR liberado: ${oldQR.data().code}`);
    }

    // 2️⃣ Asignar el nuevo
    let newQRData = null;

    if (newQRId) {
      const selectedRef = doc(db, "qrCodes", newQRId);
      const selectedSnap = await getDoc(selectedRef);

      if (!selectedSnap.exists()) throw new Error("QR no encontrado.");

      const qrData = selectedSnap.data();

      if (!qrData.available)
        throw new Error("Este QR ya está asignado y no puede usarse.");

      await updateDoc(selectedRef, {
        available: false,
        assignedTo: entityId,
        assignedType: entityType,
        updatedAt: serverTimestamp(),
      });

      newQRData = { id: selectedSnap.id, ...qrData, assignedTo: entityId };
      console.log(`✅ QR cambiado manualmente → ${qrData.code}`);
    } else {
      newQRData = await assignQR(entityType, entityId);
    }

    return newQRData;
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
============================================================================ */
export async function downloadQRImage(data, code = "QR") {
  try {
    const fileUri = `${FileSystem.cacheDirectory}${code}.png`;

    if (data.startsWith("data:image")) {
      await FileSystem.writeAsStringAsync(
        fileUri,
        data.replace(/^data:image\/png;base64,/, ""),
        { encoding: FileSystem.EncodingType.Base64 }
      );
    } else if (data.startsWith("file://")) {
      await FileSystem.copyAsync({ from: data, to: fileUri });
    }

    await Sharing.shareAsync(fileUri);
    console.log(`📤 QR descargado como ${code}.png`);
  } catch (err) {
    console.error("❌ Error al descargar QR:", err);
  }
}
