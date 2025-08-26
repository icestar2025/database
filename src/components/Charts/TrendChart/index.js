import React from 'react';
import { Line } from '@ant-design/charts';

/**
 * 趋势图表组件
 * @param {Object} props - 组件属性，直接传递给 @ant-design/charts 的 Line 组件
 * @returns {JSX.Element} 趋势图表组件
 */
const TrendChart = (props) => {
  // 默认配置
  const defaultConfig = {
    smooth: true,
    animation: true,
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      showMarkers: true,
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: 'red',
        },
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
  };

  // 合并默认配置和传入的配置
  const config = { ...defaultConfig, ...props };

  return (
    <div className="trend-chart-container">
      <Line {...config} />
    </div>
  );
};

export default TrendChart;