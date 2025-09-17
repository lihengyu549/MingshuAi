import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'
import qs from 'qs'

//获取分类框架列表
export function treeListI(data) {
  return request({
    url: '/system/category/list/by/parentId',
    method: 'get',
    params: data

  })
}
// 从Excel中导入分类分级数据
export function categoryImport(query) {
  return request({
    url: '/system/category/import',
    method: 'post',
    headers: {
      "Content-Type": "multipart/form-data; ",
    },
    data: query
  })
}

// 分页查询节点的子类数据
export function getAttachData(data) {
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
      "Content-Type": "application/x-www-form-urlencoded",
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
      "Content-Type": "application/x-www-form-urlencoded",
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
export function getFrameworks(data) {
  return request({
    url: '/system/category/list/all/frameworks',
    method: 'get',
    params: data
  })
}
// 测试名称是否可用
export function nameTesting(data) {
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
      "Content-Type": "application/x-www-form-urlencoded",
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
export function listTableByProject(data) {
  return request({
    url: '/system/protectTableField/listTableByProject?databaseId=' + data.databaseId + '&databaseName=' + data.databaseName,
    method: 'get',
  })
}

// 分析报告
export function dashboardList(data) {
  return request({
    url: '/system/dashboard/list',
    method: 'get',
    params: data
  })
}
// -----------------------------------------

// 分页查询节点的子类数据
export function getProtectCategory(id) {
  return request({
    url: '/system/protectCategory/' + id,
    method: 'get'
  })
}

// 新增行业分类
export function addProtectCategory(data) {
  return request({
    url: '/system/protectCategory',
    method: 'post',
    data: data
  })
}

// 修改行业分类
export function updateProtectCategory(data) {
  return request({
    url: '/system/protectCategory',
    method: 'put',
    data: data
  })
}

// 删除行业分类
export function deleteCategoryTree(id) {
  return request({
    url: '/system/protectCategory/deleteCategoryTree/' + id,
    method: 'delete'
  })
}

// 行业列表插入
export function insertCategoryTreeI(data) {
  return request({
    url: '/system/protectCategory/insertCategoryTree',
    method: 'post',
    data: data
  })
}

// 扫描数据源
export function dataSacn(data) {
  return request({
    url: '/system/proxy/database/dataSacn',
    method: 'post',
    headers: {
      "Content-Type": "multipart/form-data; ",
    },
    params: data,
  })
}
// 查询指定数据源信息
export function getDatabaseAndTablesById(data) {
  return request({
    url: `/system/proxy/database/getDatabaseAndTablesById?id=${data}`,
    method: 'get',
  })
}
// 修改数据库和指定表数据

export function updateDatabaseAndTables(data) {
  return request({
    url: `/system/proxy/database/updateDatabaseAndTables`,
    method: 'post',
    data: data
  })
}
// 查询框架接口
export function getParentIdTree(parentId) {
  return request({
    url: `/system/category/list/by/parentId?parentId=${parentId}&needSub=${1}`,
    method: 'get',
  })
}
// 匹配策略列表
export function getListitem(params) {
  return request({
    url: `/system/category/list/attach/data/item`,
    method: 'get',
    params: params,
  })
}
// 新增匹配规则接口
export function addAttachDataItme(data) {
  return request({
    url: `/system/category/add/attach/data/item`,
    method: 'post',
    data: data,
  })
}
// 修改匹配规则接口
export function updateAttachDataItme(data) {
  return request({
    url: `/system/category/update/attach/data/item`,
    method: 'post',
    data: data,
  })
}

// 停用/启用
export function enableDataItem(data) {
  return request({
    url: '/system/category/enable/attach/data/item',
    method: 'post',
    data: data,
  })
}
// 删除
export function deleteDataItem(data) {
  return request({
    url: '/system/category/delete/attach/data/item',
    method: 'post',
    data: data,
  })
}

//------------------数据资产目录接口
// 获取左侧资产目录树结构
export function getAllProxys(params) {
  return request({
    url: '/system/proxy/database/proxys/getAllProxys',
    method: 'get',
    params: params,
  })
}
// 资产目录列表接口
export function getTableListByProxysId(params, body) {
  return request({
    url: '/system/protectTableField/getTableListByProxysId',
    method: 'post',
    params: params,
    data: body
  })
}
//资产目录导出接口
export function propertyCatalogueExport(data) {
  return request({
    url: '/system/protectTableField/propertyCatalogueExport',
    method: 'post',
    data: data,
    responseType: 'blob' //响应数据格式配置
  })
}


// 查看字段信息接口
export function getAllFieldListByTableIdAndDatabaseId(params) {
  return request({
    url: '/system/protectTableField/getAllFieldListByTableIdAndDatabaseId',
    method: 'get',
    params: params,
  })
}
// 校验当前子类下的规则名是否重复
export function nameRules(params) {
  return request({
    url: '/system/category/verify/attach/data/item',
    method: 'get',
    params: params,
  })
}
// 获取指定数据源下拉所有表名
export function getSelectTableNames(params) {
  return request({
    url: '/system/protectTableField/getSelectTableNames',
    method: 'get',
    params: params,
  })
}
// AI填充字段注释接口
export function callAIPaddingComments(params) {
  return request({
    url: `/system/protectTableField/callAIPaddingComments?tableId=${params.tableId}&databaseId=${params.databaseId}`,
    method: 'post',
    data: params,
  })
}
// AI填充字段注释接口
export function updateDataQualityAssessment(params) {
  return request({
    url: `/system/protectTableField/updateDataQualityAssessment?tableId=${params.tableId}&databaseId=${params.databaseId}`,
    method: 'post',
    data: params,
  })
}
// 修改字段信息接口
export function updateFieldListByFieldId(params) {
  return request({
    url: `/system/protectTableField/updateFieldListByFieldId`,
    method: 'post',
    data: params,
  })
}
// 一键AI填充字段注释接口
export function callAIPaddingCommentsByAll(params) {
  return request({
    url: `/system/protectTableField/callAIPaddingCommentsByAll`,
    method: 'post',
    data: params,
  })
}
// 一键数据质量评估接口
export function updateDataQualityAssessmentByAll(params) {
  return request({
    url: `/system/protectTableField/updateDataQualityAssessmentByAll`,
    method: 'post',
    data: params,
  })
}

//分析日志接口
export function getAnalyseLog(id) {
  return request({
    url: `/system/proxy/getAnalyseLog`,
    method: 'post',
    data: id,
  })
}

// 引用数据特征的正则数据接口
export function getFeatureItemSelect() {
  return request({
    url: `/system/feature/getFeatureItemSelect`,
    method: 'get',
  })
}

// 获取子类表格数据
export function getCategoryAttachDataRuleByParentId(data) {
  return request({
    url: `/system/category/getCategoryAttachDataRuleByParentId`,
    method: 'get',
    params: data,
  })
}

// 数据摸底  新增/修改接口
export function addOrUpdateDataFeelBottomByCategoryId(params) {
  return request({
    url: `/system/category/addOrUpdateDataFeelBottomByCategoryId`,
    method: 'post',
    data: params,
  })
}

// 数据摸底查询接口
export function getCategoryAttachDataFeelBottomByCategoryId(params) {
  return request({
    url: '/system/category/getCategoryAttachDataFeelBottomByCategoryId',
    method: 'get',
    params: params,
  })
}

// 下拉框查询接口
export function getCategoryAttachDataByCategoryIds(params) {
  return request({
    url: '/system/category/getCategoryAttachDataByCategoryId',
    method: 'get',
    params: params,
  })
}

// 数据摸底调查表
export function listDataFeelBottomSurvey(params) {
  return request({
    url: '/system/dashboard/listDataFeelBottomSurvey',
    method: 'get',
    params: params,
  })
}
