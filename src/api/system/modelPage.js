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

// 新增数据库代理
export function addProxys(data) {
    return request({
        url: '/system/proxy',
        method: 'post',
        data: data
    })
}

