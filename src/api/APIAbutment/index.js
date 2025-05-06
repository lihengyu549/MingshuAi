import request from '@/utils/request'

// 标准管理列表接口
export function listDatabaseProxysScan(data) {
  return request({
    url: '/system/proxyScan/listDatabaseProxysScan',
    method: 'get',
    params:data
  })
}
// 导入分类分级标准数据
export function categoryImport(data) {
  return request({
    url: '/system/category/import',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:data
  })
}
// 新增分类分级标准接口
export function updateStandardById(data) {
  return request({
    url: '/system/category/updateStandardById',
    method: 'post',
    data:data
  })
}
