import request from '@/utils/request'

// 查询打标规则列表
export function listProtectSensitiveRule (query) {
  return request({
    url: '/system/protectSensitiveRule/list',
    method: 'get',
    params: query,
  })
}

// 查询打标规则详细
export function getProtectSensitiveRule (id) {
  return request({
    url: '/system/protectSensitiveRule/' + id,
    method: 'get',
  })
}

// 新增打标规则
export function addProtectSensitiveRule (data) {
  return request({
    url: '/system/protectSensitiveRule',
    method: 'post',
    data: data,
  })
}

// 修改打标规则
export function updateProtectSensitiveRule (data) {
  return request({
    url: '/system/protectSensitiveRule',
    method: 'put',
    data: data,
  })
}

// 删除打标规则
export function delProtectSensitiveRule (id) {
  return request({
    url: '/system/protectSensitiveRule/' + id,
    method: 'delete',
    loading: true,
  })
}


// 清空打标规则
export function markingClearI () {
  return request({
    url: '/system/protectSensitiveRule/clear',
    method: 'post',
    loading: true,
  })
}
