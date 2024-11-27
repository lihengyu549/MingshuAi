import request from '@/utils/request'

// 查询脱敏规则列表
export function listProxyRule(query) {
  return request({
    url: '/system/proxy/mask/list',
    method: 'get',
    params: query
  })
}

// 查询脱敏规则详细
export function getProxyRule(id) {
  return request({
    url: '/system/proxy/mask/' + id,
    method: 'get'
  })
}

// 新增脱敏规则
export function addProxyRule(data) {
  return request({
    url: '/system/proxy/mask',
    method: 'post',
    data: data
  })
}

// 修改脱敏规则
export function updateProxyRule(data) {
  return request({
    url: '/system/proxy/mask',
    method: 'put',
    data: data
  })
}

// 删除脱敏规则
export function delProxyRule(id) {
  return request({
    url: '/system/proxy/mask/' + id,
    method: 'delete'
  })
}
