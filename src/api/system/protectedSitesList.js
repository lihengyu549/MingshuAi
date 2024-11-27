import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

// 站点防护列表数据
export function getProtectionSiteListI (data) {
  return request({
    url: '/system/protect/getProtectionSiteList',
    method: 'get',
    params: data,
    loading: true,
  })
}
//获取站点防护日志
export function getProtectionSitLogI (data) {
  return request({
    url: '/system/protect/getProtectionSitLog',
    method: 'get',
    params: data,
    loading: true,
  })
}

//添加IP黑名单
export function addBlackIpI (data) {
  return request({
    url: '/system/protect/addBlackIp',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}

//获取IP黑名单
export function getBlackIpListI () {
  return request({
    url: '/system/protect/getBlackIpList',
    method: 'get',
    loading: true,
  })
}

//删除IP黑名单
export function deleteBlackIpI (data) {
  return request({
    url: '/system/protect/deleteBlackIp',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}


//清空IP黑名单
export function clearBlackIpI () {
  return request({
    url: '/system/protect/clearBlackIp',
    method: 'post',
    loading: true,
  })
}

//获取URL白名单
export function getWhiteUrlListI () {
  return request({
    url: '/system/protect/getWhiteUrlList',
    method: 'get',
    loading: true,
  })
}
//删除url白名单
export function deleteWhiteUrlI (data) {
  return request({
    url: '/system/protect/deleteWhiteUrl',
    method: 'post',
    data: stringify(data),
    loading: true,
  })
}

//清空url白名单
export function clearWhiteUrlI () {
  return request({
    url: '/system/protect/clearWhiteUrl',
    method: 'post',
    loading: true,
  })
}
