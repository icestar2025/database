import supabase from './supabaseClient';
import { formatDate } from '../utils/formatters';

// 获取所有产品列表
export const fetchProducts = async () => {
  try {
    // 从WB产品表获取唯一SKU
    const { data: wbProducts, error: wbError } = await supabase
      .from('wb_product_sales')
      .select('sku')
      .order('sku')
      .limit(1000);

    if (wbError) throw wbError;

    // 从OZON产品表获取唯一SKU
    const { data: ozonProducts, error: ozonError } = await supabase
      .from('ozon_product_sales')
      .select('sku')
      .order('sku')
      .limit(1000);

    if (ozonError) throw ozonError;

    // 合并并去重
    const allSkus = [...wbProducts, ...ozonProducts].map(item => item.sku);
    const uniqueSkus = [...new Set(allSkus)];
    
    return uniqueSkus.map(sku => ({ value: sku, label: sku }));
  } catch (error) {
    console.error('获取产品列表失败:', error);
    throw error;
  }
};

// 获取WB销售数据
export const fetchWbSalesData = async (dateRange, selectedSku = [], groupBy = 'day') => {
  try {
    const startDate = formatDate(dateRange[0]);
    const endDate = formatDate(dateRange[1]);

    let query = supabase
      .from('wb_product_sales')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    // 如果选择了特定SKU，则添加筛选条件
    if (selectedSku && selectedSku.length > 0) {
      query = query.in('sku', selectedSku);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 根据groupBy参数处理数据
    let processedData;
    if (groupBy === 'day') {
      // 按天分组
      const groupedByDay = data.reduce((acc, item) => {
        const day = item.date;
        if (!acc[day]) {
          acc[day] = {
            date: day,
            orders: 0,
            sales: 0,
            returns: 0,
            conversion_rate: 0
          };
        }
        acc[day].orders += item.orders || 0;
        acc[day].sales += item.sales || 0;
        acc[day].returns += item.returns || 0;
        return acc;
      }, {});

      processedData = Object.values(groupedByDay);
      
      // 计算转化率
      processedData.forEach(item => {
        item.conversion_rate = item.orders > 0 ? ((item.sales / item.orders) * 100).toFixed(2) : 0;
      });
    } else {
      // 按SKU分组
      const groupedBySku = data.reduce((acc, item) => {
        const sku = item.sku;
        if (!acc[sku]) {
          acc[sku] = {
            sku: sku,
            orders: 0,
            sales: 0,
            returns: 0,
            conversion_rate: 0
          };
        }
        acc[sku].orders += item.orders || 0;
        acc[sku].sales += item.sales || 0;
        acc[sku].returns += item.returns || 0;
        return acc;
      }, {});

      processedData = Object.values(groupedBySku);
      
      // 计算转化率
      processedData.forEach(item => {
        item.conversion_rate = item.orders > 0 ? ((item.sales / item.orders) * 100).toFixed(2) : 0;
      });
    }

    // 获取周销售数据
    const weeklyData = await fetchWbWeeklySales(dateRange, selectedSku);

    return {
      salesData: processedData,
      weeklyData
    };
  } catch (error) {
    console.error('获取WB销售数据失败:', error);
    throw error;
  }
};

// 获取OZON销售数据
export const fetchOzonSalesData = async (dateRange, selectedSku = [], groupBy = 'day') => {
  try {
    const startDate = formatDate(dateRange[0]);
    const endDate = formatDate(dateRange[1]);

    let query = supabase
      .from('ozon_product_sales')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    // 如果选择了特定SKU，则添加筛选条件
    if (selectedSku && selectedSku.length > 0) {
      query = query.in('sku', selectedSku);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 根据groupBy参数处理数据
    let processedData;
    if (groupBy === 'day') {
      // 按天分组
      const groupedByDay = data.reduce((acc, item) => {
        const day = item.date;
        if (!acc[day]) {
          acc[day] = {
            date: day,
            impressions: 0,
            clicks: 0,
            ctr: 0,
            add_to_cart: 0,
            cart_conversion: 0,
            orders: 0,
            order_conversion: 0,
            position: 0,
            position_count: 0
          };
        }
        acc[day].impressions += item.impressions || 0;
        acc[day].clicks += item.clicks || 0;
        acc[day].add_to_cart += item.add_to_cart || 0;
        acc[day].orders += item.orders || 0;
        
        // 累计位置数据用于计算平均值
        if (item.position) {
          acc[day].position += item.position;
          acc[day].position_count += 1;
        }
        
        return acc;
      }, {});

      processedData = Object.values(groupedByDay);
      
      // 计算各种转化率和平均位置
      processedData.forEach(item => {
        item.ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : 0;
        item.cart_conversion = item.clicks > 0 ? ((item.add_to_cart / item.clicks) * 100).toFixed(2) : 0;
        item.order_conversion = item.add_to_cart > 0 ? ((item.orders / item.add_to_cart) * 100).toFixed(2) : 0;
        item.position = item.position_count > 0 ? (item.position / item.position_count).toFixed(1) : 0;
        delete item.position_count; // 删除辅助计数字段
      });
    } else {
      // 按SKU分组
      const groupedBySku = data.reduce((acc, item) => {
        const sku = item.sku;
        if (!acc[sku]) {
          acc[sku] = {
            sku: sku,
            impressions: 0,
            clicks: 0,
            ctr: 0,
            add_to_cart: 0,
            cart_conversion: 0,
            orders: 0,
            order_conversion: 0,
            position: 0,
            position_count: 0
          };
        }
        acc[sku].impressions += item.impressions || 0;
        acc[sku].clicks += item.clicks || 0;
        acc[sku].add_to_cart += item.add_to_cart || 0;
        acc[sku].orders += item.orders || 0;
        
        // 累计位置数据用于计算平均值
        if (item.position) {
          acc[sku].position += item.position;
          acc[sku].position_count += 1;
        }
        
        return acc;
      }, {});

      processedData = Object.values(groupedBySku);
      
      // 计算各种转化率和平均位置
      processedData.forEach(item => {
        item.ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : 0;
        item.cart_conversion = item.clicks > 0 ? ((item.add_to_cart / item.clicks) * 100).toFixed(2) : 0;
        item.order_conversion = item.add_to_cart > 0 ? ((item.orders / item.add_to_cart) * 100).toFixed(2) : 0;
        item.position = item.position_count > 0 ? (item.position / item.position_count).toFixed(1) : 0;
        delete item.position_count; // 删除辅助计数字段
      });
    }

    // 获取周销售数据
    const weeklyData = await fetchOzonWeeklySales(dateRange, selectedSku);

    return {
      salesData: processedData,
      weeklyData
    };
  } catch (error) {
    console.error('获取OZON销售数据失败:', error);
    throw error;
  }
};

// 获取综合销售数据
export const fetchCombinedSalesData = async (dateRange, selectedSku = [], groupBy = 'day') => {
  try {
    // 并行获取WB和OZON数据
    const [wbData, ozonData] = await Promise.all([
      fetchWbSalesData(dateRange, selectedSku, groupBy),
      fetchOzonSalesData(dateRange, selectedSku, groupBy)
    ]);

    // 合并数据
    let combinedData;
    
    if (groupBy === 'day') {
      // 按日期合并
      const dateMap = {};
      
      // 处理WB数据
      wbData.salesData.forEach(item => {
        const date = item.date;
        if (!dateMap[date]) {
          dateMap[date] = {
            date,
            wb_orders: 0,
            wb_sales: 0,
            wb_returns: 0,
            ozon_impressions: 0,
            ozon_clicks: 0,
            ozon_add_to_cart: 0,
            ozon_orders: 0,
            total_orders: 0,
            total_sales: 0
          };
        }
        dateMap[date].wb_orders = item.orders;
        dateMap[date].wb_sales = item.sales;
        dateMap[date].wb_returns = item.returns;
        dateMap[date].total_orders += item.orders;
        dateMap[date].total_sales += item.sales;
      });
      
      // 处理OZON数据
      ozonData.salesData.forEach(item => {
        const date = item.date;
        if (!dateMap[date]) {
          dateMap[date] = {
            date,
            wb_orders: 0,
            wb_sales: 0,
            wb_returns: 0,
            ozon_impressions: 0,
            ozon_clicks: 0,
            ozon_add_to_cart: 0,
            ozon_orders: 0,
            total_orders: 0,
            total_sales: 0
          };
        }
        dateMap[date].ozon_impressions = item.impressions;
        dateMap[date].ozon_clicks = item.clicks;
        dateMap[date].ozon_add_to_cart = item.add_to_cart;
        dateMap[date].ozon_orders = item.orders;
        dateMap[date].total_orders += item.orders;
        // OZON没有直接的销售额数据，这里可以根据实际情况调整
      });
      
      combinedData = Object.values(dateMap);
    } else {
      // 按SKU合并
      const skuMap = {};
      
      // 处理WB数据
      wbData.salesData.forEach(item => {
        const sku = item.sku;
        if (!skuMap[sku]) {
          skuMap[sku] = {
            sku,
            wb_orders: 0,
            wb_sales: 0,
            wb_returns: 0,
            ozon_impressions: 0,
            ozon_clicks: 0,
            ozon_add_to_cart: 0,
            ozon_orders: 0,
            total_orders: 0,
            total_sales: 0
          };
        }
        skuMap[sku].wb_orders = item.orders;
        skuMap[sku].wb_sales = item.sales;
        skuMap[sku].wb_returns = item.returns;
        skuMap[sku].total_orders += item.orders;
        skuMap[sku].total_sales += item.sales;
      });
      
      // 处理OZON数据
      ozonData.salesData.forEach(item => {
        const sku = item.sku;
        if (!skuMap[sku]) {
          skuMap[sku] = {
            sku,
            wb_orders: 0,
            wb_sales: 0,
            wb_returns: 0,
            ozon_impressions: 0,
            ozon_clicks: 0,
            ozon_add_to_cart: 0,
            ozon_orders: 0,
            total_orders: 0,
            total_sales: 0
          };
        }
        skuMap[sku].ozon_impressions = item.impressions;
        skuMap[sku].ozon_clicks = item.clicks;
        skuMap[sku].ozon_add_to_cart = item.add_to_cart;
        skuMap[sku].ozon_orders = item.orders;
        skuMap[sku].total_orders += item.orders;
        // OZON没有直接的销售额数据，这里可以根据实际情况调整
      });
      
      combinedData = Object.values(skuMap);
    }

    // 合并周数据
    const combinedWeeklyData = mergeWeeklyData(wbData.weeklyData, ozonData.weeklyData);

    return {
      salesData: combinedData,
      weeklyData: combinedWeeklyData
    };
  } catch (error) {
    console.error('获取综合销售数据失败:', error);
    throw error;
  }
};

// 获取WB周销售数据
async function fetchWbWeeklySales(dateRange, selectedSku = []) {
  try {
    const startDate = formatDate(dateRange[0]);
    const endDate = formatDate(dateRange[1]);

    let query = supabase
      .from('wb_weekly_sales')
      .select('*')
      .gte('week_start', startDate)
      .lte('week_end', endDate);

    if (selectedSku && selectedSku.length > 0) {
      query = query.in('sku', selectedSku);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 按周分组数据
    const groupedByWeek = data.reduce((acc, item) => {
      const weekKey = `${item.week_start}_${item.week_end}`;
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week_start: item.week_start,
          week_end: item.week_end,
          orders: 0,
          sales: 0
        };
      }
      acc[weekKey].orders += item.orders || 0;
      acc[weekKey].sales += item.sales || 0;
      return acc;
    }, {});

    return Object.values(groupedByWeek);
  } catch (error) {
    console.error('获取WB周销售数据失败:', error);
    return [];
  }
}

// 获取OZON周销售数据
async function fetchOzonWeeklySales(dateRange, selectedSku = []) {
  try {
    const startDate = formatDate(dateRange[0]);
    const endDate = formatDate(dateRange[1]);

    let query = supabase
      .from('ozon_weekly_sales')
      .select('*')
      .gte('week_start', startDate)
      .lte('week_end', endDate);

    if (selectedSku && selectedSku.length > 0) {
      query = query.in('sku', selectedSku);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 按周分组数据
    const groupedByWeek = data.reduce((acc, item) => {
      const weekKey = `${item.week_start}_${item.week_end}`;
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week_start: item.week_start,
          week_end: item.week_end,
          impressions: 0,
          clicks: 0,
          orders: 0,
          position: 0,
          position_count: 0
        };
      }
      acc[weekKey].impressions += item.impressions || 0;
      acc[weekKey].clicks += item.clicks || 0;
      acc[weekKey].orders += item.orders || 0;
      
      if (item.position) {
        acc[weekKey].position += item.position;
        acc[weekKey].position_count += 1;
      }
      
      return acc;
    }, {});

    // 计算平均位置
    const result = Object.values(groupedByWeek).map(item => {
      const avgPosition = item.position_count > 0 ? (item.position / item.position_count).toFixed(1) : 0;
      return {
        ...item,
        position: avgPosition,
        ctr: item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : 0
      };
    });

    return result;
  } catch (error) {
    console.error('获取OZON周销售数据失败:', error);
    return [];
  }
}

