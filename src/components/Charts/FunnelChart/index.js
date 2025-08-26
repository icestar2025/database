import React from 'react';
import { Funnel } from '@ant-design/charts';

/**
 * 漏斗图组件
 * @param {Object} props - 组件属性，直接传递给 @ant-design/charts 的 Funnel 组件
 * @returns {JSX.Element} 漏斗图组件
 */
const FunnelChart = (props) => {
  // 默认配置
  const defaultConfig = {
    animation: true,
    label: {
      formatter: (datum) => {
        return `${datum.stage}: ${datum.value.toLocaleString()}`;
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.stage, value: datum.value.toLocaleString() };
      },
    },
    conversionTag: {
      visible: true,
      formatter: (datum, index) => {
        if (index === 0) {
          return '';
        }
        const prevData = props.data[index - 1];
        const currentData = datum;
        const conversion = (currentData.value / prevData.value) * 100;
        return `${conversion.toFixed(1)}%`;
      },
    },
  };

  // 合并默认配置和传入的配置
  const config = { ...defaultConfig, ...props };

  return (
    <div className="funnel-chart-container">
      <Funnel {...config} />
    </div>
  );
};

export default FunnelChart;