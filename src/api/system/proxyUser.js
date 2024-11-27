import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'


// 查询数据代理用户列表
export function listProxyUser(query) {
  return request({
    url: '/system/proxy/users/list',
    method: 'get',
    params: query
  })
}

// 查询数据代理用户详细
export function getProxyUser(id) {
  return request({
    url: '/system/proxy/users/' + id,
    method: 'get'
  })
}

// 新增数据代理用户
export function addProxyUser(data) {
  return request({
    url: '/system/proxy/users',
    method: 'post',
    data: data
  })
}

// 修改数据代理用户
export function updateProxyUser(data) {
  return request({
    url: '/system/proxy/users/update',
    method: 'post',
    data: data,
    loading: true,
  })
}

// 删除数据代理用户
export function delProxyUser(id) {
  return request({
    url: '/system/proxy/users/delete?id=' + id,
    method: 'post', 
    loading: true,
  })
}

//改变用户状态
export function statusI(data) {
  return request({
    url: '/system/proxy/users/status',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}

//数据库列表查询
export function searchDatabaseI(data) {
  return request({
    url: '/system/proxy/searchDatabase?name='+ data.name,
    method: 'get',
    // params:data
  })
}

//增加用户
export function usersAddI(data) {
  return request({
    url: '/system/proxy/users/add',
    method: 'post',
    data: data,
    loading: true,
  })
}
