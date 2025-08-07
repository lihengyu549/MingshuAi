import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

// 数据特征
// 数据特征列表接口
export function getPageListFeature (data) {
  return request({
    url: '/system/feature/getPageListFeature',
    method: 'get',
    params: data
  })
}

// 数据特征新增接口
export function addFeature(data) {
  return request({
    url: '/system/feature/addFeature',
    method: 'post',
    data: data
  })
}