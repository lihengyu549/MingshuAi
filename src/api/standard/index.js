import request from '@/utils/request'

// 标准管理列表接口
export function getStandardByList(data) {
  return request({
    url: '/system/category/getStandardByList',
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
// 校验标准名称是否重复
export function selectStandardNameVerification(data) {
  return request({
    url: '/system/category/selectStandardNameVerification',
    method: 'get',
    params:data
  })
}
// 修改分类分级标准接口
export function updateStandardById(data) {
  return request({
    url: '/system/category/updateStandardById',
    method: 'post',
    data:data
  })
}

// 删除分类分级标准接口
export function deleteStandardById(data) {
  return request({
    url: '/system/category/deleteStandardById',
    method: 'post',
    data:data
  })
}