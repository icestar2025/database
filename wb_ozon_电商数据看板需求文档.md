# WB和OZON电商数据看板需求文档

## 1. 项目概述

### 1.1 项目背景

随着跨境电商业务的发展，商家需要一个集中化的数据看板来监控和分析在WB（Wildberries）和OZON这两个俄罗斯主要电商平台上的产品表现。本项目旨在开发一个综合性的数据看板，帮助商家实时掌握产品的曝光、点击、加购、下单等关键指标，并提供多维度的数据分析功能。

### 1.2 项目目标

- 整合WB和OZON平台的电商数据，提供统一的数据可视化界面
- 展示产品的关键性能指标和转化率
- 支持多维度的数据筛选和分析
- 提供直观的数据对比和趋势分析

## 2. 功能需求

### 2.1 整体结构

网站划分为3个主页面：
- **综合页面**：展示WB和OZON的总数据
- **WB页面**：专门展示WB平台的数据
- **OZON页面**：专门展示OZON平台的数据

### 2.2 OZON页面功能

#### 2.2.1 商品漏斗看板

- **功能描述**：展示每个SKU的分天数据和汇总数据
- **数据内容**：
  - 曝光数据
  - 点击数据
  - 加购数据
  - 下单数据
  - 点击率（计算得出：点击/曝光）
  - 加购率
  - 下单率（计算得出：下单/加购）
  - 周下单数据（计算得出：订单日期-7到订单日期这7天的总下单数）
  - 位置数据
- **数据筛选**：
  - 支持按SKU筛选
  - 支持按时间范围筛选（7天、15天、30天或自定义日期）
- **数据展示**：
  - 默认展示汇总数据
  - 可展开查看分天数据
- **设计重点**：
  - 突出显示曝光量、下单量、点击率、加购率、下单率和位置数据

#### 2.2.2 数据来源

- **数据表**：supabase中的ozon_product_sales表
- **字段映射**：
  - SKU："SKU" (text)
  - 产品名称："Name" (text)
  - 订单日期："Day" (date)
  - 下单量："orderscount" (numeric)
  - 曝光："showcount" (numeric)
  - 点击："opencardcount" (numeric)
  - 加购数量："addtocartcount" (numeric)
  - 加购率："addtocartpercent" (numeric)
  - 下单金额："orderssumrub" (numeric)
  - 取消数量："cancelcount" (numeric)
  - 退回数量："returnedcount" (numeric)
  - 位置："Position" (numeric)

### 2.3 WB页面功能

#### 2.3.1 商品漏斗看板

- **功能描述**：展示每个SKU的分天数据和汇总数据
- **数据内容**：
  - 点击数据
  - 加购数据
  - 下单数据
  - 加购率
  - 下单率（计算得出：下单/加购）
  - 周下单数据（计算得出：订单日期-7到订单日期这7天的总下单数）
- **数据筛选**：
  - 支持按SKU筛选
  - 支持按时间范围筛选（7天、15天、30天或自定义日期）
- **数据展示**：
  - 默认展示汇总数据
  - 可展开查看分天数据
- **设计重点**：
  - 突出显示点击量、下单量、加购率、下单率

#### 2.3.2 数据来源

- **数据表**：supabase中的wb_product_sales表
- **字段映射**：
  - SKU："SKU" (text)
  - 产品名称："Name" (text)
  - 订单日期："Day" (date)
  - 下单量："orderscount" (numeric)
  - 点击："opencardcount" (numeric)
  - 加购数量："addtocartcount" (numeric)
  - 加购率："addtocartpercent" (numeric)
  - 下单金额："orderssumrub" (numeric)
  - 取消数量："cancelcount" (numeric)
  - 退回数量："returnedcount" (numeric)
  - 位置："Position" (numeric)

### 2.4 综合页面功能

#### 2.4.1 商品漏斗看板

- **功能描述**：展示WB和OZON平台合并后的每个SKU的分天数据和汇总数据
- **数据内容**：
  - 点击数据
  - 加购数据
  - 下单数据
  - 加购率
  - 下单率（计算得出：下单/加购）
  - 周下单数据（计算得出：订单日期-7到订单日期这7天的总下单数）
- **数据筛选**：
  - 支持按SKU筛选
  - 支持按时间范围筛选（7天、15天、30天或自定义日期）
- **数据展示**：
  - 默认展示汇总数据
  - 可展开查看分天数据
- **设计重点**：
  - 突出显示点击量、下单量、加购率、下单率
  - 不需要显示曝光和位置这两个参数

## 3. 数据结构设计

### 3.1 数据表结构

#### 3.1.1 OZON产品销售数据表（ozon_product_sales）

