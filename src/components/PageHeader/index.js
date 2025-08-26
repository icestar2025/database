import React from 'react';
import { Typography, Space } from 'antd';

const { Title } = Typography;

/**
 * 页面头部组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 页面标题
 * @param {string} [props.subtitle] - 页面副标题（可选）
 * @returns {JSX.Element} 页面头部组件
 */
const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="page-header">
      <Space direction="vertical" size={4}>
        <Title level={2}>{title}</Title>
        {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
      </Space>
    </div>
  );
};

export default PageHeader;