// 合并WB和OZON的周数据
function mergeWeeklyData(wbWeeklyData, ozonWeeklyData) {
  const weekMap = {};
  
  // 处理WB周数据
  wbWeeklyData.forEach(item => {
    const weekKey = `${item.week_start}_${item.week_end}`;
    if (!weekMap[weekKey]) {
      weekMap[weekKey] = {
        week_start: item.week_start,
        week_end: item.week_end,
        wb_orders: 0,
        wb_sales: 0,
        ozon_orders: 0,
        ozon_impressions: 0,
        ozon_clicks: 0,
        total_orders: 0
      };
    }
    weekMap[weekKey].wb_orders = item.orders;
    weekMap[weekKey].wb_sales = item.sales;
    weekMap[weekKey].total_orders += item.orders;
  });
  
  // 处理OZON周数据
  ozonWeeklyData.forEach(item => {
    const weekKey = `${item.week_start}_${item.week_end}`;
    if (!weekMap[weekKey]) {
      weekMap[weekKey] = {
        week_start: item.week_start,
        week_end: item.week_end,
        wb_orders: 0,
        wb_sales: 0,
        ozon_orders: 0,
        ozon_impressions: 0,
        ozon_clicks: 0,
        total_orders: 0
      };
    }
    weekMap[weekKey].ozon_orders = item.orders;
    weekMap[weekKey].ozon_impressions = item.impressions;
    weekMap[weekKey].ozon_clicks = item.clicks;
    weekMap[weekKey].total_orders += item.orders;
  });
  
  return Object.values(weekMap);
}