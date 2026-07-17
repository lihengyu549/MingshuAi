import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'


// 查询模型配置列表
export function getAiConfigList(data) {
    return request({
        url: '/system/ai/getAiConfigList',
        method: 'get',
        params: data
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

// 获取模型列表
export function getModelDrillList(queryParams) {
    return request({
        url: '/system/modelDrill/getModelDrillList',
        method: 'get',
        params: queryParams
    })
}

// 获取模型钻取详情
export function getModelDrillById(id) {
    return request({
        url: '/system/modelDrill/getModelDrillById',
        method: 'get',
        params: { id }
    })
}

// 新增模型钻取
export function addModelDrill(data) {
    return request({
        url: '/system/modelDrill/addModelDrill',
        method: 'post',
        data: data
    })
}

// 更新模型钻取
export function updateModelDrill(data) {
    return request({
        url: '/system/modelDrill/updateModelDrill',
        method: 'post',
        data: data
    })
}

// 批量删除模型钻取
export function deleteModelDrillByIds(data) {
    return request({
        url: '/system/modelDrill/deleteModelDrillByIds',
        method: 'post',
        data: data
    })
}

// 开启模型钻取
export function startDrillById(id) {
    return request({
        url: '/system/modelDrill/startDrillById',
        method: 'post',
        data: { id }
    })
}

// 获取所有数据集列表
export function getDataSetListByAll() {
    return request({
        url: '/system/dataSet/getDataSetListByAll',
        method: 'get',
    })
}

// 终止模型钻取
export function finishDrillById(id) {
    return request({
        url: '/system/modelDrill/finishDrillById',
        method: 'post',
        data: { id }
    })
}

 //视觉模型-获取模型列表
export function getAiConfigListByVision(data) {
    return request({
        url: '/system/ai/getAiConfigListByVision',
        method: 'get',
        params: data
    })
}

//视觉模型-保存模型配置
export function updateAiConfigByVision(data) {
    return request({
        url: '/system/ai/updateAiConfigByVision',
        method: 'post',
        data: data
    })
}

//视觉模型-测试模型链接
export function testConnectionByVision(data) {
    return request({
        url: '/system/ai/testConnectionByVision',
        method: 'post',
        data: data
    })
}

//向量模型-获取模型列表
export function getAiConfigListByVector(data) {
    return request({
        url: '/system/ai/getAiConfigListByVector',
        method: 'get',
        params: data
    })
}

//向量模型-保存模型配置
export function updateAiConfigByVector(data) {
    return request({
        url: '/system/ai/updateAiConfigByVector',
        method: 'post',
        data: data
    })
}

//向量模型-测试模型链接
export function testConnectionByVector(data) {
    return request({
        url: '/system/ai/testConnectionByVector',
        method: 'post',
        data: data
    })
}