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