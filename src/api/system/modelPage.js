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

