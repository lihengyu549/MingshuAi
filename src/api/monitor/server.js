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
// 获取参考标准接口
export function getReferenceStandard(params) {
  return request({
    url: '/system/server/info/getReferenceStandard',
    method: 'get',
    params: params,
  })
}

// 获取数据库统计接口

export function getDatabaseStatistics(params) {
  return request({
    url: '/system/server/info/getDatabaseStatistics',
    method: 'get',
    params: params,
  })
}
