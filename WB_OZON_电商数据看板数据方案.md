# WB和OZON电商数据看板数据方案

## 1. 数据库连接配置

### 1.1 Supabase配置

使用Supabase JavaScript客户端库连接数据库：

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 1.2 环境变量配置

在项目根目录创建`.env`文件：

```
REACT_APP_SUPABASE_URL=https://your-supabase-url.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 2. 数据查询方案

### 2.1 OZON数据查询

#### 2.1.1 获取OZON产品列表

```javascript
async function getOzonProducts() {
  const { data, error } = await supabase
    .from('ozon_product_sales')
    .select('SKU, Name')
    .distinct('SKU')
  
  if (error) {
    console.error('Error fetching OZON products:', error)
    return []
  }
  
  return data || []
}
```

#### 2.1.2 获取OZON产品销售数据

```javascript
async function getOzonSalesData({
  skus = [],
  startDate,
  endDate,
  groupByDay = true
}) {
  let query = supabase
    .from('ozon_product_sales')
    .select('*')
  
  // 添加SKU筛选
  if (skus.length > 0) {
    query = query.in('SKU', skus)
  }
  
  // 添加日期筛选
  if (startDate) {
    query = query.gte('Day', startDate)
  }
  
  if (endDate) {
    query = query.lte('Day', endDate)
  }
  
  // 执行查询
  const { data, error } = await query.order('Day', { ascending: false })
  
  if (error) {
    console.error('Error fetching OZON sales data:', error)
    return []
  }
  
  // 计算额外字段
  const processedData = data.map(item => ({
    ...item,
    // 计算点击率
    ctr: item.showcount > 0 ? item.opencardcount / item.showcount : 0,
    // 计算下单率
    conversion_rate: item.addtocartcount > 0 ? item.orderscount / item.addtocartcount : 0
  }))
  
  // 如果不需要按天分组，则返回原始数据
  if (groupByDay) {
    return processedData
  }
  
  // 按SKU分组汇总数据
  const groupedData = processedData.reduce((acc, item) => {
    const existingItem = acc.find(i => i.SKU === item.SKU)
    
    if (existingItem) {
      existingItem.showcount += item.showcount || 0
      existingItem.opencardcount += item.opencardcount || 0
      existingItem.addtocartcount += item.addtocartcount || 0
      existingItem.orderscount += item.orderscount || 0
      existingItem.orderssumrub += item.orderssumrub || 0
      existingItem.cancelcount += item.cancelcount || 0
      existingItem.returnedcount += item.returnedcount || 0
      // 更新计算字段
      existingItem.ctr = existingItem.showcount > 0 ? existingItem.opencardcount / existingItem.showcount : 0
      existingItem.addtocartpercent = existingItem.opencardcount > 0 ? existingItem.addtocartcount / existingItem.opencardcount : 0
      existingItem.conversion_rate = existingItem.addtocartcount > 0 ? existingItem.orderscount / existingItem.addtocartcount : 0
      // 取平均位置
      existingItem.Position = (existingItem.Position * existingItem.count + item.Position) / (existingItem.count + 1)
      existingItem.count += 1
    } else {
      acc.push({
        ...item,
        count: 1
      })
    }
    
    return acc
  }, [])
  
  return groupedData.map(({ count, ...item }) => item)
}
```

#### 2.1.3 获取OZON周下单数据

```javascript
async function getOzonWeeklySalesData({
  skus = [],
  endDate = new Date().toISOString().split('T')[0] // 默认今天
}) {
  // 计算7天前的日期
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 7)
  const startDateStr = startDate.toISOString().split('T')[0]
  
  let query = supabase
    .from('ozon_product_sales')
    .select('SKU, orderscount, Day')
    .gte('Day', startDateStr)
    .lte('Day', endDate)
  
  // 添加SKU筛选
  if (skus.length > 0) {
    query = query.in('SKU', skus)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching OZON weekly sales data:', error)
    return []
  }
  
  // 按SKU分组汇总周订单数
  const weeklyData = data.reduce((acc, item) => {
    const existingItem = acc.find(i => i.SKU === item.SKU)
    
    if (existingItem) {
      existingItem.weekly_orders += item.orderscount || 0
    } else {
      acc.push({
        SKU: item.SKU,
        weekly_orders: item.orderscount || 0
      })
    }
    
    return acc
  }, [])
  
  return weeklyData
}
```

### 2.2 WB数据查询

#### 2.2.1 获取WB产品列表

```javascript
async function getWbProducts() {
  const { data, error } = await supabase
    .from('wb_product_sales')
    .select('SKU, Name')
    .distinct('SKU')
  
  if (error) {
    console.error('Error fetching WB products:', error)
    return []
  }
  
  return data || []
}
```

#### 2.2.2 获取WB产品销售数据

```javascript
async function getWbSalesData({
  skus = [],
  startDate,
  endDate,
  groupByDay = true
}) {
  let query = supabase
    .from('wb_product_sales')
    .select('*')
  
  // 添加SKU筛选
  if (skus.length > 0) {
    query = query.in('SKU', skus)
  }
  
  // 添加日期筛选
  if (startDate) {
    query = query.gte('Day', startDate)
  }
  
  if (endDate) {
    query = query.lte('Day', endDate)
  }
  
  // 执行查询
  const { data, error } = await query.order('Day', { ascending: false })
  
  if (error) {
    console.error('Error fetching WB sales data:', error)
    return []
  }
  
  // 计算额外字段
  const processedData = data.map(item => ({
    ...item,
    // 计算下单率
    conversion_rate: item.addtocartcount > 0 ? item.orderscount / item.addtocartcount : 0
  }))
  
  // 如果不需要按天分组，则返回原始数据
  if (groupByDay) {
    return processedData
  }
  
  // 按SKU分组汇总数据
  const groupedData = processedData.reduce((acc, item) => {
    const existingItem = acc.find(i => i.SKU === item.SKU)
    
    if (existingItem) {
      existingItem.opencardcount += item.opencardcount || 0
      existingItem.addtocartcount += item.addtocartcount || 0
      existingItem.orderscount += item.orderscount || 0
      existingItem.orderssumrub += item.orderssumrub || 0
      existingItem.cancelcount += item.cancelcount || 0
      existingItem.returnedcount += item.returnedcount || 0
      // 更新计算字段
      existingItem.addtocartpercent = existingItem.opencardcount > 0 ? existingItem.addtocartcount / existingItem.opencardcount : 0
      existingItem.conversion_rate = existingItem.addtocartcount > 0 ? existingItem.orderscount / existingItem.addtocartcount : 0
      // 取平均位置
      existingItem.Position = (existingItem.Position * existingItem.count + item.Position) / (existingItem.count + 1)
      existingItem.count += 1
    } else {
      acc.push({
        ...item,
        count: 1
      })
    }
    
    return acc
  }, [])
  
  return groupedData.map(({ count, ...item }) => item)
}
```

#### 2.2.3 获取WB周下单数据

```javascript
async function getWbWeeklySalesData({
  skus = [],
  endDate = new Date().toISOString().split('T')[0] // 默认今天
}) {
  // 计算7天前的日期
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 7)
  const startDateStr = startDate.toISOString().split('T')[0]
  
  let query = supabase
    .from('wb_product_sales')
    .select('SKU, orderscount, Day')
    .gte('Day', startDateStr)
    .lte('Day', endDate)
  
  // 添加SKU筛选
  if (skus.length > 0) {
    query = query.in('SKU', skus)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching WB weekly sales data:', error)
    return []
  }
  
  // 按SKU分组汇总周订单数
  const weeklyData = data.reduce((acc, item) => {
    const existingItem = acc.find(i => i.SKU === item.SKU)
    
    if (existingItem) {
      existingItem.weekly_orders += item.orderscount || 0
    } else {
      acc.push({
        SKU: item.SKU,
        weekly_orders: item.orderscount || 0
      })
    }
    
    return acc
  }, [])
  
  return weeklyData
}
```

### 2.3 综合数据查询

#### 2.3.1 获取所有产品列表

```javascript
async function getAllProducts() {
  // 获取OZON产品
  const ozonProducts = await getOzonProducts()
  
  // 获取WB产品
  const wbProducts = await getWbProducts()
  
  // 合并产品列表并去重
  const allProducts = [...ozonProducts, ...wbProducts]
  const uniqueProducts = allProducts.reduce((acc, product) => {
    if (!acc.find(p => p.SKU === product.SKU)) {
      acc.push(product)
    }
    return acc
  }, [])
  
  return uniqueProducts
}
```

#### 2.3.2 获取综合销售数据

```javascript
async function getCombinedSalesData({
  skus = [],
  startDate,
  endDate,
  groupByDay = true
}) {
  // 获取OZON数据
  const ozonData = await getOzonSalesData({
    skus,
    startDate,
    endDate,
    groupByDay
  })
  
  // 获取WB数据
  const wbData = await getWbSalesData({
    skus,
    startDate,
    endDate,
    groupByDay
  })
  
  // 为数据添加平台标识
  const taggedOzonData = ozonData.map(item => ({
    ...item,
    platform: 'OZON'
  }))
  
  const taggedWbData = wbData.map(item => ({
    ...item,
    platform: 'WB'
  }))
  
  // 合并数据
  const combinedData = [...taggedOzonData, ...taggedWbData]
  
  // 如果需要按天分组，则直接返回合并数据
  if (groupByDay) {
    return combinedData
  }
  
  // 按SKU分组汇总数据
  const groupedData = combinedData.reduce((acc, item) => {
    const existingItem = acc.find(i => i.SKU === item.SKU)
    
    if (existingItem) {
      existingItem.opencardcount += item.opencardcount || 0
      existingItem.addtocartcount += item.addtocartcount || 0
      existingItem.orderscount += item.orderscount || 0
      existingItem.orderssumrub += item.orderssumrub || 0
      existingItem.cancelcount += item.cancelcount || 0
      existingItem.returnedcount += item.returnedcount || 0
      // 更新计算字段
      existingItem.addtocartpercent = existingItem.opencardcount > 0 ? existingItem.addtocartcount / existingItem.opencardcount : 0
      existingItem.conversion_rate = existingItem.addtocartcount > 0 ? existingItem.orderscount / existingItem.addtocartcount : 0
      existingItem.count += 1
    } else {
      acc.push({
        ...item,
        count: 1
      })
    }
    
    return acc
  }, [])
  
  return groupedData.map(({ count, ...item }) => item)
}
```

#### 2.3.3 获取综合周下单数据

```javascript
async function getCombinedWeeklySalesData({
  skus = [],
  endDate = new Date().toISOString().split('T')[0] // 默认今天
}) {
  // 获取OZON周数据
  const ozonWeeklyData = await getOzonWeeklySalesData({
    skus,
    endDate
  })
  
  // 获取WB周数据
  const wbWeeklyData = await getWbWeeklySalesData({
    skus,
    endDate
  })
  
  // 为数据添加平台标识
  const taggedOzonData = ozonWeeklyData.map(item => ({
    ...item,
    platform: 'OZON'
  }))
  
  const taggedWbData = wbWeeklyData.map(item => ({
    ...item,
    platform: 'WB'
  }))
  
  // 合并数据
  const combinedData = [...taggedOzonData, ...taggedWbData]
  
  // 按SKU分组汇总周订单数
  const groupedData = combinedData.reduce((acc, item) => {
    const existingItem = acc.find(i => i.SKU === item.SKU)
    
    if (existingItem) {
      existingItem.weekly_orders += item.weekly_orders || 0
    } else {
      acc.push({
        SKU: item.SKU,
        weekly_orders: item.weekly_orders || 0
      })
    }
    
    return acc
  }, [])
  
  return groupedData
}
```

## 3. 数据处理工具函数

### 3.1 日期处理函数

```javascript
// 获取过去N天的日期范围
function getDateRange(days) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

