import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'


// 查询数据库代理列表
export function listProxys (query) {
  return request({
    url: '/system/proxy/list',
    method: 'get',
    params: query
  })
}
// 查询数据库代理详细
export function getProxys (id) {
  return request({
    url: '/system/proxy/' + id,
    method: 'get'
  })
}

// 新增数据库代理
export function addProxys (data) {
  return request({
    url: '/system/proxy',
    method: 'post',
    data: data
  })
}

// 执行
export function databaseMask (data) {
  return request({
    url: '/system/proxy/database/mask',
    method: 'post',
    data: stringify(data)
  })
}

// 确认过滤项
export function confirmList (data) {
  return request({
    url: '/system/protectTableField/confirmList',
    method: 'post',
    data: stringify(data)
  })
}
// 确认勾选项
export function confirmIds (data) {
  return request({
    url: '/system/protectTableField/confirm/'+ data,
    method: 'post',
  })
}
// 修改
export function updateFiledRule (data) {
  return request({
    url: '/system/protectTableField/updateFiledRule',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}
/**
 * 测试数据库联通性
 */
export function connectTestI (data) {
  return request({
    url: '/system/api/database/test',
    method: 'post',
    data: data,
    loading: true,
  })
}
// 创建数据库代理
export function createProxys (data) {
  return request({
    url: '/system/proxy/create',
    method: 'post',
    data: data,
    loading: true
  })
}

// 修改数据库代理
export function updateProxys (data) {
  return request({
    url: '/system/proxy',
    method: 'put',
    data: data
  })
}

// 删除数据库代理
export function delProxys (ids) {
  return request({
    url: '/system/proxy/' + ids,
    method: 'delete',
    loading: true,
  })
}

//启动数据库代理
export function startI (data) {
  return request({
    url: '/system/proxy/start',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}
//停止代理数据库
export function stopI (data) {
  return request({
    url: '/system/proxy/stop',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}
//数据库打标
export function databaseMaskI (data) {

  return request({
    url: '/system/proxy/database/mask',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}

// 策略下发
export function strategyPushI (data) {
  return request({
    url: '/system/proxy/policy/push',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}

//策略一键下发
export function strategyAll () {
  return request({
    url: '/system/proxy/policy/push/all',
    method: 'get',
    loading: true,
  })
}

// 获取数据库列表
export function databaseListI (data) {
  return request({
    url: '/system/proxy/database/list',
    method: 'post',
    data: data,
    loading: true,
  })
}
// 新增Execl文件
export function importExcel (data) {
  return request({
    url: '/system/datasource/import',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data: data,
  })
}
// 新增Execl文件
export function publish (id) {
  return request({
    url: '/system/proxy/publish/' + id,
    method: 'post',
  })
}
//结果查看分页
export function protectTableFieldList (data) {
  return request({
    url: '/system/protectTableField/list',
    method: 'get',
    params:data,
  })
}
