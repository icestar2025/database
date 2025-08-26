import React from 'react';
import { Card, Statistic } from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  RollbackOutlined, 
  PercentageOutlined,
  EyeOutlined,
  MousePointerOutlined,
  ShoppingOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';

/**
 * 关键指标卡片组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 指标标题
 * @param {number|string} props.value - 指标值
 * @param {Function} props.formatter - 格式化函数
 * @param {string} props.icon - 图标名称
 * @param {string} props.color - 图标颜色
 * @returns {JSX.Element} 关键指标卡片组件
 */
const KeyMetricCard = ({ title, value, formatter, icon, color }) => {
  // 图标映射
  const iconMap = {
    'shopping-cart': <ShoppingCartOutlined style={{ color }} />,
    'dollar': <DollarOutlined style={{ color }} />,
    'rollback': <RollbackOutlined style={{ color }} />,
    'percentage': <PercentageOutlined style={{ color }} />,
    'eye': <EyeOutlined style={{ color }} />,
    'mouse-pointer': <MousePointerOutlined style={{ color }} />,
    'shopping': <ShoppingOutlined style={{ color }} />,
    'arrow-up': <ArrowUpOutlined style={{ color }} />
  };

  return (
    <Card className="metric-card" bordered={false}>
      <Statistic
        title={title}
        value={value}
        formatter={formatter ? (val) => formatter(val) : undefined}
        valueStyle={{ color }}
        prefix={iconMap[icon]}
      />
    </Card>
  );
};

export default KeyMetricCard;