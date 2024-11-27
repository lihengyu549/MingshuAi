import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

// 查询项目列表列表
export function listProject (query) {
  return request({
    url: '/system/project/list',
    method: 'get',
    params: query
  })
}

export function listAllProject (query) {
  return request({
    url: '/system/project/listAllProject',
    method: 'get',
    params: query
  })
}
// 查询项目列表详细
export function getProject (id) {
  return request({
    url: '/system/project/' + id,
    method: 'get'
  })
}

// 新增项目列表
export function addProject (data) {
  return request({
    url: '/system/project',
    method: 'post',
    data: data
  })
}

// 修改项目列表
export function updateProject (data) {
  return request({
    url: '/system/project',
    method: 'put',
    data: data,
    loading: true,
  })
}

// 删除项目列表
export function delProject (id) {
  return request({
    url: '/system/project/' + id,
    method: 'delete',
    loading: true,
  })
}

// 安全策略分组统计(打标统计)
export function groupI (data) {
  return request({
    url: '/system/api/security/group',
    method: 'get',
    params: data,
  })
}

// 开启站点防护（首次）
export function enableSecurityI (data) {
  return request({
    url: '/system/protect/enableSecurity',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}

// 切换站点防护状态（非首次）
export function protectionSwitchI (data) {
  return request({
    url: '/system/protect/protectionSwitch',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}


//一键删除API
export function delApi (data) {
  return request({
    url: '/system/api/delete/all',
    method: 'delete',
    data: stringify(data),
    loading: true,
  })
}
