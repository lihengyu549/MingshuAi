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
    params: data
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
    url: '/system/protectTableField/updateResult',
    method: 'post',
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
// 获取数据库列表
export function getListTables (data) {
  return request({
    url: '/system/proxy/database/listTables',
    method: 'post',
    data: data,
    loading: true,
  })
}
// 数据源新增数据库--贺贺
export function saveDatabaseAndTables (data) {
  return request({
    url: '/system/proxy/database/saveDatabaseAndTables',
    method: 'post',
    data: data,
    loading: true
  })
}
// 添加数据源到任务中的下拉数据接口--贺贺
export function getScanCompleteData(params) {
  return request({
    url: '/system/proxy/getScanCompleteData',
    method: 'get',
    params: params,
  })
}

// 创建任务保存接口--贺贺
export function addScanCompleteDataTasks(params) {
  return request({
    url: '/system/proxy/addScanCompleteDataTasks',
    method: 'post',
    data: params,
  })
}
// 删除任务接口--贺贺
export function deleteScanCompleteDataTasks(data) {
  return request({
    url: `/system/proxy/deleteScanCompleteDataTasks?ids=${data}`,
    method: 'post',
    data: data,
  })
}
// 修改任务信息接口--贺贺
export function editScanCompleteDataTasks(params) {
  return request({
    url: '/system/proxy/editScanCompleteDataTasks',
    method: 'post',
    data: params,
  })
}

// 任务开始执行接口--贺贺
export function dataMark(params) {
  return request({
    url: `/system/proxy/database/dataMark?proxyIds=${params}`,
    method: 'post',
    data: params,
  })
}

// 分类分级任务列表接口（新）--贺贺
export function getTasksListByName(params) {
  return request({
    url: '/system/proxy/getTasksListByName',
    method: 'get',
    params: params,
  })
}

// 校验任务名称重复接口--贺贺
export function verifyTasksName(params) {
  return request({
    url: '/system/proxy/verifyTasksName',
    method: 'get',
    params: params,
  })
}

//结果查看分页--贺贺
export function selectResultsById (data) {
  return request({
    url: `/system/protectTableField/selectResultsById?pageNum=${data.pageNum}&pageSize=${data.pageSize}`,
    method: 'post',
    data:data,
  })
}
//取消确认勾选项--贺贺
export function cancelConfirm (ids) {
  return request({
    url: `/system/protectTableField/cancelConfirm/${ids}`,
    method: 'post',
  })
}
//取消确认过滤项--贺贺
export function cancelConfirmData (data) {
  return request({
    url: '/system/protectTableField/cancelConfirm',
    method: 'post',
    params: data
  })
}
//暂停数据任务接口--贺贺
export function pauseTask (data) {
  return request({
    url: '/system/proxy/database/pauseTask',
    method: 'post',
    data: data
  })
}
//恢复数据任务接口--贺贺
export function recoveryTask (data) {
  return request({
    url: '/system/proxy/database/recoveryTask',
    method: 'post',
    data: data
  })
}
//终止数据任务接口--贺贺
export function terminateTask (data) {
  return request({
    url: '/system/proxy/database/terminateTask',
    method: 'post',
    data: data
  })
}
//任务监控--贺贺
export function getTaskMonitoring (params) {
  return request({
    url: '/system/proxy/database/getTaskMonitoring',
    method: 'get',
    params: params
  })
}
//发布撤回接口--贺贺
export function withdrawReleaseState (params) {
  return request({
    url: '/system/proxy/database/withdrawReleaseState',
    method: 'get',
    params: params
  })
}

//任务进度查询接口--贺贺
export function taskProgressQuery (params) {
  return request({
    url: '/system/proxy/database/taskProgressQuery',
    method: 'post',
    data: params
  })
}
//发布撤回接口--贺贺
export function getCategoryAttachData (params) {
  return request({
    url: '/system/category/getCategoryAttachData',
    method: 'get',
    params: params
  })
}