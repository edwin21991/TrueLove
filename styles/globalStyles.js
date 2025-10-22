import { StyleSheet } from "react-native";

/* 🎨 Paleta de colores corporativa */
export const colors = {
  primary: "#ff3b30", // 🔴 Rojo principal
  secondary: "#00C851", // 🟢 Verde secundario
  dark: "#000",
  light: "#fff",
  gray: "#888",
  backgroundModal: "rgba(0,0,0,0.8)",
};

/* 🧩 Base común para modales */
export const modalBase = {
  backdrop: {
    flex: 1,
    backgroundColor: colors.backgroundModal,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: colors.light,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    width: "85%",
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
};

/* 🧭 Encabezados */
export const headers = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.8,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.dark,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
  },
  title: {
    color: colors.light,
    fontWeight: "700",
    fontSize: 22,
    textAlign: "center",
  },
  backArrow: {
    color: colors.light,
    fontSize: 28,
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -14 }],
    zIndex: 10,
  },
});

/* 🔘 Botones reutilizables */
export const buttons = StyleSheet.create({
  base: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
  },

  /* 🟢 Botones inferiores (Nuevo grupo / Scan QR) */
  greenBottom: {
    backgroundColor: "#E7FBEA",
    borderColor: colors.primary,
    flex: 1,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    borderWidth: 2,
  },
  redBottom: {
    backgroundColor: "#FEECEC",
    borderColor: colors.primary,
    flex: 1,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    borderWidth: 2,
  },

  /* ⚪ Botones superiores */
  topMenu: {
    borderWidth: 2.5,
    borderColor: colors.primary,
    backgroundColor: colors.light,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 95,
  },

  /* 🟢 Botón Crear nuevo campo */
  createField: {
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: "#E7FBEA",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  /* 📷 Ícono QR */
  qrIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 5,
    elevation: 3,
  },

  redOutline: { borderColor: colors.primary, backgroundColor: colors.light },
  greenOutline: { borderColor: colors.secondary, backgroundColor: "#E7FBEA" },
  blueOutline: { borderColor: "#007AFF", backgroundColor: "#E7F0FB" },
});

/* 🧾 Textos */
export const text = StyleSheet.create({
  title: { color: colors.light, fontWeight: "700", fontSize: 22 },
  subtitle: { color: colors.gray, fontWeight: "600", fontSize: 16 },
  link: { color: "#007AFF", fontWeight: "600" },

  /* 🎯 Tarjetas */
  emoji: { fontSize: 34, textAlign: "center" },
  sectionEmoji: { fontSize: 28, textAlign: "center" },
  cardTitle: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: colors.dark,
  },

  /* 🧱 Íconos */
  icon: { fontSize: 18, marginHorizontal: 6 },
  iconsRow: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },

  /* 🟢 Botones */
  greenButton: { color: colors.dark, fontWeight: "700", fontSize: 16 },
  redButton: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  blackButton: { color: colors.dark, fontWeight: "700", fontSize: 15 },
  whiteButton: { color: colors.light, fontWeight: "700", fontSize: 16 },
});

/* 📦 Formularios y Modales */
export const forms = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: {
    ...modalBase.box,
    alignItems: "stretch",
    padding: 16,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1.2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: colors.light,
    color: colors.dark,
    marginBottom: 10,
  },
  typeBtn: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  typeBtnActive: {
    backgroundColor: "#E7FBEA",
    borderColor: colors.secondary,
  },
  cancelBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: "center",
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: "center",
    marginLeft: 8,
  },
  mediaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 10,
  },
});

/* 🧱 Tarjetas */
export const cards = StyleSheet.create({
  groupCard: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionCard: {
    backgroundColor: "#FAFAFA",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    padding: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
});

/* 🧮 Campos */
export const fields = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    backgroundColor: colors.light,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontWeight: "600", color: colors.dark, flex: 1 },
  value: { color: "#333", fontWeight: "500", textAlign: "right" },
  icons: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 4 },
  iconsRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginRight: 6,
  },
  thumb: { width: 80, height: 80, borderRadius: 6 },
});

/* 📱 Utilidades */
export const utils = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  centered: { justifyContent: "center", alignItems: "center" },
  fullWidth: { width: "100%" },
  marginVertical: { marginVertical: 10 },
  gap: { marginHorizontal: 6 },
});

/* 🧩 Modales */
export const groupModal = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: modalBase.box,
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.dark,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1.2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.dark,
    backgroundColor: colors.light,
    width: "100%",
    marginBottom: 10,
  },
  chooseEmojiBtn: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "#FEECEC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 10,
    alignItems: "center",
    width: "100%",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
  },
  cancelBtn: {
    backgroundColor: colors.light,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginLeft: 8,
  },
});

/* 🔹 SectionModal */
export const sectionModal = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: modalBase.box,
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.dark,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1.2,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: colors.dark,
    backgroundColor: colors.light,
    width: "100%",
    marginBottom: 10,
  },
  chooseEmojiBtn: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "#FEECEC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 10,
    alignItems: "center",
    width: "100%",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
  },
  cancelBtn: {
    backgroundColor: colors.light,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginLeft: 8,
  },
});

/* 🧩 QR Modal */
export const qrModal = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: {
    ...modalBase.box,
    alignItems: "center",
    justifyContent: "center",
    width: "85%",
  },
});

/* 🧩 Emoji Picker */
export const emojiPicker = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: {
    ...modalBase.box,
    width: "90%",
    padding: 16,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    color: colors.dark,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "100%",
    marginBottom: 10,
  },
  emojiCell: {
    margin: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "#FEECEC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
});
