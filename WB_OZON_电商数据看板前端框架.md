# WB和OZON电商数据看板前端框架

## 1. 项目结构

```
src/
├── assets/            # 静态资源
│   ├── images/        # 图片资源
│   └── styles/        # 全局样式
├── components/        # 通用组件
│   ├── common/        # 公共UI组件
│   ├── charts/        # 图表组件
│   └── layout/        # 布局组件
├── hooks/             # 自定义Hooks
├── pages/             # 页面组件
│   ├── Combined/      # 综合页面
│   ├── WB/            # WB页面
│   └── OZON/          # OZON页面
├── services/          # API服务
├── store/             # 状态管理
├── utils/             # 工具函数
├── App.js             # 应用入口
├── index.js           # 渲染入口
└── routes.js          # 路由配置
```

## 2. 技术栈选择

- **框架**：React 18
- **路由**：React Router 6
- **状态管理**：Redux Toolkit
- **UI组件库**：Ant Design 5
- **HTTP客户端**：Axios
- **数据可视化**：ECharts 5 (通过echarts-for-react)
- **表格组件**：Ant Design Table
- **表单处理**：Formik + Yup
- **工具库**：Lodash, Day.js
- **数据库客户端**：Supabase JS Client

## 3. 核心组件设计

### 3.1 布局组件

#### 3.1.1 MainLayout.jsx

```jsx
import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import './MainLayout.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout = ({ children }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      key: '/',
      label: <Link to="/">综合</Link>,
    },
    {
      key: '/wb',
      label: <Link to="/wb">WB</Link>,
    },
    {
      key: '/ozon',
      label: <Link to="/ozon">OZON</Link>,
    },
  ];

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="logo">
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            电商数据看板
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Header>
      <Content className="content">
        <div className="content-wrapper">{children}</div>
      </Content>
      <Footer className="footer">
        电商数据看板 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;
```

#### 3.1.2 MainLayout.css

```css
.layout {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
}

.logo {
  margin-right: 24px;
}

.content {
  padding: 24px;
  background: #f0f2f5;
}

.content-wrapper {
  background: #fff;
  padding: 24px;
  min-height: 280px;
  border-radius: 2px;
}

.footer {
  text-align: center;
}
```

### 3.2 筛选组件