| 字段名 | 字段代码 | 数据类型 | 说明 |
|-------|---------|--------|------|
| SKU | SKU | text | 产品唯一标识 |
| 产品名称 | Name | text | 产品名称 |
| 订单日期 | Day | date | 数据日期 |
| 下单量 | orderscount | numeric | 订单数量 |
| 曝光量 | showcount | numeric | 曝光次数 |
| 点击量 | opencardcount | numeric | 点击次数 |
| 加购量 | addtocartcount | numeric | 加入购物车次数 |
| 加购率 | addtocartpercent | numeric | 加购率 |
| 下单金额 | orderssumrub | numeric | 订单总金额（卢布） |
| 取消量 | cancelcount | numeric | 取消订单数量 |
| 退回量 | returnedcount | numeric | 退货数量 |
| 位置 | Position | numeric | 产品位置排名 |

#### 3.1.2 WB产品销售数据表（wb_product_sales）

| 字段名 | 字段代码 | 数据类型 | 说明 |
|-------|---------|--------|------|
| SKU | SKU | text | 产品唯一标识 |
| 产品名称 | Name | text | 产品名称 |
| 订单日期 | Day | date | 数据日期 |
| 下单量 | orderscount | numeric | 订单数量 |
| 点击量 | opencardcount | numeric | 点击次数 |
| 加购量 | addtocartcount | numeric | 加入购物车次数 |
| 加购率 | addtocartpercent | numeric | 加购率 |
| 下单金额 | orderssumrub | numeric | 订单总金额（卢布） |
| 取消量 | cancelcount | numeric | 取消订单数量 |
| 退回量 | returnedcount | numeric | 退货数量 |

### 3.2 计算字段

| 字段名 | 计算公式 | 适用页面 | 说明 |
|-------|---------|--------|------|
| 点击率 | 点击 / 曝光 | OZON | 产品被点击的概率 |
| 下单率 | 下单 / 加购 | 全部 | 加购后转化为订单的概率 |
| 周下单数据 | 订单日期-7到订单日期这7天的总下单数 | 全部 | 最近7天的订单总量 |

## 4. UI设计规范

### 4.1 整体布局

- **顶部导航栏**：包含三个主页面的切换标签（综合、WB、OZON）
- **筛选区域**：包含SKU选择器和时间范围选择器，默认展示全部SKU和昨日数据
- **数据概览区**：展示关键指标的汇总数据
- **数据详情区**：展示分SKU的详细数据表格

### 4.2 OZON页面设计

- **重点突出指标**：曝光量、下单量、点击率、加购率、下单率和位置数据
- **数据可视化**：
  - 使用折线图展示关键指标的趋势
  - 使用漏斗图展示转化流程
  - 使用表格展示详细数据

### 4.3 WB页面设计

- **重点突出指标**：点击量、下单量、加购率、下单率
- **数据可视化**：
  - 使用折线图展示关键指标的趋势
  - 使用漏斗图展示转化流程
  - 使用表格展示详细数据

### 4.4 综合页面设计

- **重点突出指标**：点击量、下单量、加购率、下单率
- **数据可视化**：
  - 使用折线图展示关键指标的趋势
  - 使用漏斗图展示转化流程
  - 使用表格展示详细数据
  - 使用对比图表展示WB和OZON的数据对比

## 5. 技术实现

### 5.1 前端技术栈

- **框架**：React.js
- **UI组件库**：Ant Design
- **数据可视化**：ECharts/Recharts
- **状态管理**：Redux/Context API

### 5.2 后端技术栈

- **数据库**：Supabase
- **API**：Supabase REST API

NEXT_PUBLIC_SUPABASE_URL=https://yzphhsndsatoymvcstfp.supabase.co

service_role：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGhoc25kc2F0b3ltdmNzdGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU3Mjg2MiwiZXhwIjoyMDcxMTQ4ODYyfQ.OQu7Lb_8iU0mkVmEB_vympD2O4dg-8vRfepj9sYYKJ4
- **认证**：Supabase Auth

### 5.3 数据处理流程

1. 从Supabase获取原始数据
2. 在前端进行数据处理和计算
3. 生成可视化图表和表格
4. 支持数据导出功能

## 6. 开发计划

### 6.1 阶段一：基础框架搭建

- 创建React项目
- 配置Supabase连接
- 实现基本路由和页面结构

### 6.2 阶段二：数据获取和处理

- 实现数据查询接口
- 开发数据处理和计算逻辑
- 实现数据缓存和优化

### 6.3 阶段三：UI实现

- 开发数据可视化组件
- 实现筛选和交互功能
- 优化用户体验

### 6.4 阶段四：测试和部署

- 功能测试和性能优化
- 部署上线
- 用户培训和文档编写

## 7. 附录

### 7.1 术语表

- **WB**：Wildberries，俄罗斯最大的电商平台之一
- **OZON**：俄罗斯主要电商平台之一
- **曝光（Impression）**：产品被展示给用户的次数
- **点击（Click）**：用户点击产品的次数
- **加购（Add to Cart）**：用户将产品添加到购物车的次数
- **下单（Order）**：用户购买产品的次数
- **点击率（CTR）**：点击次数/曝光次数
- **加购率**：加购次数/点击次数
- **下单率**：下单次数/加购次数