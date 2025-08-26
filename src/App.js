import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  ShoppingCartOutlined,
  HomeOutlined
} from '@ant-design/icons';

// 页面组件
import Dashboard from './pages/Dashboard';
import WBPage from './pages/WBPage';
import OZONPage from './pages/OZONPage';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Layout className="app-container">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth="80"
      >
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: <Link to="/">综合看板</Link>,
            },
            {
              key: '2',
              icon: <ShoppingOutlined />,
              label: <Link to="/wb">WB看板</Link>,
            },
            {
              key: '3',
              icon: <ShoppingCartOutlined />,
              label: <Link to="/ozon">OZON看板</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div className="site-layout-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wb" element={<WBPage />} />
              <Route path="/ozon" element={<OZONPage />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          WB和OZON电商数据看板 ©{new Date().getFullYear()} Created by Your Company
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;