#### 3.2.1 FilterPanel.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Radio, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setFilters } from '../store/slices/filterSlice';
import { getAllProducts } from '../services/productService';
import './FilterPanel.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FilterPanel = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [selectedSkus, setSelectedSkus] = useState([]);
  const [dateRange, setDateRange] = useState('7');
  const [customDateRange, setCustomDateRange] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleSkuChange = (values) => {
    setSelectedSkus(values);
  };
  
  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    setCustomDateRange(null);
  };
  
  const handleCustomDateChange = (dates) => {
    if (dates) {
      setCustomDateRange(dates);
      setDateRange('custom');
    }
  };
  
  const handleApplyFilters = () => {
    let startDate, endDate;
    
    if (dateRange === 'custom' && customDateRange) {
      startDate = customDateRange[0].format('YYYY-MM-DD');
      endDate = customDateRange[1].format('YYYY-MM-DD');
    } else {
      const today = new Date();
      endDate = today.toISOString().split('T')[0];
      
      const start = new Date();
      start.setDate(today.getDate() - parseInt(dateRange) + 1);
      startDate = start.toISOString().split('T')[0];
    }
    
    dispatch(setFilters({
      skus: selectedSkus,
      startDate,
      endDate,
    }));
  };
  
  const handleReset = () => {
    setSelectedSkus([]);
    setDateRange('7');
    setCustomDateRange(null);
    
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    
    const start = new Date();
    start.setDate(today.getDate() - 6);
    const startDate = start.toISOString().split('T')[0];
    
    dispatch(setFilters({
      skus: [],
      startDate,
      endDate,
    }));
  };
  
  return (
    <Card className="filter-panel">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <div className="filter-item">
            <div className="filter-label">SKU:</div>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="选择SKU"
              value={selectedSkus}
              onChange={handleSkuChange}
              optionFilterProp="children"
              showSearch
            >
              {products.map((product) => (
                <Option key={product.SKU} value={product.SKU}>
                  {product.SKU} - {product.Name}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        
        <Col xs={24} sm={24} md={10} lg={10} xl={10}>
          <div className="filter-item">
            <div className="filter-label">时间范围:</div>
            <div>
              <Radio.Group value={dateRange} onChange={handleDateRangeChange}>
                <Radio.Button value="7">最近7天</Radio.Button>
                <Radio.Button value="15">最近15天</Radio.Button>
                <Radio.Button value="30">最近30天</Radio.Button>
                <Radio.Button value="custom">自定义</Radio.Button>
              </Radio.Group>
              
              {dateRange === 'custom' && (
                <RangePicker 
                  className="custom-date-picker"
                  value={customDateRange}
                  onChange={handleCustomDateChange}
                />
              )}
            </div>
          </div>
        </Col>
        
        <Col xs={24} sm={24} md={6} lg={6} xl={6}>
          <div className="filter-actions">
            <Space>
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
              >
                应用筛选
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default FilterPanel;
```

#### 3.2.2 FilterPanel.css

```css
.filter-panel {
  margin-bottom: 24px;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-label {
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
}

.custom-date-picker {
  margin-top: 16px;
  width: 100%;
}

@media (max-width: 768px) {
  .filter-actions {
    justify-content: flex-start;
    margin-top: 16px;
  }
}
```

### 3.3 数据概览组件

#### 3.3.1 MetricCards.jsx

```jsx
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './MetricCards.css';

const MetricCards = ({ metrics }) => {
  const renderMetricCard = (title, value, prevValue, precision = 0, suffix = '') => {
    const percentChange = prevValue ? ((value - prevValue) / prevValue) * 100 : 0;
    const isIncrease = percentChange >= 0;
    
    return (
      <Card className="metric-card">
        <Statistic
          title={title}
          value={value}
          precision={precision}
          suffix={suffix}
          valueStyle={{ color: isIncrease ? '#3f8600' : '#cf1322' }}
          prefix={isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        />
        <div className="percent-change">
          {isIncrease ? '+' : ''}{percentChange.toFixed(2)}% 较上期
        </div>
      </Card>
    );
  };
  
  return (
    <div className="metrics-container">
      <Row gutter={[16, 16]}>
        {metrics.map((metric, index) => (
          <Col xs={24} sm={12} md={12} lg={6} xl={6} key={index}>
            {renderMetricCard(
              metric.title,
              metric.value,
              metric.prevValue,
              metric.precision,
              metric.suffix
            )}
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MetricCards;
```

#### 3.3.2 MetricCards.css

```css
.metrics-container {
  margin-bottom: 24px;
}

.metric-card {
  height: 100%;
}

.percent-change {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 8px;
}
```

### 3.4 图表组件

#### 3.4.1 TrendChart.jsx

```jsx
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Spin } from 'antd';
import './TrendChart.css';

const TrendChart = ({ title, data, loading }) => {
  const [options, setOptions] = useState({});
  
  useEffect(() => {
    if (data && data.xAxis && data.series) {
      const newOptions = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: data.series.map(s => s.name),
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.xAxis
        },
        yAxis: [
          {
            type: 'value',
            name: '数量',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5470C6'
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '比率',
            position: 'right',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#91CC75'
              }
            },
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: data.series.map(s => ({
          name: s.name,
          type: 'line',
          yAxisIndex: s.isRate ? 1 : 0,
          data: s.data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: s.color
          },
          lineStyle: {
            width: 2
          },
          areaStyle: s.showArea ? {
            opacity: 0.1
          } : null
        }))
      };
      
      setOptions(newOptions);
    }
  }, [data, title]);
  
  return (
    <Card className="chart-card">
      {loading ? (
        <div className="chart-loading">
          <Spin size="large" />
        </div>
      ) : (
        <ReactECharts 
          option={options} 
          style={{ height: '400px', width: '100%' }} 
          className="trend-chart"
        />
      )}
    </Card>
  );
};

export default TrendChart;
```

#### 3.4.2 FunnelChart.jsx

```jsx
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Spin } from 'antd';
import './FunnelChart.css';

const FunnelChart = ({ title, data, loading }) => {
  const [options, setOptions] = useState({});
  
  useEffect(() => {
    if (data && data.length > 0) {
      const newOptions = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          data: data.map(item => item.name),
          bottom: 0
        },
        series: [
          {
            name: '转化漏斗',
            type: 'funnel',
            left: '10%',
            top: 60,
            bottom: 60,
            width: '80%',
            min: 0,
            max: Math.max(...data.map(item => item.value)),
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: true,
              position: 'inside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: data
          }
        ]
      };
      
      setOptions(newOptions);
    }
  }, [data, title]);
  
  return (
    <Card className="chart-card">
      {loading ? (
        <div className="chart-loading">
          <Spin size="large" />
        </div>
      ) : (
        <ReactECharts 
          option={options} 
          style={{ height: '400px', width: '100%' }} 
          className="funnel-chart"
        />
      )}
    </Card>
  );
};

export default FunnelChart;
```

#### 3.4.3 共享样式 ChartStyles.css

```css
.chart-card {
  margin-bottom: 24px;
}

.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
```

### 3.5 数据表格组件

#### 3.5.1 DataTable.jsx

```jsx
import React, { useState } from 'react';
import { Table, Card, Button, Tooltip } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { exportToExcel } from '../utils/exportUtils';
import './DataTable.css';

const DataTable = ({ 
  title, 
  data, 
  columns, 
  loading, 
  expandable = null,
  onViewDetails = null 
}) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total, range) => `${range[0]}-${range[1]} 条，共 ${total} 条`
  });
  
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
  };
  
  const handleExport = () => {
    exportToExcel(data, title);
  };
  
  // 添加操作列
  const columnsWithActions = onViewDetails ? [
    ...columns,
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Tooltip title="查看详情">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => onViewDetails(record)}
          />
        </Tooltip>
      ),
    },
  ] : columns;
  
  return (
    <Card 
      title={title}
      extra={
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={handleExport}
        >
          导出数据
        </Button>
      }
      className="data-table-card"
    >
      <Table
        columns={columnsWithActions}
        dataSource={data}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        expandable={expandable}
        scroll={{ x: 'max-content' }}
        className="data-table"
      />
    </Card>
  );
};

export default DataTable;
```

#### 3.5.2 DataTable.css

```css
.data-table-card {
  margin-bottom: 24px;
}

.data-table {
  overflow-x: auto;
}

.ant-table-expanded-row .expanded-row-content {
  padding: 16px;
}
```

## 4. 页面组件设计

### 4.1 综合页面

#### 4.1.1 CombinedPage.jsx

```jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col } from 'antd';
import FilterPanel from '../components/common/FilterPanel';
import MetricCards from '../components/common/MetricCards';
import TrendChart from '../components/charts/TrendChart';
import FunnelChart from '../components/charts/FunnelChart';
import DataTable from '../components/common/DataTable';
import { getCombinedSalesData, getCombinedWeeklySalesData } from '../services/dataService';
import { formatNumber, formatPercent } from '../utils/formatUtils';
import { convertToLineChartData, convertToFunnelData } from '../utils/chartUtils';

