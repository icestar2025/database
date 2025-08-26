import React from 'react';
import { Radio, Typography } from 'antd';

const { Text } = Typography;

/**
 * 时间范围筛选器组件
 * @param {Object} props - 组件属性
 * @param {string} props.value - 当前选中的时间范围
 * @param {Function} props.onChange - 时间范围变化时的回调函数
 * @returns {JSX.Element} 时间范围筛选器组件
 */
const TimeRangeFilter = ({ value, onChange }) => {
  const options = [
    { label: '按天', value: 'day' },
    { label: '按SKU', value: 'sku' },
  ];

  return (
    <div className="filter-container">
      <Text strong style={{ marginRight: 8 }}>数据粒度：</Text>
      <Radio.Group
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        optionType="button"
        buttonStyle="solid"
      />
    </div>
  );
};

export default TimeRangeFilter;