import React, { useEffect, useState } from 'react';
import { Select, Typography, Spin } from 'antd';
import { fetchProducts } from '../../../services/dataService';

const { Text } = Typography;
const { Option } = Select;

/**
 * SKU筛选器组件
 * @param {Object} props - 组件属性
 * @param {Array} props.value - 当前选中的SKU列表
 * @param {Function} props.onChange - SKU选择变化时的回调函数
 * @returns {JSX.Element} SKU筛选器组件
 */
const SkuFilter = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  // 加载产品列表
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const products = await fetchProducts();
        setOptions(products);
      } catch (error) {
        console.error('加载产品列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="filter-container">
      <Text strong style={{ marginRight: 8 }}>SKU：</Text>
      <Select
        mode="multiple"
        value={value}
        onChange={onChange}
        style={{ width: '100%' }}
        placeholder="选择SKU"
        allowClear
        showSearch
        optionFilterProp="label"
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : null}
      >
        {options.map(option => (
          <Option key={option.value} value={option.value} label={option.label}>
            {option.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default SkuFilter;