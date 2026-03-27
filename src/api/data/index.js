import request from '@/utils/request'

// 数据大屏接口
export function getDataBigScreen(data) {
  return request({
    url: '/system/server/info/getDataBigScreen',
    method: 'get',
    params:data
  })
}
// 数据大屏接口——数据分类分布
export function getDataClassDistribution(data) {
  return request({
    url: '/system/server/info/getDataClassDistribution',
    method: 'get',
    params:data
  })
}
// 数据大屏接口-数据分类分布-下拉框
export function getFieldMaxStandard(data) {
  return request({
    url: '/system/server/info/getFieldMaxStandard',
    method: 'get',
    params:data
  })
}

// 分类分级报告查询接口
export function listNew(data) {
  return request({
    url: '/system/dashboard/listNew',
    method: 'get',
    params:data
  })
}

// 分类分级-分级方案-下拉查询
export function getCategorySchemaListAll() {
  return request({
    url: '/system/categorySchema/getCategorySchemaListAll',
    method: 'get'
  })
}

// 分类分级-安全分级-下拉查询
export function getCategorySchemaLevelList(data) {
  return request({
    url: '/system/categorySchema/getCategorySchemaLevelList',
    method: 'get',
    params:data
  })
}