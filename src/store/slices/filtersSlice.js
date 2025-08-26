import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const initialState = {
  dateRange: [dayjs().subtract(30, 'day'), dayjs()],
  selectedSku: [],
  timeRange: '30d', // 可选值: '7d', '30d', '90d', 'custom'
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
      if (action.payload[1].diff(action.payload[0], 'day') !== 30) {
        state.timeRange = 'custom';
      }
    },
    setSelectedSku: (state, action) => {
      state.selectedSku = action.payload;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
      
      // 根据选择的时间范围更新日期范围
      const today = dayjs();
      switch (action.payload) {
        case '7d':
          state.dateRange = [today.subtract(7, 'day'), today];
          break;
        case '30d':
          state.dateRange = [today.subtract(30, 'day'), today];
          break;
        case '90d':
          state.dateRange = [today.subtract(90, 'day'), today];
          break;
        // custom 不需要在这里处理，因为会通过 setDateRange 单独设置
        default:
          break;
      }
    },
  },
});

export const { setDateRange, setSelectedSku, setTimeRange } = filtersSlice.actions;

export default filtersSlice.reducer;