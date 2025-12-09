import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'


// 查询模型配置列表
export function getAiConfigList() {
    return request({
        url: '/system/ai/getAiConfigList',
        method: 'get',
    })
}

// 查询模型AI配置  根据ID
export function getAiConfigById(id) {
    return request({
        url: '/system/ai/getAiConfigById',
        method: 'get',
        params: { id }
    })
}

// 开启模型接口
export function onOffAiConfig(id) {
    return request({
        url: '/system/ai/onOffAiConfig',
        method: 'post',
        data: { id }
    })
}

// 修改模型配置接口
export function updateAiConfigById(data) {
    return request({
        url: '/system/ai/updateAiConfigById',
        method: 'post',
        data: data
    })
}

// 获取模型配置的下拉列表
export function getAiModelList(id) {
    return request({
        url: '/system/ai/getAiModelList',
        method: 'get',
        params: { id }
    })
}

// 测试连接AI接口
export function testConnection(data) {
    return request({
        url: '/system/ai/testConnection',
        method: 'post',
        data: data
    })
}

// 获取数据集列表
export function getDataSetList(queryParams) {
    return request({
        url: '/system/dataSet/getDataSetList',
        method: 'get',
        params: queryParams
    })
}

// 新增下拉内容
export function getDatabasesProxyByIssue() {
    return request({
        url: '/system/dataSet/getDatabasesProxyByIssue',
        method: 'get'
    })
}

// 新增数据集
export function addDataSet(data) {
    return request({
        url: '/system/dataSet/addDataSet',
        method: 'post',
        data: data
    })
}

// 更新数据集
export function updateDataSet(data) {
    return request({
        url: '/system/dataSet/updateDataSet',
        method: 'post',
        data: data
    })
}

// 批量删除数据集
export function deleteDataSetByIds(data) {
    return request({
        url: '/system/dataSet/deleteDataSetByIds',
        method: 'post',
        data: data
    })
}