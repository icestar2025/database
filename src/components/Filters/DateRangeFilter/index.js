import React from 'react';
import { DatePicker, Typography } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;
const { Text } = Typography;

/**
 * 日期范围筛选器组件
 * @param {Object} props - 组件属性
 * @param {Array} props.value - 当前选中的日期范围
 * @param {Function} props.onChange - 日期范围变化时的回调函数
 * @returns {JSX.Element} 日期范围筛选器组件
 */
const DateRangeFilter = ({ value, onChange }) => {
  return (
    <div className="filter-container">
      <Text strong style={{ marginRight: 8 }}>日期范围：</Text>
      <RangePicker
        value={value}
        onChange={onChange}
        style={{ width: '100%' }}
        locale={locale}
        allowClear={false}
        format="YYYY-MM-DD"
      />
    </div>
  );
};

export default DateRangeFilter;