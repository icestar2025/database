import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Spin, Empty, Alert } from 'antd';
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
import { fetchWbData } from '../../store/slices/dataSlice';

// 工具函数
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

const WbDashboard = () => {
  const dispatch = useDispatch();
  
  // 从Redux获取状态
  const { dateRange, selectedSku, timeRange } = useSelector(state => state.filters);
  const { wbData, loading, error } = useSelector(state => state.data);
  
  // 本地状态
  const [salesData, setSalesData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  
  // 初始化加载数据
  useEffect(() => {
    dispatch(fetchWbData({ dateRange, selectedSku, timeRange }));
  }, [dispatch, dateRange, selectedSku, timeRange]);
  
  // 当数据加载完成后更新本地状态
  useEffect(() => {
    if (wbData) {
      setSalesData(wbData.salesData || []);
      setWeeklyData(wbData.weeklyData || []);
    }
  }, [wbData]);
  
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
        totalOrders: 0,
        totalSales: 0,
        totalReturns: 0,
        returnRate: 0,
        avgOrderValue: 0
      };
    }
    
    const totalOrders = salesData.reduce((sum, item) => sum + (item.orders || 0), 0);
    const totalSales = salesData.reduce((sum, item) => sum + (item.sales || 0), 0);
    const totalReturns = salesData.reduce((sum, item) => sum + (item.returns || 0), 0);
    const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    return {
      totalOrders,
      totalSales,
      totalReturns,
      returnRate,
      avgOrderValue
    };
  };
  
  const metrics = calculateMetrics();
  
  // 销售趋势图配置
  const salesTrendConfig = {
    data: salesData,
    xField: 'date',
    yField: 'sales',
    seriesField: 'date',
    color: '#1890ff',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    meta: {
      sales: {
        alias: '销售额',
      },
    },
  };
  
  // 订单趋势图配置
  const ordersTrendConfig = {
    data: salesData,
    xField: 'date',
    yField: 'orders',
    seriesField: 'date',
    color: '#52c41a',
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    meta: {
      orders: {
        alias: '订单量',
      },
    },
  };
  
  // 退货率图表配置
  const returnsChartConfig = {
    data: salesData.map(item => ({
      date: item.date,
      value: item.orders > 0 ? (item.returns / item.orders) * 100 : 0,
      category: '退货率'
    })),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    color: '#f5222d',
    meta: {
      value: {
        alias: '退货率(%)',
        formatter: (v) => `${v.toFixed(2)}%`,
      },
    },
  };
  
  // 周销售趋势图配置
  const weeklyTrendConfig = {
    data: weeklyData,
    xField: 'week_start',
    yField: 'sales',
    seriesField: 'week_start',
    color: '#722ed1',
    meta: {
      week_start: {
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getMonth() + 1}月${date.getDate()}日`;
        },
      },
      sales: {
        alias: '周销售额',
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
  
  // 数据表格列配置
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '订单量',
      dataIndex: 'orders',
      key: 'orders',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      render: (text) => formatCurrency(text),
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: '退货量',
      dataIndex: 'returns',
      key: 'returns',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.returns - b.returns,
    },
    {
      title: '退货率',
      key: 'returnRate',
      render: (_, record) => formatPercent(record.orders > 0 ? (record.returns / record.orders) * 100 : 0),
      sorter: (a, b) => {
        const rateA = a.orders > 0 ? (a.returns / a.orders) : 0;
        const rateB = b.orders > 0 ? (b.returns / b.orders) : 0;
        return rateA - rateB;
      },
    },
  ];
  
  return (
    <div className="dashboard-container">
      <PageHeader title="WB销售数据看板" />
      
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
                title="总销售额"
                value={metrics.totalSales}
                formatter={formatCurrency}
                icon="dollar"
                color="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="总退货量"
                value={metrics.totalReturns}
                formatter={formatNumber}
                icon="rollback"
                color="#faad14"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <KeyMetricCard
                title="退货率"
                value={metrics.returnRate}
                formatter={formatPercent}
                icon="percentage"
                color="#f5222d"
              />
            </Col>
          </Row>
          
          {/* 趋势图表 */}
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="销售额趋势" className="chart-card">
                <TrendChart {...salesTrendConfig} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="订单量趋势" className="chart-card">
                <TrendChart {...ordersTrendConfig} />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} className="charts-row">
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="退货率趋势" className="chart-card">
                <TrendChart {...returnsChartConfig} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card title="周销售趋势" className="chart-card">
                <Column {...weeklyTrendConfig} />
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

export default WbDashboard;