import { StyleSheet } from "react-native";

/* 🎨 Paleta de colores corporativa */
export const colors = {
  primary: "#ff3b30",
  secondary: "#00C851",
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
    padding: 22,
    borderRadius: 14,
    alignItems: "center",
    width: "95%",
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
    left: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
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
  createField: {
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: "#E7FBEA",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "center",
    width: "100%",
  },
  qrIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 5,
    elevation: 3,
  },
  redOutline: {
    borderColor: colors.primary,
    backgroundColor: colors.light,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  greenOutline: {
    borderColor: colors.secondary,
    backgroundColor: "#E7FBEA",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  blueOutline: {
    borderColor: "#007AFF",
    backgroundColor: "#E7F0FB",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

/* 🧾 Textos */
export const text = StyleSheet.create({
  title: { color: colors.light, fontWeight: "700", fontSize: 22 },
  subtitle: { color: colors.gray, fontWeight: "600", fontSize: 16 },
  link: { color: "#007AFF", fontWeight: "600" },
  emoji: { fontSize: 34, textAlign: "center" },
  sectionEmoji: { fontSize: 28, textAlign: "center" },
  cardTitle: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: colors.dark,
  },
  icon: { fontSize: 18, marginHorizontal: 6 },
  iconsRow: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
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
    padding: 20,
    alignSelf: "center",
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  typeBtn: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: "30%",
    alignItems: "center",
  },
  typeBtnActive: {
    backgroundColor: "#E7FBEA",
    borderColor: colors.secondary,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 8,
  },
  modeBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  modeBtnActiveBlue: {
    borderColor: "#007AFF",
    backgroundColor: "#E7F0FB",
  },
  modeBtnActiveRed: {
    borderColor: "#ff3b30",
    backgroundColor: "#FEECEC",
  },
  modeText: { color: colors.dark, fontWeight: "600" },
  modeTextActiveBlue: { color: "#007AFF", fontWeight: "700" },
  modeTextActiveRed: { color: "#ff3b30", fontWeight: "700" },
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
    aspectRatio: 1.1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
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

/* 📱 Utilidades */
export const utils = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    width: "100%",
  },
  centered: { justifyContent: "center", alignItems: "center" },
  fullWidth: { width: "100%" },
  marginVertical: { marginVertical: 10 },
  gap: { marginHorizontal: 6 },
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontWeight: "600", color: colors.dark, flex: 1 },
  value: { color: "#333", fontWeight: "500", textAlign: "right" },
  iconsRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginRight: 6,
  },
});

/* 🧩 Modales: grupo y sección */
export const groupModal = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: {
    ...modalBase.box,
    width: "90%",
    alignItems: "stretch",
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
  chooseEmojiBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 10,
  },
  cancelBtn: forms.cancelBtn,
  saveBtn: forms.saveBtn,
});

export const sectionModal = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: {
    ...modalBase.box,
    width: "90%",
    alignItems: "stretch",
  },
  title: groupModal.title,
  input: groupModal.input,
  chooseEmojiBtn: groupModal.chooseEmojiBtn,
  actionsRow: groupModal.actionsRow,
  cancelBtn: forms.cancelBtn,
  saveBtn: forms.saveBtn,
});

/* 🧩 QR modal y emoji picker */
export const qrModal = StyleSheet.create({
  backdrop: modalBase.backdrop,
  box: {
    ...modalBase.box,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 16,
    gap: 10,
  },
});

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
});

/* 🧮 Campos numéricos / dinero */
export const numeric = StyleSheet.create({
  label: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: colors.light,
    color: colors.dark,
    marginBottom: 14,
  },
});
