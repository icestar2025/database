import React from 'react';
import { Table } from 'antd';

/**
 * 数据表格组件
 * @param {Object} props - 组件属性
 * @param {Array} props.columns - 表格列配置
 * @param {Array} props.dataSource - 表格数据源
 * @param {string|Function} props.rowKey - 行键
 * @param {Object} props.pagination - 分页配置
 * @param {boolean} props.loading - 加载状态
 * @returns {JSX.Element} 数据表格组件
 */
const DataTable = ({ columns, dataSource, rowKey, pagination, loading }) => {
  return (
    <div className="data-table-wrapper">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={pagination}
        loading={loading}
        scroll={{ x: 'max-content' }}
        size="middle"
        bordered
      />
    </div>
  );
};

export default DataTable;