const CombinedPage = () => {
  const filters = useSelector(state => state.filters);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取销售数据
        const data = await getCombinedSalesData({
          skus: filters.skus,
          startDate: filters.startDate,
          endDate: filters.endDate,
          groupByDay: true
        });
        setSalesData(data);
        
        // 获取周数据
        const weekly = await getCombinedWeeklySalesData({
          skus: filters.skus,
          endDate: filters.endDate
        });
        setWeeklyData(weekly);
        
        // 计算关键指标
        calculateMetrics(data);
        
        // 生成趋势图数据
        const trend = convertToLineChartData(data, [
          'opencardcount', 'addtocartcount', 'orderscount', 'addtocartpercent', 'conversion_rate'
        ]);
        setTrendData(trend);
        
        // 生成漏斗图数据
        const funnel = convertToFunnelData(data);
        setFunnelData(funnel.wb); // 使用WB漏斗格式（不含曝光）
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  const calculateMetrics = (data) => {
    // 汇总数据
    const summary = data.reduce(
      (acc, item) => {
        acc.clicks += item.opencardcount || 0;
        acc.orders += item.orderscount || 0;
        acc.addToCart += item.addtocartcount || 0;
        return acc;
      },
      { clicks: 0, orders: 0, addToCart: 0 }
    );
    
    // 计算转化率
    const addToCartRate = summary.clicks > 0 ? summary.addToCart / summary.clicks : 0;
    const conversionRate = summary.addToCart > 0 ? summary.orders / summary.addToCart : 0;
    
    // 设置指标数据
    setMetrics([
      {
        title: '点击量',
        value: summary.clicks,
        prevValue: summary.clicks * 0.9, // 模拟上期数据
        precision: 0
      },
      {
        title: '下单量',
        value: summary.orders,
        prevValue: summary.orders * 0.85, // 模拟上期数据
        precision: 0
      },
      {
        title: '加购率',
        value: addToCartRate * 100,
        prevValue: addToCartRate * 100 * 0.95, // 模拟上期数据
        precision: 2,
        suffix: '%'
      },
      {
        title: '下单率',
        value: conversionRate * 100,
        prevValue: conversionRate * 100 * 1.05, // 模拟上期数据
        precision: 2,
        suffix: '%'
      }
    ]);
  };
  
  // 表格列定义
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'SKU',
      key: 'SKU',
      sorter: (a, b) => a.SKU.localeCompare(b.SKU),
      width: 150,
      fixed: 'left'
    },
    {
      title: '产品名称',
      dataIndex: 'Name',
      key: 'Name',
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      width: 200
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      filters: [
        { text: 'WB', value: 'WB' },
        { text: 'OZON', value: 'OZON' },
      ],
      onFilter: (value, record) => record.platform === value,
      width: 100
    },
    {
      title: '点击量',
      dataIndex: 'opencardcount',
      key: 'opencardcount',
      sorter: (a, b) => a.opencardcount - b.opencardcount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '加购量',
      dataIndex: 'addtocartcount',
      key: 'addtocartcount',
      sorter: (a, b) => a.addtocartcount - b.addtocartcount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '下单量',
      dataIndex: 'orderscount',
      key: 'orderscount',
      sorter: (a, b) => a.orderscount - b.orderscount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '加购率',
      dataIndex: 'addtocartpercent',
      key: 'addtocartpercent',
      sorter: (a, b) => a.addtocartpercent - b.addtocartpercent,
      render: value => formatPercent(value),
      width: 120
    },
    {
      title: '下单率',
      dataIndex: 'conversion_rate',
      key: 'conversion_rate',
      sorter: (a, b) => a.conversion_rate - b.conversion_rate,
      render: value => formatPercent(value),
      width: 120
    },
    {
      title: '周下单量',
      dataIndex: 'weekly_orders',
      key: 'weekly_orders',
      sorter: (a, b) => a.weekly_orders - b.weekly_orders,
      render: (_, record) => {
        const weeklyRecord = weeklyData.find(item => item.SKU === record.SKU);
        return formatNumber(weeklyRecord ? weeklyRecord.weekly_orders : 0);
      },
      width: 120
    }
  ];
  
  // 合并销售数据和周数据
  const tableData = salesData.map(item => {
    const weeklyRecord = weeklyData.find(w => w.SKU === item.SKU);
    return {
      ...item,
      id: `${item.SKU}_${item.platform}_${item.Day}`,
      weekly_orders: weeklyRecord ? weeklyRecord.weekly_orders : 0
    };
  });
  
  return (
    <div className="combined-page">
      <FilterPanel />
      
      <MetricCards metrics={metrics} />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <TrendChart 
            title="销售趋势" 
            data={trendData} 
            loading={loading} 
          />
        </Col>
        <Col xs={24} lg={8}>
          <FunnelChart 
            title="转化漏斗" 
            data={funnelData} 
            loading={loading} 
          />
        </Col>
      </Row>
      
      <DataTable 
        title="综合销售数据" 
        data={tableData} 
        columns={columns} 
        loading={loading} 
      />
    </div>
  );
};

export default CombinedPage;
```

### 4.2 WB页面

#### 4.2.1 WbPage.jsx

```jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col } from 'antd';
import FilterPanel from '../components/common/FilterPanel';
import MetricCards from '../components/common/MetricCards';
import TrendChart from '../components/charts/TrendChart';
import FunnelChart from '../components/charts/FunnelChart';
import DataTable from '../components/common/DataTable';
import { getWbSalesData, getWbWeeklySalesData } from '../services/dataService';
import { formatNumber, formatPercent } from '../utils/formatUtils';
import { convertToLineChartData, convertToFunnelData } from '../utils/chartUtils';

