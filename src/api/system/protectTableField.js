import request from '@/utils/request'


//获取分类框架列表
export function getDatabaseList (data) {
  return request({
    url: '/system/protectTableField/getDatabaseList',
    method: 'get',
    params: data

  })
}
// API获取打标结果
export function getDatabaseSource (query) {
  return request({
    url: `/system/protectTableField/getDatabaseSource?projectId=${query}`,
    method: 'get',
  })
}
// 列表数据-分页、搜索
export function listByPublished (data) {
  return request({
    url: `/system/protectTableField/listByPublished`,
    method: 'get',
    params: data
  })
}
// 列表数据-导出Excel
export function exportReport (data) {
  return request({
    url: `/system/protectTableField/exportReport`,
    method: 'get',
    params: data,
    responseType: 'blob' //响应数据格式配置
  })
}
// --------------------------------
//列表
export function protectTableFieldList (query) {
  return request({
    url: '/system/protectTableField/list',
    method: 'get',
    params: query,

  })
}
//导出
// export function exportReport (query) {
//   return request({
//     url: '/system/protectTableField/exportReport',
//     method: 'get',
//     params: query,

//   })
// }
// 查询数据库字段名列表
export function listProtectTableField (query) {
  return request({
    url: '/system/protectTableField/list',
    method: 'get',
    params: query,

  })
}

// 查询数据库字段名详细
export function getProtectTableField (id) {
  return request({
    url: '/system/protectTableField/' + id,
    method: 'get',
  })
}

// 新增数据库字段名
export function addProtectTableField (data) {
  return request({
    url: '/system/protectTableField',
    method: 'post',
    data: data,
  })
}

// 修改数据库字段名
export function updateProtectTableField (data) {
  return request({
    url: '/system/protectTableField/editRule',
    method: 'put',
    data: data,
  })
}

// 删除数据库字段名
export function delProtectTableField (id) {
  return request({
    url: '/system/protectTableField/' + id,
    method: 'delete',
  })
}
/**
 * 根据项目id查询表名列表
 * @param {*} params 
 */
export function listTableByProject (params) {
  return request({
    url: `/system/protectTableField/listTableByProject?databaseId=${params.databaseId}&tableName=${params.tableName}`,
    method: 'get',
  })
}

/**
 * 打标信息检索行业类别列表
 */

export function getProtectCategoryI (data) {
  return request({
    url: '/system/protectCategory/search',
    method: 'get',
    params: data,
    loading: true,

  })
}


/**
 * 打标信息检索打标规则列表
 */
export function getProtectSensitiveRuleI (data) {
  return request({
    url: '/system/protectSensitiveRule/search',
    method: 'get',
    params: data,
    // loading: true,

  })
}
/**
 * 数据库打标
 */

export function importI (data) {
  return request({
    url: '/system/api/database/import',
    method: 'post',
    data: data,
    loading: true,
  })
}

/**
 * 测试数据库联通性
 */
export function testI (data) {
  return request({
    url: '/system/api/database/test',
    method: 'post',
    data: data,
    // loading: true,
  })
}
// 获取字段数据(示例值)
export function fieldDataI (data) {
  return request({
    url: '/system/api/field/data/',
    method: 'get',
    params: data,
    loading: true,
  })
}

//打标信息检索数据库列表
export function getDatabaseListI (data) {
  return request({
    url: '/system/protectTableField/getDatabaseList?projectId=' + data.projectId + '&databaseName=' + data.databaseName,
    method: 'get',
    // loading: true,

  })
}

//查询字段关联的API

export function queryApisI (data) {
  return request({
    url: '/system/protectTableField/queryApis',
    method: 'get',
    params: data,
    loading: true,
  })
}
