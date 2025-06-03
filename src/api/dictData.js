import request from '@/utils/request'

// 获取字典
export function listByDataType (data) {
  return request({
    url: '/system/dict/data/listByDataType',
    method: 'get',
    params: data
  })
}