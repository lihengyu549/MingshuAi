import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'


// 查询api信息列表
export function listApi (query) {
  return request({
    url: '/system/api/list',
    method: 'get',
    params: query
  })
}

// 查询api信息详细
export function getApi (id) {
  return request({
    url: '/system/api/' + id,
    method: 'get'
  })
}

// 新增api信息
export function addApi (data) {
  return request({
    url: '/system/api',
    method: 'post',
    data: data
  })
}

// 修改api信息
export function updateApi (data) {
  return request({
    url: '/system/api',
    method: 'put',
    data: data
  })
}

// 删除api信息
export function delApi (id) {
  return request({
    url: '/system/api/' + id,
    method: 'delete'
  })
}


// 通过URl导入api
export function importDataByUrlI (data) {
  return request({
    url: '/system/api/importDataByUrl',
    method: 'post',
    data: stringify(data)
  })
}


// API导入平台列表
export function apiPlatformI () {
  return request({
    url: '/system/apiPlatform/list',
    method: 'get',
  })
}


// 查询API关联的查询字段和级别(关联字段)
export function levelApi (data) {
  return request({
    url: '/system/api/list/level',
    method: 'get',
    params: data
  })
}

// api修改备注

export function modifyRemarkI (data) {
  return request({
    url: '/system/api/modifyRemark',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}
