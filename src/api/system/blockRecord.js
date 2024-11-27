import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

// 查询项目列表详细
export function getBlockListI (data) {
  return request({
    url: '/system/protect/getBlockList?page='+data.page+'&pageSize='+data.pageSize+'&ip='+data.ip+'&serachUrl='+data.serachUrl+'&userAgent='+data.userAgent,
    method: 'get',
    loading: true,
  })
}
//解封ip
export function unlockIPI (data) {
  return request({
    url: '/system/protect/unlockIP',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}

export function lockIpI (data) {
  return request({
    url: '/system/protect/lockIp',
    method: 'post',
    data:stringify(data),
    loading: true,
  })
}

//添加url白名单
export function addWhiteUrlI (data) {
  return request({
    url: '/system/protect/addWhiteUrl',
    method: 'post',
    data:stringify(data),
    loading: true
  })
}