const WbPage = () => {
  const filters = useSelector(state => state.filters);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取销售数据
        const data = await getWbSalesData({
          skus: filters.skus,
          startDate: filters.startDate,
          endDate: filters.endDate,
          groupByDay: true
        });
        setSalesData(data);
        
        // 获取周数据
        const weekly = await getWbWeeklySalesData({
          skus: filters.skus,
          endDate: filters.endDate
        });
        setWeeklyData(weekly);
        
        // 计算关键指标
        calculateMetrics(data);
        
        // 生成趋势图数据
        const trend = convertToLineChartData(data, [
          'opencardcount', 'addtocartcount', 'orderscount', 'addtocartpercent', 'conversion_rate'
        ]);
        setTrendData(trend);
        
        // 生成漏斗图数据
        const funnel = convertToFunnelData(data);
        setFunnelData(funnel.wb);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  const calculateMetrics = (data) => {
    // 汇总数据
    const summary = data.reduce(
      (acc, item) => {
        acc.clicks += item.opencardcount || 0;
        acc.orders += item.orderscount || 0;
        acc.addToCart += item.addtocartcount || 0;
        return acc;
      },
      { clicks: 0, orders: 0, addToCart: 0 }
    );
    
    // 计算转化率
    const addToCartRate = summary.clicks > 0 ? summary.addToCart / summary.clicks : 0;
    const conversionRate = summary.addToCart > 0 ? summary.orders / summary.addToCart : 0;
    
    // 设置指标数据
    setMetrics([
      {
        title: '点击量',
        value: summary.clicks,
        prevValue: summary.clicks * 0.9, // 模拟上期数据
        precision: 0
      },
      {
        title: '下单量',
        value: summary.orders,
        prevValue: summary.orders * 0.85, // 模拟上期数据
        precision: 0
      },
      {
        title: '加购率',
        value: addToCartRate * 100,
        prevValue: addToCartRate * 100 * 0.95, // 模拟上期数据
        precision: 2,
        suffix: '%'
      },
      {
        title: '下单率',
        value: conversionRate * 100,
        prevValue: conversionRate * 100 * 1.05, // 模拟上期数据
        precision: 2,
        suffix: '%'
      }
    ]);
  };
  
  // 表格列定义
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'SKU',
      key: 'SKU',
      sorter: (a, b) => a.SKU.localeCompare(b.SKU),
      width: 150,
      fixed: 'left'
    },
    {
      title: '产品名称',
      dataIndex: 'Name',
      key: 'Name',
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      width: 200
    },
    {
      title: '点击量',
      dataIndex: 'opencardcount',
      key: 'opencardcount',
      sorter: (a, b) => a.opencardcount - b.opencardcount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '加购量',
      dataIndex: 'addtocartcount',
      key: 'addtocartcount',
      sorter: (a, b) => a.addtocartcount - b.addtocartcount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '下单量',
      dataIndex: 'orderscount',
      key: 'orderscount',
      sorter: (a, b) => a.orderscount - b.orderscount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '加购率',
      dataIndex: 'addtocartpercent',
      key: 'addtocartpercent',
      sorter: (a, b) => a.addtocartpercent - b.addtocartpercent,
      render: value => formatPercent(value),
      width: 120
    },
    {
      title: '下单率',
      dataIndex: 'conversion_rate',
      key: 'conversion_rate',
      sorter: (a, b) => a.conversion_rate - b.conversion_rate,
      render: value => formatPercent(value),
      width: 120
    },
    {
      title: '周下单量',
      dataIndex: 'weekly_orders',
      key: 'weekly_orders',
      sorter: (a, b) => a.weekly_orders - b.weekly_orders,
      render: (_, record) => {
        const weeklyRecord = weeklyData.find(item => item.SKU === record.SKU);
        return formatNumber(weeklyRecord ? weeklyRecord.weekly_orders : 0);
      },
      width: 120
    },
    {
      title: '位置',
      dataIndex: 'Position',
      key: 'Position',
      sorter: (a, b) => a.Position - b.Position,
      render: value => value ? formatNumber(value) : '-',
      width: 100
    }
  ];
  
  // 合并销售数据和周数据
  const tableData = salesData.map(item => {
    const weeklyRecord = weeklyData.find(w => w.SKU === item.SKU);
    return {
      ...item,
      id: `${item.SKU}_${item.Day}`,
      weekly_orders: weeklyRecord ? weeklyRecord.weekly_orders : 0
    };
  });
  
  return (
    <div className="wb-page">
      <FilterPanel />
      
      <MetricCards metrics={metrics} />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <TrendChart 
            title="WB销售趋势" 
            data={trendData} 
            loading={loading} 
          />
        </Col>
        <Col xs={24} lg={8}>
          <FunnelChart 
            title="WB转化漏斗" 
            data={funnelData} 
            loading={loading} 
          />
        </Col>
      </Row>
      
      <DataTable 
        title="WB销售数据" 
        data={tableData} 
        columns={columns} 
        loading={loading} 
      />
    </div>
  );
};

export default WbPage;
```

### 4.3 OZON页面

#### 4.3.1 OzonPage.jsx

```jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col } from 'antd';
import FilterPanel from '../components/common/FilterPanel';
import MetricCards from '../components/common/MetricCards';
import TrendChart from '../components/charts/TrendChart';
import FunnelChart from '../components/charts/FunnelChart';
import DataTable from '../components/common/DataTable';
import { getOzonSalesData, getOzonWeeklySalesData } from '../services/dataService';
import { formatNumber, formatPercent } from '../utils/formatUtils';
import { convertToLineChartData, convertToFunnelData } from '../utils/chartUtils';

