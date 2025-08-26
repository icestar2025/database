# WB & OZON 电商数据看板

## 项目介绍

这是一个基于React的电商数据可视化看板，用于展示WB和OZON平台的销售数据。系统提供了三个主要看板：WB销售数据看板、OZON销售数据看板和综合销售数据看板，帮助用户全面了解电商销售情况。

## 功能特点

- **多平台数据整合**：同时展示WB和OZON两个电商平台的销售数据
- **丰富的数据可视化**：包括趋势图、漏斗图、饼图等多种图表
- **灵活的筛选功能**：支持按日期范围、SKU和数据粒度进行筛选
- **关键指标展示**：直观展示销售额、订单量、转化率等关键业务指标
- **响应式设计**：适配不同尺寸的屏幕设备

## 技术栈

- **前端框架**：React 18
- **状态管理**：Redux Toolkit
- **UI组件库**：Ant Design 5
- **图表库**：@ant-design/charts
- **数据库**：Supabase
- **构建工具**：Create React App

## 安装与运行

### 前提条件

- Node.js 16.x 或更高版本
- npm 8.x 或更高版本

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件，并添加以下内容：

```
REACT_APP_SUPABASE_URL=你的Supabase项目URL
REACT_APP_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 启动开发服务器

```bash
npm start
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── components/         # 通用组件
│   │   ├── Charts/         # 图表组件
│   │   ├── Filters/        # 筛选器组件
│   │   ├── DataTable/      # 数据表格组件
│   │   ├── KeyMetricCard/  # 关键指标卡片组件
│   │   └── PageHeader/     # 页面头部组件
│   ├── pages/              # 页面组件
│   │   ├── WbDashboard/    # WB看板页面
│   │   ├── OzonDashboard/  # OZON看板页面
│   │   └── CombinedDashboard/ # 综合看板页面
│   ├── services/           # 服务层
│   │   ├── dataService.js  # 数据服务
│   │   └── supabaseClient.js # Supabase客户端
│   ├── store/              # Redux状态管理
│   │   ├── index.js        # Store配置
│   │   └── slices/         # Redux切片
│   ├── utils/              # 工具函数
│   ├── App.js              # 应用入口组件
│   └── index.js            # 应用入口文件
├── .env                    # 环境变量
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 数据模型

系统使用Supabase作为后端数据库，主要包含以下数据表：

- **wb_product_sales**：WB平台的产品销售数据
- **ozon_product_sales**：OZON平台的产品销售数据
- **wb_weekly_sales**：WB平台的周销售数据
- **ozon_weekly_sales**：OZON平台的周销售数据

## 部署

本项目可以部署到Vercel、Netlify等静态网站托管平台：

```bash
# 安装Vercel CLI
npm install -g vercel

# 部署到Vercel
vercel
```

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件