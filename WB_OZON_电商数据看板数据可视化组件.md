# WB和OZON电商数据看板数据可视化组件设计

## 1. 概述

本文档详细描述了WB和OZON电商数据看板中各数据可视化组件的设计和实现方案。这些组件将用于展示产品销售漏斗数据、转化率、趋势分析等关键指标，为用户提供直观、高效的数据分析体验。

## 2. 技术选型

### 2.1 核心图表库

- **ECharts 5**：功能强大、性能优异的开源可视化图表库
- **@ant-design/charts**：基于G2的React图表库，与Ant Design风格一致

### 2.2 辅助库

- **react-responsive**：用于响应式设计
- **lodash**：用于数据处理和转换
- **dayjs**：用于日期处理

## 3. 核心可视化组件

### 3.1 关键指标卡片组件 (KeyMetricCard)

用于展示单个关键指标及其变化趋势。

```jsx
import React from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatNumber, formatPercent } from '../utils/formatters';

const KeyMetricCard = ({ 
  title, 
  value, 
  previousValue, 
  format = 'number', 
  tooltip, 
  icon,
  color,
  loading = false
}) => {
  // 计算环比变化
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return 0;
    return ((value - previousValue) / previousValue) * 100;
  };
  
  const change = calculateChange();
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  // 根据format类型格式化数值
  const formatValue = (val) => {
    if (format === 'percent') return formatPercent(val);
    return formatNumber(val);
  };

  return (
    <Card loading={loading} className="key-metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoCircleOutlined className="info-icon" />
          </Tooltip>
        )}
      </div>
      <Statistic
        value={value}
        valueStyle={{ color: color || '#000000' }}
        formatter={(val) => formatValue(val)}
        prefix={icon}
        suffix={
          previousValue !== undefined && (
            <div className="change-indicator">
              {isPositive && <ArrowUpOutlined style={{ color: '#52c41a' }} />}
              {isNegative && <ArrowDownOutlined style={{ color: '#f5222d' }} />}
              <span style={{ color: isPositive ? '#52c41a' : isNegative ? '#f5222d' : '#000000' }}>
                {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          )
        }
      />
    </Card>
  );
};

export default KeyMetricCard;
```

### 3.2 趋势图组件 (TrendChart)

用于展示指标随时间的变化趋势。

```jsx
import React, { useEffect, useState } from 'react';
import { Card, Spin, Empty, Radio } from 'antd';
import ReactECharts from 'echarts-for-react';
import { formatDate } from '../utils/formatters';

const TrendChart = ({ 
  title, 
  data, 
  xField = 'Day', 
  yFields = ['value'], 
  yFieldLabels = ['值'], 
  loading = false,
  colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
  height = '300px'
}) => {
  const [chartType, setChartType] = useState('line');
  
  // 处理图表配置
  const getOption = () => {
    if (!data || data.length === 0) return {};
    
    // 提取X轴数据
    const xAxisData = data.map(item => formatDate(item[xField]));
    
    // 构建系列数据
    const series = yFields.map((field, index) => {
      return {
        name: yFieldLabels[index] || field,
        type: chartType,
        data: data.map(item => item[field]),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: colors[index % colors.length]
        },
        lineStyle: {
          width: 2,
          color: colors[index % colors.length]
        },
        areaStyle: chartType === 'line' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: colors[index % colors.length] + 'AA' // 透明度
            }, {
              offset: 1,
              color: colors[index % colors.length] + '11'
            }]
          }
        } : undefined
      };
    });
    
    return {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          let result = formatDate(params[0].axisValue, 'YYYY-MM-DD') + '<br/>';
          params.forEach(param => {
            const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
            result += marker + param.seriesName + ': ' + param.value + '<br/>';
          });
          return result;
        }
      },
      legend: {
        data: yFieldLabels,
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '60px',
        top: '30px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#E0E0E0'
          }
        },
        axisLabel: {
          formatter: value => formatDate(value, 'MM-DD')
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#E0E0E0',
            type: 'dashed'
          }
        }
      },
      series: series
    };
  };

  return (
    <Card 
      title={title}
      extra={
        <Radio.Group 
          value={chartType} 
          onChange={e => setChartType(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="line">折线图</Radio.Button>
          <Radio.Button value="bar">柱状图</Radio.Button>
        </Radio.Group>
      }
      className="trend-chart-card"
    >
      {loading ? (
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      ) : data && data.length > 0 ? (
        <ReactECharts 
          option={getOption()} 
          style={{ height }} 
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <Empty style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
      )}
    </Card>
  );
};

export default TrendChart;
```

