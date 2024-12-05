import request from '@/utils/request'
import qs from 'qs'

//获取分类框架列表
export function treeListI (data) {
  return request({
    url: '/ruoyi-system/category/list/all',
    method: 'get',
    params: data

  })
}
// 从Excel中导入分类分级数据
export function categoryImport (query) {
  return request({
    url: '/category/import',
    method: 'post',
    params: query
  })
}

// 分页查询节点的子类数据
export function getAttachData (data) {
  return request({
    url: '/ruoyi-system/category/list/attach/data',
    method: 'get',
    params: data
  })
}

// 停用/启用
export function attachStatus(data) {
  return request({
    url: '/ruoyi-system/category/change/attach/status',
    method: 'post',
    headers: {
      "Content-Type":"application/x-www-form-urlencoded",
    },
    data: qs.stringify(data)
  })
}

// 删除子类数据
export function forceLogout() {
  return request({
    url: '/category/delete/attach/data',
    method: 'delete'
  })
}

// 更新子类数据
export function updataAttach(query) {
  return request({
    url: '/ruoyi-system/category/edit/attach/data',
    method: 'post',
    params: query
  })
}

// 测试名称是否可用
export function nameTesting (data) {
  return request({
    url: '/category/name/testing',
    method: 'get',
    params: data
  })
}

// 增加子类数据
export function addData(data) {
  return request({
    url: '/ruoyi-system/category/add/attach/data',
    method: 'post',
    headers: {
      "Content-Type":"application/x-www-form-urlencoded",
    },
    data: qs.stringify(data)
  })
}
// -----------------------------------------

// 分页查询节点的子类数据
export function getProtectCategory (id) {
  return request({
    url: '/system/protectCategory/' + id,
    method: 'get'
  })
}

// 新增行业分类
export function addProtectCategory (data) {
  return request({
    url: '/system/protectCategory',
    method: 'post',
    data: data
  })
}

// 修改行业分类
export function updateProtectCategory (data) {
  return request({
    url: '/system/protectCategory',
    method: 'put',
    data: data
  })
}

// 删除行业分类
export function deleteCategoryTree (id) {
  return request({
    url: '/system/protectCategory/deleteCategoryTree/' + id,
    method: 'delete'
  })
}

// //行业分类树列表
// export function treeListI (data) {
//   return request({
//     url: '/category/list/all',
//     method: 'get',
//     params: data

//   })
// }

// 行业列表插入
export function insertCategoryTreeI (data) {
  return request({
    url: '/system/protectCategory/insertCategoryTree',
    method: 'post',
    data: data
  })
}
