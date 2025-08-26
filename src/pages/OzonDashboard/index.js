import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Spin, Empty, Alert } from 'antd';
import { Line, Column, Funnel } from '@ant-design/charts';

// 组件
import PageHeader from '../../components/PageHeader';
import DateRangeFilter from '../../components/Filters/DateRangeFilter';
import SkuFilter from '../../components/Filters/SkuFilter';
import TimeRangeFilter from '../../components/Filters/TimeRangeFilter';
import KeyMetricCard from '../../components/KeyMetricCard';
import TrendChart from '../../components/Charts/TrendChart';
import FunnelChart from '../../components/Charts/FunnelChart';
import DataTable from '../../components/DataTable';

// Redux actions
import { setDateRange, setSelectedSku, setTimeRange } from '../../store/slices/filtersSlice';
import { fetchOzonData } from '../../store/slices/dataSlice';

// 工具函数
import { formatNumber, formatPercent } from '../../utils/formatters';

const OzonDashboard = () => {
  const dispatch = useDispatch();
  
  // 从Redux获取状态
  const { dateRange, selectedSku, timeRange } = useSelector(state => state.filters);
  const { ozonData, loading, error } = useSelector(state => state.data);
  
  // 本地状态
  const [salesData, setSalesData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  
  // 初始化加载数据
  useEffect(() => {
    dispatch(fetchOzonData({ dateRange, selectedSku, timeRange }));
  }, [dispatch, dateRange, selectedSku, timeRange]);
  
  // 当数据加载完成后更新本地状态
  useEffect(() => {
    if (ozonData) {
      setSalesData(ozonData.salesData || []);
      setWeeklyData(ozonData.weeklyData || []);
    }
  }, [ozonData]);
  
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
        totalImpressions: 0,
        totalClicks: 0,
        ctr: 0,
        totalAddToCart: 0,
        cartRate: 0,
        totalOrders: 0,
        orderRate: 0,
        avgPosition: 0
      };
    }
    
    const totalImpressions = salesData.reduce((sum, item) => sum + (item.impressions || 0), 0);
    const totalClicks = salesData.reduce((sum, item) => sum + (item.clicks || 0), 0);
    const totalAddToCart = salesData.reduce((sum, item) => sum + (item.add_to_cart || 0), 0);
    const totalOrders = salesData.reduce((sum, item) => sum + (item.orders || 0), 0);
    
    // 计算平均位置
    let positionSum = 0;
    let positionCount = 0;
    salesData.forEach(item => {
      if (item.position) {
        positionSum += parseFloat(item.position);
        positionCount++;
      }
    });
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cartRate = totalClicks > 0 ? (totalAddToCart / totalClicks) * 100 : 0;
    const orderRate = totalAddToCart > 0 ? (totalOrders / totalAddToCart) * 100 : 0;
    const avgPosition = positionCount > 0 ? positionSum / positionCount : 0;
    
    return {
      totalImpressions,
      totalClicks,
      ctr,
      totalAddToCart,
      cartRate,
      totalOrders,
      orderRate,
      avgPosition
    };
  };
  
  const metrics = calculateMetrics();
  
  // 准备漏斗图数据
  const funnelData = [
    { stage: '曝光量', value: metrics.totalImpressions },
    { stage: '点击量', value: metrics.totalClicks },
    { stage: '加购量', value: metrics.totalAddToCart },
    { stage: '下单量', value: metrics.totalOrders },
  ];
  
  // 点击率趋势图配置
  const ctrTrendConfig = {
    data: salesData.map(item => ({
      date: item.date,
      value: parseFloat(item.ctr) || 0,
      category: '点击率'
    })),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    color: '#1890ff',
    meta: {
      value: {
        alias: '点击率(%)',
        formatter: (v) => `${v.toFixed(2)}%`,
      },
    },
  };
  
  // 加购率趋势图配置
  const cartRateTrendConfig = {
    data: salesData.map(item => ({
      date: item.date,
      value: parseFloat(item.cart_conversion) || 0,
      category: '加购率'
    })),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    color: '#52c41a',
    meta: {
      value: {
        alias: '加购率(%)',
        formatter: (v) => `${v.toFixed(2)}%`,
      },
    },
  };
  
  // 周订单趋势图配置
  const weeklyOrdersTrendConfig = {
    data: weeklyData,
    xField: 'week_start',
    yField: 'orders',
    seriesField: 'week_start',
    color: '#722ed1',
    meta: {
      week_start: {
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getMonth() + 1}月${date.getDate()}日`;
        },
      },
      orders: {
        alias: '周订单量',
      },
    },
    xAxis: {
      label: {
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        },
      },
    },
  };
  
  // 周位置趋势图配置
  const weeklyPositionTrendConfig = {
    data: weeklyData,
    xField: 'week_start',
    yField: 'position',
    seriesField: 'week_start',
    color: '#fa8c16',
    meta: {
      week_start: {
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getMonth() + 1}月${date.getDate()}日`;
        },
      },
      position: {
        alias: '平均位置',
      },
    },
    xAxis: {
      label: {
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        },
      },
    },
    yAxis: {
      // 位置数值越小越好，所以反转Y轴
      reverse: true,
    },
  };
  
  // 漏斗图配置
  const funnelChartConfig = {
    data: funnelData,
    xField: 'stage',
    yField: 'value',
    legend: false,
    conversionTag: {
      visible: true,
    },
  };
  
  // 数据表格列配置
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '曝光量',
      dataIndex: 'impressions',
      key: 'impressions',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.impressions - b.impressions,
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.clicks - b.clicks,
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.ctr - b.ctr,
    },
    {
      title: '加购量',
      dataIndex: 'add_to_cart',
      key: 'add_to_cart',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.add_to_cart - b.add_to_cart,
    },
    {
      title: '加购率',
      dataIndex: 'cart_conversion',
      key: 'cart_conversion',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.cart_conversion - b.cart_conversion,
    },
    {
      title: '订单量',
      dataIndex: 'orders',
      key: 'orders',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: '下单率',
      dataIndex: 'order_conversion',
      key: 'order_conversion',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.order_conversion - b.order_conversion,
    },
    {
      title: '平均位置',
      dataIndex: 'position',
      key: 'position',
      render: (text) => text,
      sorter: (a, b) => a.position - b.position,
    },
  ];
  
  return (
    <div className="dashboard-container">
      <PageHeader title="OZON销售数据看板" />
      
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
                title="总曝光量"
                value={metrics.totalImpressions}
                formatter={formatNumber}
                icon="eye"
                color="#1890ff"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="总点击量"
                value={metrics.totalClicks}
                formatter={formatNumber}
                icon="mouse-pointer"
                color="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="点击率"
                value={metrics.ctr}
                formatter={formatPercent}
                icon="percentage"
                color="#faad14"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="平均位置"
                value={metrics.avgPosition.toFixed(1)}
                formatter={(val) => val}
                icon="arrow-up"
                color="#f5222d"
              />
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} className="metrics-row">
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="总加购量"
                value={metrics.totalAddToCart}
                formatter={formatNumber}
                icon="shopping-cart"
                color="#722ed1"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="加购率"
                value={metrics.cartRate}
                formatter={formatPercent}
                icon="percentage"
                color="#13c2c2"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="总下单量"
                value={metrics.totalOrders}
                formatter={formatNumber}
                icon="shopping"
                color="#eb2f96"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="下单率"
                value={metrics.orderRate}
                formatter={formatPercent}
                icon="percentage"
                color="#fa8c16"
              />
            </Col>
          </Row>
          
          {/* 趋势图表 */}
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="点击率趋势" className="chart-card">
                <TrendChart {...ctrTrendConfig} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="加购率趋势" className="chart-card">
                <TrendChart {...cartRateTrendConfig} />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="销售漏斗" className="chart-card">
                <FunnelChart {...funnelChartConfig} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="周订单趋势" className="chart-card">
                <Column {...weeklyOrdersTrendConfig} />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Card title="周位置趋势" className="chart-card">
                <Line {...weeklyPositionTrendConfig} />
              </Card>
            </Col>
          </Row>
          
          {/* 数据表格 */}
          <Card title="销售数据明细" className="table-card">
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

export default OzonDashboard;