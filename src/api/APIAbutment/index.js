import request from '@/utils/request'

// 获取ApiToken列表接口
export function getApiV1List(data) {
  return request({
    url: '/system/api/v1/getApiV1List',
    method: 'get',
    params:data
  })
}
// // 导入分类分级标准数据
// export function categoryImport(data) {
//   return request({
//     url: '/system/category/import',
//     method: 'post',
//     headers: {
//       "Content-Type":"multipart/form-data; ",
//     },
//     data:data
//   })
// }
// 新增ApiToken接口
export function addApiV1(data) {
  return request({
    url: '/system/api/v1/addApiV1',
    method: 'post',
    data:data
  })
}
// 修改ApiToken接口
export function updateApiV1(data) {
  return request({
    url: '/system/api/v1/updateApiV1',
    method: 'post',
    data:data
  })
}
// 删除ApiToken接口
export function deleteApiV1(data) {
  return request({
    url: '/system/api/v1/deleteApiV1',
    method: 'post',
    data:data
  })
}
// 更新获取token
export function generateToken(data) {
  return request({
    url: '/system/api/v1/generateToken',
    method: 'get',
    params:data
  })
}
// 结果推送列表接口
export function getResultPushList(data) {
  return request({
    url: '/system/result/push/getResultPushList',
    method: 'get',
    params:data
  })
}