### 3.3 漏斗图组件 (FunnelChart)

用于展示销售漏斗转化过程。

```jsx
import React from 'react';
import { Card, Spin, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import { formatNumber, formatPercent } from '../utils/formatters';

const FunnelChart = ({ 
  title, 
  data, 
  nameField = 'name', 
  valueField = 'value',
  loading = false,
  height = '400px',
  colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
}) => {
  // 处理图表配置
  const getOption = () => {
    if (!data || data.length === 0) return {};
    
    // 计算转化率
    const processedData = [...data];
    for (let i = 1; i < processedData.length; i++) {
      const conversionRate = processedData[i-1][valueField] > 0 
        ? processedData[i][valueField] / processedData[i-1][valueField] 
        : 0;
      processedData[i].conversionRate = conversionRate;
    }
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const item = params.data;
          let result = `${item[nameField]}: ${formatNumber(item[valueField])}`;
          if (item.conversionRate !== undefined) {
            result += `<br/>转化率: ${formatPercent(item.conversionRate)}`;
          }
          return result;
        }
      },
      color: colors,
      series: [
        {
          name: title,
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: Math.max(...processedData.map(item => item[valueField])),
          minSize: '0%',
          maxSize: '100%',
          sort: 'none',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: function(params) {
              const item = params.data;
              let text = `${item[nameField]}: ${formatNumber(item[valueField])}`;
              if (item.conversionRate !== undefined) {
                text += `\n转化率: ${formatPercent(item.conversionRate)}`;
              }
              return text;
            },
            fontSize: 12
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
              fontSize: 14
            }
          },
          data: processedData.map(item => ({
            value: item[valueField],
            name: item[nameField],
            conversionRate: item.conversionRate
          }))
        }
      ]
    };
  };

  return (
    <Card title={title} className="funnel-chart-card">
      {loading ? (
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      ) : data && data.length > 0 ? (
        <ReactECharts 
          option={getOption()} 
          style={{ height }} 
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <Empty style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
      )}
    </Card>
  );
};

export default FunnelChart;
```

### 3.4 数据表格组件 (DataTable)

用于展示详细的数据记录。

```jsx
import React, { useState } from 'react';
import { Table, Card, Button, Tooltip, Input, Space } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { exportToExcel } from '../utils/exportUtils';

const DataTable = ({ 
  title, 
  data, 
  columns, 
  loading = false,
  pagination = { pageSize: 10 },
  scroll = { x: 'max-content' },
  exportFileName = 'data_export'
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  
  // 处理搜索功能
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  // 为列添加搜索功能
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`搜索 ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            重置
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    render: text => 
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069', padding: 0 }}>{text}</span>
      ) : (
        text
      ),
  });

  // 为可搜索的列添加搜索功能
  const enhancedColumns = columns.map(col => {
    if (col.searchable) {
      return {
        ...col,
        ...getColumnSearchProps(col.dataIndex)
      };
    }
    return col;
  });

  // 处理导出功能
  const handleExport = () => {
    exportToExcel(data, exportFileName);
  };

  return (
    <Card 
      title={title}
      extra={
        <Tooltip title="导出数据">
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={!data || data.length === 0}
          >
            导出
          </Button>
        </Tooltip>
      }
      className="data-table-card"
    >
      <Table
        columns={enhancedColumns}
        dataSource={data}
        rowKey={(record, index) => record.id || index}
        loading={loading}
        pagination={pagination}
        scroll={scroll}
        size="middle"
        bordered
      />
    </Card>
  );
};

