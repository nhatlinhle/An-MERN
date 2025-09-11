import { configureStore } from "@reduxjs/toolkit"
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { combineReducers } from "redux"
import reducer from '../reducers'

const store = configureStore({
  reducer: combineReducers(reducer),
  middleware: (getDefaultMiddleware) => {
    let middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        isSerializable: () => true
      },
    });
    return middleware;
  },
});

export const persistore = persistStore(store);
export default store;
