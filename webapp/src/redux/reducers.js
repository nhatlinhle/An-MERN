import storage from 'redux-persist/lib/storage';
import CryptoJS from 'crypto-js';
import { constants } from "@/config";

const encrypt = (data) => {
  return CryptoJS.AES.encrypt(data, constants.secretKey).toString();
};

const decrypt = (data) => {
  const bytes = CryptoJS.AES.decrypt(data, constants.secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const encryptedStorage = {
  ...storage,
  setItem: (key, value) => {
    const encryptedValue = encrypt(value);
    return storage.setItem(key, encryptedValue);
  },
  getItem: (key) => {
    return storage.getItem(key).then((value) => {
      if (!value) return null;
      const decryptedValue = decrypt(value);
      return decryptedValue;
    });
  }
};

const persistConfig = {
  key: 'react_session',
  storage: encryptedStorage,
};

const rootReducer = {
  //
}

export default rootReducer;