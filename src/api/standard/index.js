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
    url: '/system/category/importNew',
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


// ---------------- 标准配置接口 -----------------

// 新增子类数据
export function addAttachData(data) {
  return request({
    url: '/system/category/addAttachData',
    method: 'post',
    data:data
  })
} 

// 修改子类数据
export function editAttachData(data) {
  return request({
    url: '/system/category/editAttachData',
    method: 'post',
    data:data
  })
} 

// 获取用户列表
export function selectUserListAll(data) {
  return request({
    url: '/system/user/selectUserListAll',
    method: 'get',
    params:data
  })
}
// 删除子类数据
export function deleteAttachData(data) {
  return request({
    url: '/system/category/delete/attach/data',
    method: 'delete',
    params:data
  })
}
// 左侧树新增接口
export function addCategory(data) {
  return request({
    url: '/system/category/addCategory',
    method: 'post',
    data:data
  })
} 
// 左侧树修改接口
export function updateCategory(data) {
  return request({
    url: '/system/category/updateCategory',
    method: 'post',
    data:data
  })
} 

// 左侧树删除接口
export function deleteCategory(data) {
  return request({
    url: '/system/category/deleteCategory',
    method: 'post',
    data:data
  })
} 