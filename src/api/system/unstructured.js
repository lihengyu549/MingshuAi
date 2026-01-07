import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'


// 非结构化数据分类分级任务新增（新）
export function addScanCompleteDataTasksByFile(params) {
  return request({
    url: `/system/proxy/addScanCompleteDataTasksByFile`,
    method: 'post',
    data: params,
  })
}

// 非结构化数据分类分级任务修改（新）
export function editScanCompleteDataByFile(params) {
  return request({
    url: `/system/proxy/editScanCompleteDataByFile`,
    method: 'post',
    data: params,
  })
}

// 非结构化数据分类分级任务删除（新）
export function selectFileResult(params) {
  return request({
    url: `/system/projectFile/selectFileResult`,
    method: 'post',
    data: params,
  })
}

// 资产目录—非结构化（新）
export function getProjectFileList(params) {
  return request({
    url: `/system/projectFile/getProjectFileList`,
    method: 'post',
    data: params,
  })
}

// 分类分级框架-结果查看-确认过滤项
export function confirmListByFile(params) {
  return request({
    url: `/system/projectFile/confirmListByFile`,
    method: 'post',
    data: params,
  })
}

// 分类分级框架-结果查看-取消过滤项
export function cancelConfirmByFile(params) {
  return request({
    url: `/system/projectFile/cancelConfirmByFile`,
    method: 'post',
    data: params,
  })
}

// 分类分级框架-结果查看-结果修改/批量修改
export function updateResultByFile(params) {
  return request({
    url: `/system/projectFile/updateResultByFile`,
    method: 'post',
    data: params,
  })
}

// 分类分级框架-结果查看-查询上一条/下一条数据
export function selectLastOrNextByFileId(params) {
  return request({
    url: `/system/projectFile/selectLastOrNextByFileId?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
    method: 'post',
    data: params,
  })
}