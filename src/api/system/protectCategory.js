import request from '@/utils/request'
import {stringify} from '@/utils/ruoyi'
import qs from 'qs'

//获取分类框架列表
export function treeListI (data) {
  return request({
    url: '/system/category/list/by/parentId',
    method: 'get',
    params: data

  })
}
// 从Excel中导入分类分级数据
export function categoryImport (query) {
  return request({
    url: '/system/category/import',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data: query
  })
}

// 分页查询节点的子类数据
export function getAttachData (data) {
  return request({
    url: '/system/category/list/attach/data',
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
export function forceLogout(data) {
  return request({
    url: '/system/category/delete/attach/data',
    method: 'delete',
    headers: {
      "Content-Type":"application/x-www-form-urlencoded",
    },
    data: stringify(data)
  })
}

// 更新子类数据
export function updataAttach(query) {
  return request({
    url: '/system/category/edit/attach/data',
    method: 'post',
    params: query
  })
}
// 获取所有分类框架名称
export function getFrameworks (data) {
  return request({
    url: '/system/category/list/all/frameworks',
    method: 'get',
    params: data
  })
}
// 测试名称是否可用
export function nameTesting (data) {
  return request({
    url: '/system/category/name/testing',
    method: 'get',
    params: data
  })
}

// 增加子类数据
export function addData(data) {
  return request({
    url: '/system/category/add/attach/data',
    method: 'post',
    headers: {
      "Content-Type":"application/x-www-form-urlencoded",
    },
    data: qs.stringify(data)
  })
}

// 测试数据库名称是否重复
export function checkSourceName(data) {
  return request({
    url: '/system/proxy/checkSourceName',
    method: 'get',
    params: data
  })
}


// 测试名称是否可用
export function listTableByProject (data) {
  return request({
    url: '/system/protectTableField/listTableByProject?databaseId='+data.databaseId+'&databaseName='+data.databaseName,
    method: 'get',
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
