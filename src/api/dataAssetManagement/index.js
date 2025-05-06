import request from '@/utils/request'

// 标准管理列表接口
export function listDatabaseProxysScan(data) {
  return request({
    url: '/system/proxyScan/listDatabaseProxysScan',
    method: 'get',
    params:data
  })
}
// 导入分类分级标准数据
export function categoryImport(data) {
  return request({
    url: '/system/category/import',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:data
  })
}
// 校验标准名称是否重复
export function selectStandardNameVerification(data) {
  return request({
    url: '/system/category/selectStandardNameVerification',
    method: 'get',
    params:data
  })
}
// 修改分类分级标准接口
export function updateStandardById(data) {
  return request({
    url: '/system/category/updateStandardById',
    method: 'post',
    data:data
  })
}

// 删除分类分级标准接口
export function deleteStandardById(data) {
  return request({
    url: '/system/category/deleteStandardById',
    method: 'post',
    data:data
  })
}


// ---------------- 标准配置接口 -----------------

// 新增子类数据
export function addAttachData(data) {
  return request({
    url: '/system/category/addAttachData',
    method: 'post',
    data:data
  })
} 

// 修改子类数据
export function editAttachData(data) {
  return request({
    url: '/system/category/editAttachData',
    method: 'post',
    data:data
  })
} 

// 获取用户列表
export function selectUserListAll(data) {
  return request({
    url: '/system/user/selectUserListAll',
    method: 'get',
    params:data
  })
}
// 删除子类数据
export function deleteAttachData(data) {
  return request({
    url: '/system/category/delete/attach/data',
    method: 'delete',
    params:data
  })
}

// ---------------数据源发现-----------------
// 新增数据源扫描任务
export function addDatabaseProxysScan(data) {
  return request({
    url: '/system/proxyScan/addDatabaseProxysScan',
    method: 'post',
    data:data
  })
} 
// 修改数据源扫描任务
export function updateDatabaseProxysScan(data) {
  return request({
    url: '/system/proxyScan/updateDatabaseProxysScan',
    method: 'post',
    data:data
  })
} 
// 删除数据源接口
export function deleteDatabaseProxysScan(data) {
  return request({
    url: '/system/proxyScan/deleteDatabaseProxysScan',
    method: 'post',
    data:data
  })
} 
// 立即执行扫描
export function scanIpAndPort(data) {
  return request({
    url: '/system/proxyScan/scanIpAndPort',
    method: 'post',
    data:data
  })
} 

// 修改数据源扫描任务
export function updateDatabaseProxysScan(data) {
  return request({
    url: '/system/proxyScan/updateDatabaseProxysScan',
    method: 'post',
    data:data
  })
} 

// 结果查看列表接口
export function getDatabaseProxysScanItemById(data) {
  return request({
    url: '/system/proxyScan/getDatabaseProxysScanItemById',
    method: 'get',
    params:data
  })
} 