const OzonPage = () => {
  const filters = useSelector(state => state.filters);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取销售数据
        const data = await getOzonSalesData({
          skus: filters.skus,
          startDate: filters.startDate,
          endDate: filters.endDate,
          groupByDay: true
        });
        setSalesData(data);
        
        // 获取周数据
        const weekly = await getOzonWeeklySalesData({
          skus: filters.skus,
          endDate: filters.endDate
        });
        setWeeklyData(weekly);
        
        // 计算关键指标
        calculateMetrics(data);
        
        // 生成趋势图数据
        const trend = convertToLineChartData(data, [
          'showcount', 'opencardcount', 'addtocartcount', 'orderscount', 'ctr', 'addtocartpercent', 'conversion_rate'
        ]);
        setTrendData(trend);
        
        // 生成漏斗图数据
        const funnel = convertToFunnelData(data);
        setFunnelData(funnel.ozon);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);
  
  const calculateMetrics = (data) => {
    // 汇总数据
    const summary = data.reduce(
      (acc, item) => {
        acc.impressions += item.showcount || 0;
        acc.clicks += item.opencardcount || 0;
        acc.orders += item.orderscount || 0;
        acc.addToCart += item.addtocartcount || 0;
        acc.positions.push(item.Position || 0);
        return acc;
      },
      { impressions: 0, clicks: 0, orders: 0, addToCart: 0, positions: [] }
    );
    
    // 计算转化率
    const ctr = summary.impressions > 0 ? summary.clicks / summary.impressions : 0;
    const addToCartRate = summary.clicks > 0 ? summary.addToCart / summary.clicks : 0;
    const conversionRate = summary.addToCart > 0 ? summary.orders / summary.addToCart : 0;
    
    // 计算平均位置
    const validPositions = summary.positions.filter(p => p > 0);
    const avgPosition = validPositions.length > 0 
      ? validPositions.reduce((sum, pos) => sum + pos, 0) / validPositions.length 
      : 0;
    
    // 设置指标数据
    setMetrics([
      {
        title: '曝光量',
        value: summary.impressions,
        prevValue: summary.impressions * 0.9, // 模拟上期数据
        precision: 0
      },
      {
        title: '下单量',
        value: summary.orders,
        prevValue: summary.orders * 0.85, // 模拟上期数据
        precision: 0
      },
      {
        title: '点击率',
        value: ctr * 100,
        prevValue: ctr * 100 * 0.95, // 模拟上期数据
        precision: 2,
        suffix: '%'
      },
      {
        title: '加购率',
        value: addToCartRate * 100,
        prevValue: addToCartRate * 100 * 0.95, // 模拟上期数据
        precision: 2,
        suffix: '%'
      },
      {
        title: '下单率',
        value: conversionRate * 100,
        prevValue: conversionRate * 100 * 1.05, // 模拟上期数据
        precision: 2,
        suffix: '%'
      },
      {
        title: '平均位置',
        value: avgPosition,
        prevValue: avgPosition * 1.1, // 模拟上期数据（位置数值越小越好）
        precision: 1
      }
    ]);
  };
  
  // 表格列定义
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'SKU',
      key: 'SKU',
      sorter: (a, b) => a.SKU.localeCompare(b.SKU),
      width: 150,
      fixed: 'left'
    },
    {
      title: '产品名称',
      dataIndex: 'Name',
      key: 'Name',
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      width: 200
    },
    {
      title: '曝光量',
      dataIndex: 'showcount',
      key: 'showcount',
      sorter: (a, b) => a.showcount - b.showcount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '点击量',
      dataIndex: 'opencardcount',
      key: 'opencardcount',
      sorter: (a, b) => a.opencardcount - b.opencardcount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '加购量',
      dataIndex: 'addtocartcount',
      key: 'addtocartcount',
      sorter: (a, b) => a.addtocartcount - b.addtocartcount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '下单量',
      dataIndex: 'orderscount',
      key: 'orderscount',
      sorter: (a, b) => a.orderscount - b.orderscount,
      render: value => formatNumber(value),
      width: 120
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr',
      sorter: (a, b) => a.ctr - b.ctr,
      render: value => formatPercent(value),
      width: 120
    },
    {
      title: '加购率',
      dataIndex: 'addtocartpercent',
      key: 'addtocartpercent',
      sorter: (a, b) => a.addtocartpercent - b.addtocartpercent,
      render: value => formatPercent(value),
      width: 120
    },
    {
      title: '下单率',
      dataIndex: 'conversion_rate',
      key: 'conversion_rate',
      sorter: (a, b) => a.conversion_rate - b.conversion_rate,
      render: value => formatPercent(value),
      width: 120
    },
    {
      title: '周下单量',
      dataIndex: 'weekly_orders',
      key: 'weekly_orders',
      sorter: (a, b) => a.weekly_orders - b.weekly_orders,
      render: (_, record) => {
        const weeklyRecord = weeklyData.find(item => item.SKU === record.SKU);
        return formatNumber(weeklyRecord ? weeklyRecord.weekly_orders : 0);
      },
      width: 120
    },
    {
      title: '位置',
      dataIndex: 'Position',
      key: 'Position',
      sorter: (a, b) => a.Position - b.Position,
      render: value => value ? formatNumber(value) : '-',
      width: 100
    }
  ];
  
  // 合并销售数据和周数据
  const tableData = salesData.map(item => {
    const weeklyRecord = weeklyData.find(w => w.SKU === item.SKU);
    return {
      ...item,
      id: `${item.SKU}_${item.Day}`,
      weekly_orders: weeklyRecord ? weeklyRecord.weekly_orders : 0
    };
  });
  
  return (
    <div className="ozon-page">
      <FilterPanel />
      
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <MetricCards metrics={metrics} />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <TrendChart 
            title="OZON销售趋势" 
            data={trendData} 
            loading={loading} 
          />
        </Col>
        <Col xs={24} lg={8}>
          <FunnelChart 
            title="OZON转化漏斗" 
            data={funnelData} 
            loading={loading} 
          />
        </Col>
      </Row>
      
      <DataTable 
        title="OZON销售数据" 
        data={tableData} 
        columns={columns} 
        loading={loading} 
      />
    </div>
  );
};

export default OzonPage;
```

## 5. 状态管理

### 5.1 Redux Store配置

#### 5.1.1 store/index.js

```javascript
import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
  reducer: {
    filters: filterReducer,
  },
});
```

#### 5.1.2 store/slices/filterSlice.js

```javascript
import { createSlice } from '@reduxjs/toolkit';

// 获取当前日期和7天前的日期
const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 6);

const initialState = {
  skus: [],
  startDate: sevenDaysAgo.toISOString().split('T')[0],
  endDate: today.toISOString().split('T')[0],
};

export const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetFilters: () => initialState,
  },
});

export const { setFilters, resetFilters } = filterSlice.actions;

export default filterSlice.reducer;
```

## 6. 路由配置

### 6.1 routes.js

```javascript
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import CombinedPage from './pages/Combined/CombinedPage';
import WbPage from './pages/WB/WbPage';
import OzonPage from './pages/OZON/OzonPage';

