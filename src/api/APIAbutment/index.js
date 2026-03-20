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
// 标准下拉框接口
export function getStandardList(data) {
  return request({
    url: '/system/result/push/getStandardList',
    method: 'get',
    params:data
  })
}

// 新增结果推送接口
export function addResultPush(data) {
  return request({
    url: '/system/result/push/addResultPush',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 修改结果推送接口
export function updateResultPush(data) {
  return request({
    url: '/system/result/push/updateResultPush',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除结果推送接口
export function deleteResultPush(data) {
  return request({
    url: '/system/result/push/deleteResultPush',
    method: 'post',
    data:data
  })
}

// 推送接口
export function pushResult(data) {
  return request({
    url: '/system/result/push/pushResult',
    method: 'post',
    data:data
  })
}

// 选择发布数据库接口
export function selectPublishDataBase(data) {
  return request({
    url: '/system/result/push/selectPublishDataBase',
    method: 'get',
    params:data
  })
}

// 结果推送-数据源
export function selectFieldIdByDatabaseId(data) {
  return request({
    url: '/system/result/push/selectFieldIdByDatabaseId',
    method: 'get',
    params:data
  })
}

// 结果推送-测试链接接口
export function testLink(data) {
  return request({
    url: '/system/result/push/testLink',
    method: 'post',
    data:data
  })
}