// 格式化日期显示
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
```

### 3.2 数据格式化函数

```javascript
// 格式化数字显示（添加千位分隔符）
function formatNumber(num) {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 格式化百分比显示
function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`
}

// 格式化金额显示
function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(value)
}
```

### 3.3 数据转换函数

```javascript
// 将数据转换为ECharts折线图格式
function convertToLineChartData(data, metrics) {
  // 按日期分组
  const groupedByDate = data.reduce((acc, item) => {
    const date = item.Day
    if (!acc[date]) {
      acc[date] = {}
    }
    
    metrics.forEach(metric => {
      if (!acc[date][metric]) {
        acc[date][metric] = 0
      }
      acc[date][metric] += item[metric] || 0
    })
    
    return acc
  }, {})
  
  // 转换为ECharts格式
  const dates = Object.keys(groupedByDate).sort()
  
  return {
    xAxis: dates.map(formatDate),
    series: metrics.map(metric => ({
      name: metric,
      data: dates.map(date => groupedByDate[date][metric] || 0)
    }))
  }
}

// 将数据转换为ECharts漏斗图格式
function convertToFunnelData(data) {
  // 汇总数据
  const summary = data.reduce(
    (acc, item) => {
      acc.impressions += item.showcount || 0
      acc.clicks += item.opencardcount || 0
      acc.addToCart += item.addtocartcount || 0
      acc.orders += item.orderscount || 0
      return acc
    },
    { impressions: 0, clicks: 0, addToCart: 0, orders: 0 }
  )
  
  // OZON漏斗（包含曝光）
  const ozonFunnel = [
    { value: summary.impressions, name: '曝光' },
    { value: summary.clicks, name: '点击' },
    { value: summary.addToCart, name: '加购' },
    { value: summary.orders, name: '下单' }
  ]
  
  // WB漏斗（不包含曝光）
  const wbFunnel = [
    { value: summary.clicks, name: '点击' },
    { value: summary.addToCart, name: '加购' },
    { value: summary.orders, name: '下单' }
  ]
  
  return {
    ozon: ozonFunnel,
    wb: wbFunnel
  }
}
```

## 4. 数据缓存策略

### 4.1 本地缓存

使用浏览器的localStorage进行简单缓存：

```javascript
// 缓存数据到localStorage
function cacheData(key, data, expirationMinutes = 30) {
  const now = new Date()
  const item = {
    data,
    expiry: now.getTime() + expirationMinutes * 60 * 1000
  }
  localStorage.setItem(key, JSON.stringify(item))
}

// 从localStorage获取缓存数据
function getCachedData(key) {
  const itemStr = localStorage.getItem(key)
  if (!itemStr) return null
  
  const item = JSON.parse(itemStr)
  const now = new Date()
  
  // 检查是否过期
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key)
    return null
  }
  
  return item.data
}

// 使用缓存包装查询函数
async function cachedQuery(queryFn, params, cacheKey, expirationMinutes = 30) {
  // 生成缓存键
  const fullCacheKey = `${cacheKey}_${JSON.stringify(params)}`
  
  // 尝试从缓存获取
  const cachedResult = getCachedData(fullCacheKey)
  if (cachedResult) {
    return cachedResult
  }
  
  // 执行查询
  const result = await queryFn(params)
  
  // 缓存结果
  cacheData(fullCacheKey, result, expirationMinutes)
  
  return result
}
```

### 4.2 查询优化

```javascript
// 优化查询，避免重复请求
const queryCache = {}

async function optimizedQuery(queryFn, params, cacheKey) {
  // 生成缓存键
  const fullCacheKey = `${cacheKey}_${JSON.stringify(params)}`
  
  // 检查是否有进行中的相同查询
  if (queryCache[fullCacheKey]) {
    return queryCache[fullCacheKey]
  }
  
  // 创建查询Promise并缓存
  queryCache[fullCacheKey] = queryFn(params)
    .finally(() => {
      // 查询完成后删除缓存
      delete queryCache[fullCacheKey]
    })
  
  return queryCache[fullCacheKey]
}
```

## 5. 数据导出功能

### 5.1 导出为CSV

```javascript
function exportToCSV(data, filename) {
  if (!data || !data.length) {
    console.error('No data to export')
    return
  }
  
  // 获取表头
  const headers = Object.keys(data[0])
  
  // 创建CSV内容
  const csvContent = [
    headers.join(','), // 表头行
    ...data.map(row => headers.map(header => {
      // 处理包含逗号的字段
      const cell = row[header] !== null && row[header] !== undefined ? row[header] : ''
      return typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    }).join(','))
  ].join('\n')
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  // 添加到文档并触发下载
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

### 5.2 导出为Excel

使用SheetJS库导出Excel：

```javascript
import * as XLSX from 'xlsx'

function exportToExcel(data, filename) {
  if (!data || !data.length) {
    console.error('No data to export')
    return
  }
  
  // 创建工作簿
  const wb = XLSX.utils.book_new()
  
  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(data)
  
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  
  // 导出Excel文件
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
```

## 6. 错误处理策略

### 6.1 全局错误处理

```javascript
// 创建错误处理上下文
import React, { createContext, useState, useContext } from 'react'

const ErrorContext = createContext()

export function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([])
  
  // 添加错误
  const addError = (error) => {
    const id = Date.now()
    setErrors(prev => [...prev, { id, message: error.message, timestamp: new Date() }])
    
    // 5秒后自动移除错误
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== id))
    }, 5000)
  }
  
  // 移除错误
  const removeError = (id) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }
  
  // 清空所有错误
  const clearErrors = () => {
    setErrors([])
  }
  
  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  )
}

// 使用错误上下文的Hook
export function useError() {
  return useContext(ErrorContext)
}
```

### 6.2 API错误处理

```javascript
// 包装API调用的错误处理
async function safeApiCall(apiFunction, params, errorMessage) {
  try {
    return await apiFunction(params)
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw new Error(`${errorMessage}: ${error.message}`)
  }
}

// 使用示例
import { useError } from './ErrorContext'

function DataComponent() {
  const { addError } = useError()
  const [data, setData] = useState([])
  
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await safeApiCall(
          getOzonSalesData,
          { startDate: '2023-01-01', endDate: '2023-01-31' },
          '获取OZON销售数据失败'
        )
        setData(result)
      } catch (error) {
        addError(error)
      }
    }
    
    fetchData()
  }, [])
  
  // 组件渲染逻辑...
}
```

## 7. 性能优化策略

### 7.1 查询优化

- 使用分页加载大量数据
- 实现数据缓存
- 避免重复查询

### 7.2 渲染优化

- 使用React.memo避免不必要的重渲染
- 使用虚拟滚动处理长列表
- 延迟加载非关键组件

### 7.3 数据处理优化

- 在后端进行数据聚合（如果可能）
- 使用Web Worker进行复杂计算
- 实现增量更新而非全量刷新