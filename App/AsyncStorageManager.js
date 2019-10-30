import { AsyncStorage } from "react-native";

export default class AsyncStorageManager {
  static async setValue(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log("ERROR SAVING TO ASYNC STORAGE: ", e);
    }
  }

  static async getValue(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      console.log("ERROR READING FROM ASYNC STORAGE: ", e);
    }
  }
}
