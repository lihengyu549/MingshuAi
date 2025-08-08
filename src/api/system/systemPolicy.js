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

// 对照表-列表查询接口
export function getFeatureItemListByFeatureId(data) {
    return request({
        url: '/system/feature/getFeatureItemListByFeatureId',
        method: 'get',
        params: data
    })
}

// 对照表-特征值新增接口
export function addFeatureItem(data) {
    return request({
        url: '/system/feature/addFeatureItem',
        method: 'post',
        data: data
    })
}

// 对照表-删除特征值接口
export function deleteFeatureItem(data) {
    return request({
        url: '/system/feature/deleteFeatureItem',
        method: 'post',
        data: data
    })
}

// 对照表-清空所有特征值接口
export function deleteFeatureItemAll(data) {
    return request({
        url: '/system/feature/deleteFeatureItemAll',
        method: 'post',
        data: data
    })
}

// 对照表-导入特征值接口
export function importFeatureItem(data) {
    return request({
        headers: {
            'Content-Type': 'multipart/form-data' // 必须指定为multipart/form-data
        },
        url: '/system/feature/importFeatureItem',
        method: 'post',
        data: data
    })
}

// 对照表-特征值导出接口
export function exportFeatureItem(data) {
    return request({
        url: '/system/feature/exportFeatureItem',
        method: 'post',
        data: data,
        responseType: 'blob' //响应数据格式配置
    })
}
