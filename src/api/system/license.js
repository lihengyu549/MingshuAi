import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

// 获取授权状态
export function getServerInfosI() {
  return request({
    url: '/system/license/getServerInfos',
    method: 'get',
    loading: true
  })
}

// 设置授权文件
export function licenseSetI(data) {
  return request({
    url: '/system/license/set',
    method: 'post',
    data: stringify(data),
    loading: true
  })
}

// 分析授权文件
export function licenseAnalysisI(formData, onUploadProgress) {
  return request({
    url: '/system/license/analysis',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress,
    loading: true
  })
}

// 上传并激活授权文件
export function licenseSetFileI(formData) {
  return request({
    url: '/system/license/set',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    loading: true
  })
}
