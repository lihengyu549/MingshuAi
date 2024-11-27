import request from '@/utils/request'

// 查询行业分类列表
export function listProtectCategory (query) {
  return request({
    url: '/system/protectCategory/list',
    method: 'get',
    params: query
  })
}

// 查询行业分类详细
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

//行业分类树列表
export function treeListI (data) {
  return request({
    url: '/system/protectCategory/treeList',
    method: 'get',
    params: data

  })
}

// 行业列表插入
export function insertCategoryTreeI (data) {
  return request({
    url: '/system/protectCategory/insertCategoryTree',
    method: 'post',
    data: data
  })
}
