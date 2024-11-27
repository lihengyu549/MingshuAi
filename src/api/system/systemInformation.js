import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

//获取授权状态
export function licenseVerifyI () {
  return request({
    url: '/system/license/verify',
    method: 'get',
    loading: true,
  })
}
