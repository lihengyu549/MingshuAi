import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'

// 数据特征
// 数据特征列表接口
export function getPageListFeature(data) {
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

// 查看指定数据特征数据——根据ID
export function getFeatureById(data) {
    return request({
        url: '/system/feature/getFeatureById',
        method: 'get',
        params: data
    })
}

// 数据特征修改接口
export function updateFeature(data) {
    return request({
        url: '/system/feature/updateFeature',
        method: 'post',
        data: data
    })
}

// 数据特征删除接口
export function deleteFeature(data) {
    return request({
        url: '/system/feature/deleteFeature',
        method: 'post',
        data: data
    })
}
