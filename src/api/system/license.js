import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

//获取授权状态
export function getServerInfosI() {
  return request({
    url: '/system/license/getServerInfos',
    method: 'get',
    loading: true,
  })
}

//设置授权文件
export function licenseSetI (data) {
  return request({
    url: '/system/license/set',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}