const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<CombinedPage />} />
        <Route path="/wb" element={<WbPage />} />
        <Route path="/ozon" element={<OzonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
```

## 7. 应用入口

### 7.1 App.js

```javascript
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { store } from './store';
import AppRoutes from './routes';
import './assets/styles/global.css';

const App = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
```

### 7.2 index.js

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 8. 全局样式

### 8.1 assets/styles/global.css

```css
/* 重置样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* 自定义全局样式 */
.page-container {
  padding: 24px;
}

.section-title {
  margin-bottom: 16px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .page-container {
    padding: 12px;
  }
}
```

## 9. 项目依赖

### 9.1 package.json

```json
{
  "name": "wb-ozon-dashboard",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@ant-design/icons": "^5.0.1",
    "@reduxjs/toolkit": "^1.9.5",
    "@supabase/supabase-js": "^2.21.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "antd": "^5.4.6",
    "axios": "^1.4.0",
    "dayjs": "^1.11.7",
    "echarts": "^5.4.2",
    "echarts-for-react": "^3.0.2",
    "formik": "^2.2.9",
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^8.0.5",
    "react-router-dom": "^6.11.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4",
    "xlsx": "^0.18.5",
    "yup": "^1.1.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

## 10. 服务层设计

### 10.1 Supabase 配置

#### 10.1.1 services/supabaseClient.js

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing in environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

### 10.2 数据服务

#### 10.2.1 services/dataService.js

```javascript
import supabase from './supabaseClient';
import { calculateWeeklyOrders, calculateConversionRate, calculateCTR } from '../utils/calculationUtils';

// 获取所有产品列表
export const getAllProducts = async () => {
  try {
    // 获取WB产品
    const { data: wbData, error: wbError } = await supabase
      .from('wb_product_sales')
      .select('SKU, Name')
      .order('SKU')
      .limit(1000);
    
    if (wbError) throw wbError;
    
    // 获取OZON产品
    const { data: ozonData, error: ozonError } = await supabase
      .from('ozon_product_sales')
      .select('SKU, Name')
      .order('SKU')
      .limit(1000);
    
    if (ozonError) throw ozonError;
    
    // 合并并去重
    const allProducts = [...wbData, ...ozonData];
    const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.SKU, item])).values());
    
    return uniqueProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// 获取WB销售数据
export const getWbSalesData = async ({ skus = [], startDate, endDate, groupByDay = false }) => {
  try {
    let query = supabase
      .from('wb_product_sales')
      .select('*')
      .gte('Day', startDate)
      .lte('Day', endDate);
    
    if (skus.length > 0) {
      query = query.in('SKU', skus);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // 计算额外字段
    const processedData = data.map(item => ({
      ...item,
      conversion_rate: calculateConversionRate(item.addtocartcount, item.orderscount),
      platform: 'WB'
    }));
    
    // 按天分组或按SKU分组
    if (groupByDay) {
      return processedData;
    } else {
      // 按SKU汇总
      const skuMap = new Map();
      
      processedData.forEach(item => {
        const key = item.SKU;
        
        if (!skuMap.has(key)) {
          skuMap.set(key, {
            SKU: item.SKU,
            Name: item.Name,
            platform: 'WB',
            opencardcount: 0,
            addtocartcount: 0,
            orderscount: 0,
            orderssumrub: 0,
            cancelcount: 0,
            returnedcount: 0,
            Position: 0,
            positionCount: 0
          });
        }
        
        const summary = skuMap.get(key);
        summary.opencardcount += item.opencardcount || 0;
        summary.addtocartcount += item.addtocartcount || 0;
        summary.orderscount += item.orderscount || 0;
        summary.orderssumrub += item.orderssumrub || 0;
        summary.cancelcount += item.cancelcount || 0;
        summary.returnedcount += item.returnedcount || 0;
        
        // 计算平均位置
        if (item.Position) {
          summary.Position += item.Position;
          summary.positionCount += 1;
        }
      });
      
      // 计算汇总指标
      return Array.from(skuMap.values()).map(item => {
        // 计算平均位置
        if (item.positionCount > 0) {
          item.Position = item.Position / item.positionCount;
        } else {
          item.Position = null;
        }
        
        // 删除辅助字段
        delete item.positionCount;
        
        // 计算转化率
        item.addtocartpercent = calculateConversionRate(item.opencardcount, item.addtocartcount);
        item.conversion_rate = calculateConversionRate(item.addtocartcount, item.orderscount);
        
        return item;
      });
    }
  } catch (error) {
    console.error('Error fetching WB sales data:', error);
    throw error;
  }
};

// 获取OZON销售数据
export const getOzonSalesData = async ({ skus = [], startDate, endDate, groupByDay = false }) => {
  try {
    let query = supabase
      .from('ozon_product_sales')
      .select('*')
      .gte('Day', startDate)
      .lte('Day', endDate);
    
    if (skus.length > 0) {
      query = query.in('SKU', skus);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // 计算额外字段
    const processedData = data.map(item => ({
      ...item,
      ctr: calculateCTR(item.showcount, item.opencardcount),
      conversion_rate: calculateConversionRate(item.addtocartcount, item.orderscount),
      platform: 'OZON'
    }));
    
    // 按天分组或按SKU分组
    if (groupByDay) {
      return processedData;
    } else {
      // 按SKU汇总
      const skuMap = new Map();
      
      processedData.forEach(item => {
        const key = item.SKU;
        
        if (!skuMap.has(key)) {
          skuMap.set(key, {
            SKU: item.SKU,
            Name: item.Name,
            platform: 'OZON',
            showcount: 0,
            opencardcount: 0,
            addtocartcount: 0,
            orderscount: 0,
            orderssumrub: 0,
            cancelcount: 0,
            returnedcount: 0,
            Position: 0,
            positionCount: 0
          });
        }
        
        const summary = skuMap.get(key);
        summary.showcount += item.showcount || 0;
        summary.opencardcount += item.opencardcount || 0;
        summary.addtocartcount += item.addtocartcount || 0;
        summary.orderscount += item.orderscount || 0;
        summary.orderssumrub += item.orderssumrub || 0;
        summary.cancelcount += item.cancelcount || 0;
        summary.returnedcount += item.returnedcount || 0;
        
        // 计算平均位置
        if (item.Position) {
          summary.Position += item.Position;
          summary.positionCount += 1;
        }
      });
      
      // 计算汇总指标
      return Array.from(skuMap.values()).map(item => {
        // 计算平均位置
        if (item.positionCount > 0) {
          item.Position = item.Position / item.positionCount;
        } else {
          item.Position = null;
        }
        
        // 删除辅助字段
        delete item.positionCount;
        
        // 计算转化率
        item.ctr = calculateCTR(item.showcount, item.opencardcount);
        item.addtocartpercent = calculateConversionRate(item.opencardcount, item.addtocartcount);
        item.conversion_rate = calculateConversionRate(item.addtocartcount, item.orderscount);
        
        return item;
      });
    }
  } catch (error) {
    console.error('Error fetching OZON sales data:', error);
    throw error;
  }
};

// 获取综合销售数据
export const getCombinedSalesData = async ({ skus = [], startDate, endDate, groupByDay = false }) => {
  try {
    // 获取WB和OZON数据
    const wbData = await getWbSalesData({ skus, startDate, endDate, groupByDay });
    const ozonData = await getOzonSalesData({ skus, startDate, endDate, groupByDay });
    
    // 合并数据
    return [...wbData, ...ozonData];
  } catch (error) {
    console.error('Error fetching combined sales data:', error);
    throw error;
  }
};

// 获取WB周销售数据
export const getWbWeeklySalesData = async ({ skus = [], endDate }) => {
  try {
    // 计算开始日期（结束日期前7天）
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(end.getDate() - 6); // 7天数据（包含结束日期）
    const startDate = start.toISOString().split('T')[0];
    
    // 获取数据
    let query = supabase
      .from('wb_product_sales')
      .select('*')
      .gte('Day', startDate)
      .lte('Day', endDate);
    
    if (skus.length > 0) {
      query = query.in('SKU', skus);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // 按SKU计算周订单量
    const weeklyData = calculateWeeklyOrders(data);
    
    return weeklyData;
  } catch (error) {
    console.error('Error fetching WB weekly sales data:', error);
    throw error;
  }
};

// 获取OZON周销售数据
export const getOzonWeeklySalesData = async ({ skus = [], endDate }) => {
  try {
    // 计算开始日期（结束日期前7天）
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(end.getDate() - 6); // 7天数据（包含结束日期）
    const startDate = start.toISOString().split('T')[0];
    
    // 获取数据
    let query = supabase
      .from('ozon_product_sales')
      .select('*')
      .gte('Day', startDate)
      .lte('Day', endDate);
    
    if (skus.length > 0) {
      query = query.in('SKU', skus);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // 按SKU计算周订单量
    const weeklyData = calculateWeeklyOrders(data);
    
    return weeklyData;
  } catch (error) {
    console.error('Error fetching OZON weekly sales data:', error);
    throw error;
  }
};

// 获取综合周销售数据
export const getCombinedWeeklySalesData = async ({ skus = [], endDate }) => {
  try {
    // 获取WB和OZON数据
    const wbData = await getWbWeeklySalesData({ skus, endDate });
    const ozonData = await getOzonWeeklySalesData({ skus, endDate });
    
    // 合并数据
    return [...wbData, ...ozonData];
  } catch (error) {
    console.error('Error fetching combined weekly sales data:', error);
    throw error;
  }
};
```

## 11. 工具函数

### 11.1 计算工具

#### 11.1.1 utils/calculationUtils.js

```javascript
// 计算点击率 (CTR)
export const calculateCTR = (impressions, clicks) => {
  if (!impressions || impressions === 0) return 0;
  return clicks / impressions;
};

// 计算转化率
export const calculateConversionRate = (base, converted) => {
  if (!base || base === 0) return 0;
  return converted / base;
};

// 计算周订单量
export const calculateWeeklyOrders = (data) => {
  // 按SKU分组
  const skuMap = new Map();
  
  data.forEach(item => {
    const key = item.SKU;
    
    if (!skuMap.has(key)) {
      skuMap.set(key, {
        SKU: item.SKU,
        Name: item.Name,
        platform: item.platform || (item.showcount !== undefined ? 'OZON' : 'WB'),
        weekly_orders: 0
      });
    }
    
    const summary = skuMap.get(key);
    summary.weekly_orders += item.orderscount || 0;
  });
  
  return Array.from(skuMap.values());
};
```

### 11.2 格式化工具

#### 11.2.1 utils/formatUtils.js

```javascript
import dayjs from 'dayjs';

// 格式化数字
export const formatNumber = (value, precision = 0) => {
  if (value === undefined || value === null) return '-';
  return Number(value).toLocaleString('ru-RU', { maximumFractionDigits: precision });
};

// 格式化百分比
export const formatPercent = (value, precision = 2) => {
  if (value === undefined || value === null) return '-';
  return `${(value * 100).toFixed(precision)}%`;
};

// 格式化货币
export const formatCurrency = (value, currency = 'RUB', precision = 0) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: precision
  }).format(value);
};

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};
```

### 11.3 图表工具

#### 11.3.1 utils/chartUtils.js

```javascript
// 转换为折线图数据
export const convertToLineChartData = (data, fields) => {
  if (!data || data.length === 0) return null;
  
  // 按日期分组
  const dateMap = new Map();
  data.forEach(item => {
    const date = item.Day;
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date,
        ...fields.reduce((acc, field) => {
          acc[field] = 0;
          return acc;
        }, {})
      });
    }
    
    const dateData = dateMap.get(date);
    fields.forEach(field => {
      if (item[field] !== undefined) {
        dateData[field] += item[field] || 0;
      }
    });
  });
  
  // 排序日期
  const sortedDates = Array.from(dateMap.values()).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  
  // 构建图表数据
  const xAxis = sortedDates.map(item => item.date);
  
  // 定义系列颜色和名称映射
  const seriesConfig = {
    showcount: { name: '曝光量', color: '#5470C6', isRate: false },
    opencardcount: { name: '点击量', color: '#91CC75', isRate: false },
    addtocartcount: { name: '加购量', color: '#FAC858', isRate: false },
    orderscount: { name: '下单量', color: '#EE6666', isRate: false },
    ctr: { name: '点击率', color: '#73C0DE', isRate: true },
    addtocartpercent: { name: '加购率', color: '#3BA272', isRate: true },
    conversion_rate: { name: '下单率', color: '#FC8452', isRate: true }
  };
  
  // 构建系列数据
  const series = fields.map(field => {
    const config = seriesConfig[field] || { name: field, color: '#999', isRate: field.includes('rate') || field.includes('percent') };
    
    return {
      name: config.name,
      data: sortedDates.map(item => {
        // 如果是比率字段，转换为百分比
        return config.isRate ? (item[field] * 100) : item[field];
      }),
      color: config.color,
      isRate: config.isRate,
      showArea: ['showcount', 'opencardcount', 'addtocartcount', 'orderscount'].includes(field)
    };
  });
  
  return { xAxis, series };
};

// 转换为漏斗图数据
export const convertToFunnelData = (data) => {
  if (!data || data.length === 0) return { wb: [], ozon: [] };
  
  // 汇总数据
  const summary = data.reduce(
    (acc, item) => {
      const platform = item.platform || (item.showcount !== undefined ? 'OZON' : 'WB');
      
      if (platform === 'OZON') {
        acc.ozon.impressions += item.showcount || 0;
        acc.ozon.clicks += item.opencardcount || 0;
        acc.ozon.addToCart += item.addtocartcount || 0;
        acc.ozon.orders += item.orderscount || 0;
      } else {
        acc.wb.clicks += item.opencardcount || 0;
        acc.wb.addToCart += item.addtocartcount || 0;
        acc.wb.orders += item.orderscount || 0;
      }
      
      return acc;
    },
    { 
      ozon: { impressions: 0, clicks: 0, addToCart: 0, orders: 0 },
      wb: { clicks: 0, addToCart: 0, orders: 0 }
    }
  );
  
  // 构建漏斗数据
  const ozonFunnel = [
    { value: summary.ozon.impressions, name: '曝光量' },
    { value: summary.ozon.clicks, name: '点击量' },
    { value: summary.ozon.addToCart, name: '加购量' },
    { value: summary.ozon.orders, name: '下单量' }
  ];
  
  const wbFunnel = [
    { value: summary.wb.clicks, name: '点击量' },
    { value: summary.wb.addToCart, name: '加购量' },
    { value: summary.wb.orders, name: '下单量' }
  ];
  
  return { ozon: ozonFunnel, wb: wbFunnel };
};
```

### 11.4 导出工具

#### 11.4.1 utils/exportUtils.js

```javascript
import * as XLSX from 'xlsx';
import { formatDate } from './formatUtils';

// 导出到Excel
export const exportToExcel = (data, sheetName = 'Data') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  try {
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 处理日期字段
    const processedData = data.map(item => {
      const newItem = { ...item };
      
      // 格式化日期字段
      if (newItem.Day) {
        newItem.Day = formatDate(newItem.Day);
      }
      
      return newItem;
    });
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(processedData);
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // 生成文件名
    const fileName = `${sheetName}_${formatDate(new Date(), 'YYYY-MM-DD_HH-mm')}.xlsx`;
    
    // 导出文件
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
  }
};
```

## 12. 环境配置

### 12.1 .env 文件

```
REACT_APP_SUPABASE_URL=https://your-supabase-project-url.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

### 12.2 .env.example 文件

```
REACT_APP_SUPABASE_URL=https://your-supabase-project-url.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

## 13. README 文件

### 13.1 README.md

```markdown
# WB和OZON电商数据看板

## 项目概述

这是一个用于展示WB和OZON电商平台销售数据的可视化看板。该看板提供了产品销售漏斗数据的全面视图，包括曝光、点击、加购、下单等关键指标，以及相应的转化率分析。

## 功能特点

- **三个主要页面**：综合、WB和OZON平台数据分析
- **数据筛选**：按SKU、时间范围进行筛选
- **关键指标展示**：曝光量、点击量、加购量、下单量及相应转化率
- **数据可视化**：趋势图表、转化漏斗图
- **详细数据表格**：支持排序、筛选和导出
- **周下单数据**：展示最近7天的订单汇总

## 技术栈

- **前端框架**：React 18
- **路由**：React Router 6
- **状态管理**：Redux Toolkit
- **UI组件库**：Ant Design 5
- **HTTP客户端**：Axios
- **数据可视化**：ECharts 5
- **数据库**：Supabase

## 安装与设置

### 前提条件

- Node.js 16.x 或更高版本
- npm 8.x 或更高版本
- Supabase 账户和项目

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/your-username/wb-ozon-dashboard.git
cd wb-ozon-dashboard
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`，然后填入你的 Supabase 项目信息：

```
REACT_APP_SUPABASE_URL=https://your-supabase-project-url.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

4. 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

## 数据库设置

该项目依赖于 Supabase 数据库中的两个表：

1. **wb_product_sales** - WB平台销售数据
2. **ozon_product_sales** - OZON平台销售数据

每个表应包含以下字段：

- SKU (text)
- Name (text)
- Day (date)
- orderscount (numeric)
- opencardcount (numeric)
- addtocartcount (numeric)
- addtocartpercent (numeric)
- orderssumrub (numeric)
- cancelcount (numeric)
- returnedcount (numeric)
- Position (numeric)

OZON表还应包含：
- showcount (numeric) - 曝光量

## 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `build` 目录中，可以部署到任何静态网站托管服务。

## 许可证

[MIT](LICENSE)
```
```