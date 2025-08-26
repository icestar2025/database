import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWbSalesData, fetchOzonSalesData, fetchCombinedSalesData } from '../../services/dataService';

export const fetchWbData = createAsyncThunk(
  'data/fetchWbData',
  async ({ dateRange, selectedSku, groupBy }, { rejectWithValue }) => {
    try {
      const data = await fetchWbSalesData(dateRange, selectedSku, groupBy);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOzonData = createAsyncThunk(
  'data/fetchOzonData',
  async ({ dateRange, selectedSku, groupBy }, { rejectWithValue }) => {
    try {
      const data = await fetchOzonSalesData(dateRange, selectedSku, groupBy);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCombinedData = createAsyncThunk(
  'data/fetchCombinedData',
  async ({ dateRange, selectedSku, groupBy }, { rejectWithValue }) => {
    try {
      const data = await fetchCombinedSalesData(dateRange, selectedSku, groupBy);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  wb: {
    salesData: [],
    weeklyData: [],
    loading: false,
    error: null,
  },
  ozon: {
    salesData: [],
    weeklyData: [],
    loading: false,
    error: null,
  },
  combined: {
    salesData: [],
    weeklyData: [],
    loading: false,
    error: null,
  },
  products: [],
  productsLoading: false,
};

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setProductsLoading: (state, action) => {
      state.productsLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // WB数据
    builder
      .addCase(fetchWbData.pending, (state) => {
        state.wb.loading = true;
        state.wb.error = null;
      })
      .addCase(fetchWbData.fulfilled, (state, action) => {
        state.wb.loading = false;
        state.wb.salesData = action.payload.salesData || [];
        state.wb.weeklyData = action.payload.weeklyData || [];
      })
      .addCase(fetchWbData.rejected, (state, action) => {
        state.wb.loading = false;
        state.wb.error = action.payload;
      })
      
      // OZON数据
      .addCase(fetchOzonData.pending, (state) => {
        state.ozon.loading = true;
        state.ozon.error = null;
      })
      .addCase(fetchOzonData.fulfilled, (state, action) => {
        state.ozon.loading = false;
        state.ozon.salesData = action.payload.salesData || [];
        state.ozon.weeklyData = action.payload.weeklyData || [];
      })
      .addCase(fetchOzonData.rejected, (state, action) => {
        state.ozon.loading = false;
        state.ozon.error = action.payload;
      })
      
      // 综合数据
      .addCase(fetchCombinedData.pending, (state) => {
        state.combined.loading = true;
        state.combined.error = null;
      })
      .addCase(fetchCombinedData.fulfilled, (state, action) => {
        state.combined.loading = false;
        state.combined.salesData = action.payload.salesData || [];
        state.combined.weeklyData = action.payload.weeklyData || [];
      })
      .addCase(fetchCombinedData.rejected, (state, action) => {
        state.combined.loading = false;
        state.combined.error = action.payload;
      });
  },
});

export const { setProducts, setProductsLoading } = dataSlice.actions;

export default dataSlice.reducer;