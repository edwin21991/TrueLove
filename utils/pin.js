// utils/pin.js
import * as SecureStore from "expo-secure-store";

const PIN_KEY = "finca_pin_4";

export async function setPin(pin) {
  if (!/^\d{4}$/.test(pin)) throw new Error("Pin must be 4 digits");
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function checkPin(pin) {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored === pin;
}

export async function removePin() {
  await SecureStore.deleteItemAsync(PIN_KEY);
}
