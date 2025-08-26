import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Spin, Empty, Alert, Tabs } from 'antd';
import { Line, Column, Pie } from '@ant-design/charts';

// 组件
import PageHeader from '../../components/PageHeader';
import DateRangeFilter from '../../components/Filters/DateRangeFilter';
import SkuFilter from '../../components/Filters/SkuFilter';
import TimeRangeFilter from '../../components/Filters/TimeRangeFilter';
import KeyMetricCard from '../../components/KeyMetricCard';
import TrendChart from '../../components/Charts/TrendChart';
import DataTable from '../../components/DataTable';

// Redux actions
import { setDateRange, setSelectedSku, setTimeRange } from '../../store/slices/filtersSlice';
import { fetchCombinedData } from '../../store/slices/dataSlice';

// 工具函数
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

const { TabPane } = Tabs;

const CombinedDashboard = () => {
  const dispatch = useDispatch();
  
  // 从Redux获取状态
  const { dateRange, selectedSku, timeRange } = useSelector(state => state.filters);
  const { combinedData, loading, error } = useSelector(state => state.data);
  
  // 本地状态
  const [salesData, setSalesData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  
  // 初始化加载数据
  useEffect(() => {
    dispatch(fetchCombinedData({ dateRange, selectedSku, timeRange }));
  }, [dispatch, dateRange, selectedSku, timeRange]);
  
  // 当数据加载完成后更新本地状态
  useEffect(() => {
    if (combinedData) {
      setSalesData(combinedData.salesData || []);
      setWeeklyData(combinedData.weeklyData || []);
    }
  }, [combinedData]);
  
  // 处理筛选器变化
  const handleDateRangeChange = (dates) => {
    dispatch(setDateRange(dates));
  };
  
  const handleSkuChange = (skus) => {
    dispatch(setSelectedSku(skus));
  };
  
  const handleTimeRangeChange = (range) => {
    dispatch(setTimeRange(range));
  };
  
  // 计算关键指标
  const calculateMetrics = () => {
    if (!salesData || salesData.length === 0) {
      return {
        totalWbOrders: 0,
        totalWbSales: 0,
        totalOzonOrders: 0,
        totalOzonImpressions: 0,
        totalOrders: 0,
        wbPercentage: 0,
        ozonPercentage: 0
      };
    }
    
    const totalWbOrders = salesData.reduce((sum, item) => sum + (item.wb_orders || 0), 0);
    const totalWbSales = salesData.reduce((sum, item) => sum + (item.wb_sales || 0), 0);
    const totalOzonOrders = salesData.reduce((sum, item) => sum + (item.ozon_orders || 0), 0);
    const totalOzonImpressions = salesData.reduce((sum, item) => sum + (item.ozon_impressions || 0), 0);
    
    const totalOrders = totalWbOrders + totalOzonOrders;
    const wbPercentage = totalOrders > 0 ? (totalWbOrders / totalOrders) * 100 : 0;
    const ozonPercentage = totalOrders > 0 ? (totalOzonOrders / totalOrders) * 100 : 0;
    
    return {
      totalWbOrders,
      totalWbSales,
      totalOzonOrders,
      totalOzonImpressions,
      totalOrders,
      wbPercentage,
      ozonPercentage
    };
  };
  
  const metrics = calculateMetrics();
  
  // 准备平台订单占比数据
  const platformShareData = [
    { type: 'WB', value: metrics.totalWbOrders },
    { type: 'OZON', value: metrics.totalOzonOrders },
  ];
  
  // 平台订单占比图表配置
  const platformShareConfig = {
    data: platformShareData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      layout: 'horizontal',
      position: 'bottom'
    },
    color: ['#1890ff', '#fa8c16']
  };
  
  // 总订单趋势图配置
  const totalOrdersTrendConfig = {
    data: salesData.map(item => ({
      date: item.date,
      value: (item.wb_orders || 0) + (item.ozon_orders || 0),
      category: '总订单量'
    })),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    color: '#1890ff',
    meta: {
      value: {
        alias: '总订单量',
      },
    },
  };
  
  // 平台订单对比趋势图配置
  const platformComparisonConfig = {
    data: [
      ...salesData.map(item => ({
        date: item.date,
        value: item.wb_orders || 0,
        category: 'WB订单'
      })),
      ...salesData.map(item => ({
        date: item.date,
        value: item.ozon_orders || 0,
        category: 'OZON订单'
      }))
    ],
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    color: ['#1890ff', '#fa8c16'],
    meta: {
      value: {
        alias: '订单量',
      },
    },
  };
  
  // 周订单趋势图配置
  const weeklyOrdersTrendConfig = {
    data: [
      ...weeklyData.map(item => ({
        week: `${new Date(item.week_start).getMonth() + 1}/${new Date(item.week_start).getDate()}`,
        value: item.wb_orders || 0,
        category: 'WB周订单'
      })),
      ...weeklyData.map(item => ({
        week: `${new Date(item.week_start).getMonth() + 1}/${new Date(item.week_start).getDate()}`,
        value: item.ozon_orders || 0,
        category: 'OZON周订单'
      }))
    ],
    xField: 'week',
    yField: 'value',
    seriesField: 'category',
    isGroup: true,
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
    color: ['#1890ff', '#fa8c16'],
  };
  
  // 数据表格列配置
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'WB订单量',
      dataIndex: 'wb_orders',
      key: 'wb_orders',
      render: (text) => formatNumber(text || 0),
      sorter: (a, b) => (a.wb_orders || 0) - (b.wb_orders || 0),
    },
    {
      title: 'WB销售额',
      dataIndex: 'wb_sales',
      key: 'wb_sales',
      render: (text) => formatCurrency(text || 0),
      sorter: (a, b) => (a.wb_sales || 0) - (b.wb_sales || 0),
    },
    {
      title: 'OZON曝光量',
      dataIndex: 'ozon_impressions',
      key: 'ozon_impressions',
      render: (text) => formatNumber(text || 0),
      sorter: (a, b) => (a.ozon_impressions || 0) - (b.ozon_impressions || 0),
    },
    {
      title: 'OZON点击量',
      dataIndex: 'ozon_clicks',
      key: 'ozon_clicks',
      render: (text) => formatNumber(text || 0),
      sorter: (a, b) => (a.ozon_clicks || 0) - (b.ozon_clicks || 0),
    },
    {
      title: 'OZON订单量',
      dataIndex: 'ozon_orders',
      key: 'ozon_orders',
      render: (text) => formatNumber(text || 0),
      sorter: (a, b) => (a.ozon_orders || 0) - (b.ozon_orders || 0),
    },
    {
      title: '总订单量',
      key: 'total_orders',
      render: (_, record) => formatNumber((record.wb_orders || 0) + (record.ozon_orders || 0)),
      sorter: (a, b) => {
        const totalA = (a.wb_orders || 0) + (a.ozon_orders || 0);
        const totalB = (b.wb_orders || 0) + (b.ozon_orders || 0);
        return totalA - totalB;
      },
    },
  ];
  
  return (
    <div className="dashboard-container">
      <PageHeader title="综合销售数据看板" />
      
      {/* 筛选器区域 */}
      <Card className="filter-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <SkuFilter value={selectedSku} onChange={handleSkuChange} />
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
          </Col>
        </Row>
      </Card>
      
      {/* 加载状态 */}
      {loading && (
        <div className="loading-container">
          <Spin size="large" tip="加载数据中..." />
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <Alert
          message="数据加载错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 数据内容区域 */}
      {!loading && !error && salesData && salesData.length > 0 ? (
        <>
          {/* 关键指标卡片 */}
          <Row gutter={[16, 16]} className="metrics-row">
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="总订单量"
                value={metrics.totalOrders}
                formatter={formatNumber}
                icon="shopping-cart"
                color="#1890ff"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="WB订单量"
                value={metrics.totalWbOrders}
                formatter={formatNumber}
                icon="shopping"
                color="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="WB销售额"
                value={metrics.totalWbSales}
                formatter={formatCurrency}
                icon="dollar"
                color="#faad14"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="OZON订单量"
                value={metrics.totalOzonOrders}
                formatter={formatNumber}
                icon="shopping"
                color="#fa8c16"
              />
            </Col>
          </Row>
          
          {/* 趋势图表 */}
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="平台订单占比" className="chart-card">
                <Pie {...platformShareConfig} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="总订单趋势" className="chart-card">
                <TrendChart {...totalOrdersTrendConfig} />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="平台订单对比" className="chart-card">
                <TrendChart {...platformComparisonConfig} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="周订单对比" className="chart-card">
                <Column {...weeklyOrdersTrendConfig} />
              </Card>
            </Col>
          </Row>
          
          {/* 数据表格 */}
          <Card title="综合销售数据明细" className="table-card">
            <DataTable
              columns={columns}
              dataSource={salesData}
              rowKey="date"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      ) : !loading && !error ? (
        <Empty description="暂无数据" />
      ) : null}
    </div>
  );
};

export default CombinedDashboard;