export default DataTable;
```

### 3.5 多维度对比图组件 (ComparisonChart)

用于对比不同维度的数据。

```jsx
import React, { useState } from 'react';
import { Card, Radio, Spin, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import { formatNumber } from '../utils/formatters';

const ComparisonChart = ({ 
  title, 
  data, 
  dimensionField = 'dimension',
  metricFields = ['value'],
  metricLabels = ['值'],
  loading = false,
  height = '400px',
  colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
}) => {
  const [chartType, setChartType] = useState('bar');
  
  // 处理图表配置
  const getOption = () => {
    if (!data || data.length === 0) return {};
    
    // 提取维度数据
    const dimensions = data.map(item => item[dimensionField]);
    
    // 构建系列数据
    const series = metricFields.map((field, index) => {
      return {
        name: metricLabels[index] || field,
        type: chartType,
        data: data.map(item => item[field]),
        itemStyle: {
          color: colors[index % colors.length]
        },
        label: {
          show: chartType === 'pie',
          formatter: '{b}: {c} ({d}%)'
        }
      };
    });
    
    // 根据图表类型返回不同配置
    if (chartType === 'pie') {
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: dimensions
        },
        series: [{
          name: metricLabels[0] || metricFields[0],
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map((item, index) => ({
            value: item[metricFields[0]],
            name: item[dimensionField],
            itemStyle: {
              color: colors[index % colors.length]
            }
          }))
        }]
      };
    } else {
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            let result = params[0].name + '<br/>';
            params.forEach(param => {
              const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
              result += marker + param.seriesName + ': ' + formatNumber(param.value) + '<br/>';
            });
            return result;
          }
        },
        legend: {
          data: metricLabels,
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '60px',
          top: '30px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dimensions,
          axisLine: {
            lineStyle: {
              color: '#E0E0E0'
            }
          },
          axisLabel: {
            rotate: dimensions.length > 10 ? 45 : 0,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#E0E0E0',
              type: 'dashed'
            }
          }
        },
        series: series
      };
    }
  };

  return (
    <Card 
      title={title}
      extra={
        <Radio.Group 
          value={chartType} 
          onChange={e => setChartType(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="bar">柱状图</Radio.Button>
          <Radio.Button value="line">折线图</Radio.Button>
          <Radio.Button value="pie">饼图</Radio.Button>
        </Radio.Group>
      }
      className="comparison-chart-card"
    >
      {loading ? (
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      ) : data && data.length > 0 ? (
        <ReactECharts 
          option={getOption()} 
          style={{ height }} 
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <Empty style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
      )}
    </Card>
  );
};

export default ComparisonChart;
```

### 3.6 仪表盘组件 (GaugeChart)

用于展示目标完成情况或关键指标达成率。

```jsx
import React from 'react';
import { Card, Spin, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import { formatPercent } from '../utils/formatters';

const GaugeChart = ({ 
  title, 
  value, 
  target = 100,
  name = '完成率',
  loading = false,
  height = '300px',
  color = ['#91cc75', '#5470c6', '#ee6666']
}) => {
  // 处理图表配置
  const getOption = () => {
    if (value === undefined || value === null) return {};
    
    // 计算完成率
    const rate = target > 0 ? (value / target) * 100 : 0;
    
    return {
      tooltip: {
        formatter: `{a} <br/>{b} : ${formatPercent(rate / 100)}`
      },
      series: [{
        name: title,
        type: 'gauge',
        detail: {
          formatter: formatPercent(rate / 100),
          fontSize: 18,
          offsetCenter: [0, '30%']
        },
        data: [{
          value: rate,
          name: name
        }],
        title: {
          fontSize: 14
        },
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, color[2]],
              [0.7, color[1]],
              [1, color[0]]
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: 'auto',
          distance: 40,
          fontSize: 12
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 18,
          itemStyle: {
            borderWidth: 10
          }
        }
      }]
    };
  };

  return (
    <Card title={title} className="gauge-chart-card">
      {loading ? (
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      ) : value !== undefined && value !== null ? (
        <ReactECharts 
          option={getOption()} 
          style={{ height }} 
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <Empty style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
      )}
    </Card>
  );
};

export default GaugeChart;
```

## 4. 页面级组件

### 4.1 综合页面数据可视化组件

```jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, DatePicker, Select, Spin } from 'antd';
import { 
  KeyMetricCard, 
  TrendChart, 
  FunnelChart, 
  DataTable 
} from '../components';
import { 
  getCombinedSalesData, 
  getCombinedWeeklySalesData 
} from '../services/dataService';
import { formatNumber, formatPercent } from '../utils/formatters';

