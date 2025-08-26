/**
 * 格式化日期为YYYY-MM-DD格式
 * @param {Date|string} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 格式化数字为千分位格式
 * @param {number} num - 要格式化的数字
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 格式化百分比
 * @param {number} value - 要格式化的值（0-100）
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * 格式化货币
 * @param {number} value - 要格式化的值
 * @param {string} currency - 货币符号，默认为卢布
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (value, currency = '₽') => {
  if (value === null || value === undefined) return `0 ${currency}`;
  return `${formatNumber(value)} ${currency}`;
};

/**
 * 格式化周日期范围
 * @param {string} startDate - 周开始日期
 * @param {string} endDate - 周结束日期
 * @returns {string} 格式化后的周日期范围
 */
export const formatWeekRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();
  
  return `${startMonth}.${startDay}-${endMonth}.${endDay}`;
};