import request from '@/utils/request'

// 获取服务信息
export function getServer() {
  return request({
    url: '/system/server/info',
    method: 'get'
  })
}

// 首页数据统计

export function getStatisticsI() {
  return request({
    url: '/system/server/info/getStatistics',
    method: 'get'
  })
}
