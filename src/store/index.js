import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import dataReducer from './slices/dataSlice';

const store = configureStore({
  reducer: {
    filters: filtersReducer,
    data: dataReducer,
  },
});

export default store;