const { RangePicker } = DatePicker;
const { Option } = Select;

const CombinedDashboard = () => {
  // 状态定义
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedSku, setSelectedSku] = useState('all');
  const [timeRange, setTimeRange] = useState('7');
  const [salesData, setSalesData] = useState([]);
  const [weeklySalesData, setWeeklySalesData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [skuOptions, setSkuOptions] = useState([]);
  
  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取销售数据
        const data = await getCombinedSalesData({
          dateRange,
          sku: selectedSku === 'all' ? null : selectedSku,
          timeRange: parseInt(timeRange)
        });
        
        setSalesData(data.dailyData || []);
        setAggregatedData(data.aggregated || null);
        setSkuOptions(data.skuList || []);
        
        // 获取周销售数据
        const weeklyData = await getCombinedWeeklySalesData({
          dateRange,
          sku: selectedSku === 'all' ? null : selectedSku
        });
        
        setWeeklySalesData(weeklyData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange, selectedSku, timeRange]);
  
  // 准备漏斗图数据
  const getFunnelData = () => {
    if (!aggregatedData) return [];
    
    return [
      { name: '点击', value: aggregatedData.opencardcount },
      { name: '加购', value: aggregatedData.addtocartcount },
      { name: '下单', value: aggregatedData.orderscount }
    ];
  };
  
  // 准备表格列定义
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'SKU',
      key: 'SKU',
      searchable: true,
      sorter: (a, b) => a.SKU.localeCompare(b.SKU)
    },
    {
      title: '产品名称',
      dataIndex: 'Name',
      key: 'Name',
      searchable: true,
      sorter: (a, b) => a.Name.localeCompare(b.Name)
    },
    {
      title: '日期',
      dataIndex: 'Day',
      key: 'Day',
      render: (text) => formatDate(text),
      sorter: (a, b) => new Date(a.Day) - new Date(b.Day)
    },
    {
      title: '点击量',
      dataIndex: 'opencardcount',
      key: 'opencardcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.opencardcount - b.opencardcount
    },
    {
      title: '加购量',
      dataIndex: 'addtocartcount',
      key: 'addtocartcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.addtocartcount - b.addtocartcount
    },
    {
      title: '加购率',
      dataIndex: 'addtocartpercent',
      key: 'addtocartpercent',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.addtocartpercent - b.addtocartpercent
    },
    {
      title: '下单量',
      dataIndex: 'orderscount',
      key: 'orderscount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.orderscount - b.orderscount
    },
    {
      title: '下单率',
      dataIndex: 'orderRate',
      key: 'orderRate',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.orderRate - b.orderRate
    },
    {
      title: '下单金额',
      dataIndex: 'orderssumrub',
      key: 'orderssumrub',
      render: (text) => formatNumber(text, 'currency'),
      sorter: (a, b) => a.orderssumrub - b.orderssumrub
    },
    {
      title: '取消量',
      dataIndex: 'cancelcount',
      key: 'cancelcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.cancelcount - b.cancelcount
    },
    {
      title: '退回量',
      dataIndex: 'returnedcount',
      key: 'returnedcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.returnedcount - b.returnedcount
    }
  ];

  return (
    <div className="combined-dashboard">
      {/* 筛选器 */}
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">日期范围：</span>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={setDateRange} 
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">SKU：</span>
              <Select
                style={{ width: '100%' }}
                value={selectedSku}
                onChange={setSelectedSku}
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">全部</Option>
                {skuOptions.map(sku => (
                  <Option key={sku.SKU} value={sku.SKU}>{sku.SKU} - {sku.Name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">时间范围：</span>
              <Select
                style={{ width: '100%' }}
                value={timeRange}
                onChange={setTimeRange}
              >
                <Option value="7">最近7天</Option>
                <Option value="15">最近15天</Option>
                <Option value="30">最近30天</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* 关键指标 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总曝光量"
            value={aggregatedData?.showcount || 0}
            loading={loading}
            color="#13c2c2"
          ```

## 5. 样式设计

### 5.1 组件样式

```css
/* 关键指标卡片样式 */
.key-metric-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.key-metric-card .metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.key-metric-card .metric-title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.key-metric-card .info-icon {
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
}

.key-metric-card .change-indicator {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  margin-left: 8px;
}

/* 图表卡片样式 */
.trend-chart-card,
.funnel-chart-card,
.comparison-chart-card,
.gauge-chart-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

/* 数据表格样式 */
.data-table-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

/* 筛选器样式 */
.filter-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.filter-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.filter-label {
  margin-bottom: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

/* 响应式调整 */
@media (max-width: 576px) {
  .filter-item {
    margin-bottom: 16px;
  }
}
```

## 6. 总结

本文档详细描述了WB和OZON电商数据看板中各数据可视化组件的设计和实现方案。这些组件包括：

1. **核心可视化组件**：
   - 关键指标卡片 (KeyMetricCard)
   - 趋势图组件 (TrendChart)
   - 漏斗图组件 (FunnelChart)
   - 数据表格组件 (DataTable)
   - 多维度对比图组件 (ComparisonChart)
   - 仪表盘组件 (GaugeChart)

2. **页面级组件**：
   - 综合页面数据可视化组件
   - WB页面数据可视化组件
   - OZON页面数据可视化组件

3. **样式设计**：
   - 组件样式
   - 响应式调整

这些组件共同构成了一个完整的电商数据可视化系统，能够满足用户对WB和OZON平台销售数据的分析需求。通过这些组件，用户可以直观地了解产品销售漏斗数据、转化率、趋势变化等关键指标，从而做出更明智的运营决策。
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总点击量"
            value={aggregatedData?.opencardcount || 0}
            loading={loading}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="点击率"
            value={aggregatedData?.clickRate || 0}
            format="percent"
            loading={loading}
            color="#eb2f96"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总加购量"
            value={aggregatedData?.addtocartcount || 0}
            loading={loading}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="加购率"
            value={aggregatedData?.addtocartpercent || 0}
            format="percent"
            loading={loading}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总下单量"
            value={aggregatedData?.orderscount || 0}
            loading={loading}
            color="#f5222d"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="下单率"
            value={aggregatedData?.orderRate || 0}
            format="percent"
            loading={loading}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="平均位置"
            value={aggregatedData?.avgPosition || 0}
            loading={loading}
            color="#fa8c16"
          />
        </Col>
      </Row>
      
      {/* 趋势图和漏斗图 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <TrendChart
            title="销售趋势"
            data={salesData}
            xField="Day"
            yFields={['showcount', 'opencardcount', 'addtocartcount', 'orderscount']}
            yFieldLabels={['曝光量', '点击量', '加购量', '下单量']}
            loading={loading}
            height="400px"
          />
        </Col>
        <Col xs={24} lg={8}>
          <FunnelChart
            title="销售漏斗"
            data={getFunnelData()}
            nameField="name"
            valueField="value"
            loading={loading}
            height="400px"
          />
        </Col>
       </Row>
      
      {/* 周销售趋势和位置趋势 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <TrendChart
            title="周下单趋势"
            data={weeklySalesData}
            xField="Day"
            yFields={['weeklyOrders']}
            yFieldLabels={['周下单量']}
            loading={loading}
            height="300px"
            colors={['#722ed1']}
          />
        </Col>
        <Col xs={24} md={12}>
          <TrendChart
            title="位置趋势"
            data={salesData}
            xField="Day"
            yFields={['Position']}
            yFieldLabels={['位置']}
            loading={loading}
            height="300px"
            colors={['#fa8c16']}
          />
        </Col>
      </Row>
      
      {/* 数据表格 */}
      <Row gutter={16}>
        <Col span={24}>
          <DataTable
            title="销售数据明细"
            data={salesData}
            columns={columns}
            loading={loading}
            exportFileName="ozon_sales_data"
          />
        </Col>
      </Row>
    </div>
  );
};

export default OzonDashboard;
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总加购量"
            value={aggregatedData?.addtocartcount || 0}
            loading={loading}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="加购率"
            value={aggregatedData?.addtocartpercent || 0}
            format="percent"
            loading={loading}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总下单量"
            value={aggregatedData?.orderscount || 0}
            loading={loading}
            color="#f5222d"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="下单率"
            value={aggregatedData?.orderRate || 0}
            format="percent"
            loading={loading}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总下单金额"
            value={aggregatedData?.orderssumrub || 0}
            format="currency"
            loading={loading}
            color="#13c2c2"
          />
        </Col>
      </Row>
      
      {/* 趋势图和漏斗图 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <TrendChart
            title="销售趋势"
            data={salesData}
            xField="Day"
            yFields={['opencardcount', 'addtocartcount', 'orderscount']}
            yFieldLabels={['点击量', '加购量', '下单量']}
            loading={loading}
            height="400px"
          />
        </Col>
        <Col xs={24} lg={8}>
          <FunnelChart
            title="销售漏斗"
            data={getFunnelData()}
            nameField="name"
            valueField="value"
            loading={loading}
            height="400px"
          />
        </Col>
      </Row>
      
      {/* 周销售趋势 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <TrendChart
            title="周下单趋势"
            data={weeklySalesData}
            xField="Day"
            yFields={['weeklyOrders']}
            yFieldLabels={['周下单量']}
            loading={loading}
            height="300px"
            colors={['#722ed1']}
          />
        </Col>
      </Row>
      
      {/* 数据表格 */}
      <Row gutter={16}>
        <Col span={24}>
          <DataTable
            title="销售数据明细"
            data={salesData}
            columns={columns}
            loading={loading}
            exportFileName="combined_sales_data"
          />
        </Col>
      </Row>
    </div>
  );
};

export default CombinedDashboard;
```

### 4.2 WB页面数据可视化组件

```jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, DatePicker, Select } from 'antd';
import { 
  KeyMetricCard, 
  TrendChart, 
  FunnelChart, 
  DataTable 
} from '../components';
import { 
  getWbSalesData, 
  getWbWeeklySalesData 
} from '../services/dataService';
import { formatNumber, formatPercent, formatDate } from '../utils/formatters';

const { RangePicker } = DatePicker;
const { Option } = Select;

const WbDashboard = () => {
  // 状态定义
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedSku, setSelectedSku] = useState('all');
  const [timeRange, setTimeRange] = useState('7');
  const [salesData, setSalesData] = useState([]);
  const [weeklySalesData, setWeeklySalesData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [skuOptions, setSkuOptions] = useState([]);
  
  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取销售数据
        const data = await getWbSalesData({
          dateRange,
          sku: selectedSku === 'all' ? null : selectedSku,
          timeRange: parseInt(timeRange)
        });
        
        setSalesData(data.dailyData || []);
        setAggregatedData(data.aggregated || null);
        setSkuOptions(data.skuList || []);
        
        // 获取周销售数据
        const weeklyData = await getWbWeeklySalesData({
          dateRange,
          sku: selectedSku === 'all' ? null : selectedSku
        });
        
        setWeeklySalesData(weeklyData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange, selectedSku, timeRange]);
  
  // 准备漏斗图数据
  const getFunnelData = () => {
    if (!aggregatedData) return [];
    
    return [
      { name: '点击', value: aggregatedData.opencardcount },
      { name: '加购', value: aggregatedData.addtocartcount },
      { name: '下单', value: aggregatedData.orderscount }
    ];
  };
  
  // 准备表格列定义
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'SKU',
      key: 'SKU',
      searchable: true,
      sorter: (a, b) => a.SKU.localeCompare(b.SKU)
    },
    {
      title: '产品名称',
      dataIndex: 'Name',
      key: 'Name',
      searchable: true,
      sorter: (a, b) => a.Name.localeCompare(b.Name)
    },
    {
      title: '日期',
      dataIndex: 'Day',
      key: 'Day',
      render: (text) => formatDate(text),
      sorter: (a, b) => new Date(a.Day) - new Date(b.Day)
    },
    {
      title: '点击量',
      dataIndex: 'opencardcount',
      key: 'opencardcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.opencardcount - b.opencardcount
    },
    {
      title: '加购量',
      dataIndex: 'addtocartcount',
      key: 'addtocartcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.addtocartcount - b.addtocartcount
    },
    {
      title: '加购率',
      dataIndex: 'addtocartpercent',
      key: 'addtocartpercent',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.addtocartpercent - b.addtocartpercent
    },
    {
      title: '下单量',
      dataIndex: 'orderscount',
      key: 'orderscount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.orderscount - b.orderscount
    },
    {
      title: '下单率',
      dataIndex: 'orderRate',
      key: 'orderRate',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.orderRate - b.orderRate
    },
    {
      title: '下单金额',
      dataIndex: 'orderssumrub',
      key: 'orderssumrub',
      render: (text) => formatNumber(text, 'currency'),
      sorter: (a, b) => a.orderssumrub - b.orderssumrub
    },
    {
      title: '位置',
      dataIndex: 'Position',
      key: 'Position',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.Position - b.Position
    },
    {
      title: '取消量',
      dataIndex: 'cancelcount',
      key: 'cancelcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.cancelcount - b.cancelcount
    },
    {
      title: '退回量',
      dataIndex: 'returnedcount',
      key: 'returnedcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.returnedcount - b.returnedcount
    }
  ];

  return (
    <div className="wb-dashboard">
      {/* 筛选器 */}
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">日期范围：</span>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={setDateRange} 
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">SKU：</span>
              <Select
                style={{ width: '100%' }}
                value={selectedSku}
                onChange={setSelectedSku}
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">全部</Option>
                {skuOptions.map(sku => (
                  <Option key={sku.SKU} value={sku.SKU}>{sku.SKU} - {sku.Name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">时间范围：</span>
              <Select
                style={{ width: '100%' }}
                value={timeRange}
                onChange={setTimeRange}
              >
                <Option value="7">最近7天</Option>
                <Option value="15">最近15天</Option>
                <Option value="30">最近30天</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* 关键指标 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总点击量"
            value={aggregatedData?.opencardcount || 0}
            loading={loading}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总加购量"
            value={aggregatedData?.addtocartcount || 0}
            loading={loading}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="加购率"
            value={aggregatedData?.addtocartpercent || 0}
            format="percent"
            loading={loading}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="总下单量"
            value={aggregatedData?.orderscount || 0}
            loading={loading}
            color="#f5222d"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="下单率"
            value={aggregatedData?.orderRate || 0}
            format="percent"
            loading={loading}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <KeyMetricCard
            title="平均位置"
            value={aggregatedData?.avgPosition || 0}
            loading={loading}
            color="#eb2f96"
          />
        </Col>
      </Row>
      
      {/* 趋势图和漏斗图 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <TrendChart
            title="销售趋势"
            data={salesData}
            xField="Day"
            yFields={['opencardcount', 'addtocartcount', 'orderscount']}
            yFieldLabels={['点击量', '加购量', '下单量']}
            loading={loading}
            height="400px"
          />
        </Col>
        <Col xs={24} lg={8}>
          <FunnelChart
            title="销售漏斗"
            data={getFunnelData()}
            nameField="name"
            valueField="value"
            loading={loading}
            height="400px"
          />
        </Col>
      </Row>
      
      {/* 周销售趋势和位置趋势 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <TrendChart
            title="周下单趋势"
            data={weeklySalesData}
            xField="Day"
            yFields={['weeklyOrders']}
            yFieldLabels={['周下单量']}
            loading={loading}
            height="300px"
            colors={['#722ed1']}
          />
        </Col>
        <Col xs={24} md={12}>
          <TrendChart
            title="位置趋势"
            data={salesData}
            xField="Day"
            yFields={['Position']}
            yFieldLabels={['位置']}
            loading={loading}
            height="300px"
            colors={['#eb2f96']}
          />
        </Col>
      </Row>
      
      {/* 数据表格 */}
      <Row gutter={16}>
        <Col span={24}>
          <DataTable
            title="销售数据明细"
            data={salesData}
            columns={columns}
            loading={loading}
            exportFileName="wb_sales_data"
          />
        </Col>
      </Row>
    </div>
  );
};

export default WbDashboard;
```

### 4.3 OZON页面数据可视化组件

```jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, DatePicker, Select } from 'antd';
import { 
  KeyMetricCard, 
  TrendChart, 
  FunnelChart, 
  DataTable 
} from '../components';
import { 
  getOzonSalesData, 
  getOzonWeeklySalesData 
} from '../services/dataService';
import { formatNumber, formatPercent, formatDate } from '../utils/formatters';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OzonDashboard = () => {
  // 状态定义
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedSku, setSelectedSku] = useState('all');
  const [timeRange, setTimeRange] = useState('7');
  const [salesData, setSalesData] = useState([]);
  const [weeklySalesData, setWeeklySalesData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [skuOptions, setSkuOptions] = useState([]);
  
  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取销售数据
        const data = await getOzonSalesData({
          dateRange,
          sku: selectedSku === 'all' ? null : selectedSku,
          timeRange: parseInt(timeRange)
        });
        
        setSalesData(data.dailyData || []);
        setAggregatedData(data.aggregated || null);
        setSkuOptions(data.skuList || []);
        
        // 获取周销售数据
        const weeklyData = await getOzonWeeklySalesData({
          dateRange,
          sku: selectedSku === 'all' ? null : selectedSku
        });
        
        setWeeklySalesData(weeklyData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange, selectedSku, timeRange]);
  
  // 准备漏斗图数据
  const getFunnelData = () => {
    if (!aggregatedData) return [];
    
    return [
      { name: '曝光', value: aggregatedData.showcount },
      { name: '点击', value: aggregatedData.opencardcount },
      { name: '加购', value: aggregatedData.addtocartcount },
      { name: '下单', value: aggregatedData.orderscount }
    ];
  };
  
  // 准备表格列定义
  const columns = [
    {
      title: 'SKU',
      dataIndex: 'SKU',
      key: 'SKU',
      searchable: true,
      sorter: (a, b) => a.SKU.localeCompare(b.SKU)
    },
    {
      title: '产品名称',
      dataIndex: 'Name',
      key: 'Name',
      searchable: true,
      sorter: (a, b) => a.Name.localeCompare(b.Name)
    },
    {
      title: '日期',
      dataIndex: 'Day',
      key: 'Day',
      render: (text) => formatDate(text),
      sorter: (a, b) => new Date(a.Day) - new Date(b.Day)
    },
    {
      title: '曝光量',
      dataIndex: 'showcount',
      key: 'showcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.showcount - b.showcount
    },
    {
      title: '点击量',
      dataIndex: 'opencardcount',
      key: 'opencardcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.opencardcount - b.opencardcount
    },
    {
      title: '点击率',
      dataIndex: 'clickRate',
      key: 'clickRate',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.clickRate - b.clickRate
    },
    {
      title: '加购量',
      dataIndex: 'addtocartcount',
      key: 'addtocartcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.addtocartcount - b.addtocartcount
    },
    {
      title: '加购率',
      dataIndex: 'addtocartpercent',
      key: 'addtocartpercent',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.addtocartpercent - b.addtocartpercent
    },
    {
      title: '下单量',
      dataIndex: 'orderscount',
      key: 'orderscount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.orderscount - b.orderscount
    },
    {
      title: '下单率',
      dataIndex: 'orderRate',
      key: 'orderRate',
      render: (text) => formatPercent(text),
      sorter: (a, b) => a.orderRate - b.orderRate
    },
    {
      title: '下单金额',
      dataIndex: 'orderssumrub',
      key: 'orderssumrub',
      render: (text) => formatNumber(text, 'currency'),
      sorter: (a, b) => a.orderssumrub - b.orderssumrub
    },
    {
      title: '位置',
      dataIndex: 'Position',
      key: 'Position',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.Position - b.Position
    },
    {
      title: '取消量',
      dataIndex: 'cancelcount',
      key: 'cancelcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.cancelcount - b.cancelcount
    },
    {
      title: '退回量',
      dataIndex: 'returnedcount',
      key: 'returnedcount',
      render: (text) => formatNumber(text),
      sorter: (a, b) => a.returnedcount - b.returnedcount
    }
  ];

  return (
    <div className="ozon-dashboard">
      {/* 筛选器 */}
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">日期范围：</span>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={setDateRange} 
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">SKU：</span>
              <Select
                style={{ width: '100%' }}
                value={selectedSku}
                onChange={setSelectedSku}
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">全部</Option>
                {skuOptions.map(sku => (
                  <Option key={sku.SKU} value={sku.SKU}>{sku.SKU} - {sku.Name}</Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="filter-item">
              <span className="filter-label">时间范围：</span>
              <Select
                style={{ width: '100%' }}
                value={timeRange}
                onChange={setTimeRange}
              >
                <Option value="7">最近7天</Option>
                <Option value="15">最近15天</Option>
                <Option value="30">最近30天</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>