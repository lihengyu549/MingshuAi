import request from '@/utils/request'
import { stringify } from '@/utils/ruoyi'


// 查询行业经验接口
export function getCategoryLowerDataByType(type) {
    return request({
        url: '/system/categoryLowerData/getCategoryLowerDataByType',
        method: 'get',
        params: type
    })
}

// 获取标准下拉接口
export function getCategoryList() {
    return request({
        url: '/system//category/getCategoryList',
        method: 'get',
    })
}

// 新增行业经验接口
export function addCategoryLowerData(data) {
    return request({
        url: '/system/categoryLowerData/addCategoryLowerData',
        method: 'post',
        data: data
    })
}

// 删除行业经验接口
export function deleteCategoryLowerDataById(id) {
    return request({
        url: '/system/categoryLowerData/deleteCategoryLowerDataById',
        method: 'post',
        data: id
    })
}

// 修改行业经验接口
export function updateCategoryLowerDataById(data) {
    return request({
        url: '/system/categoryLowerData/updateCategoryLowerDataById',
        method: 'post',
        data: data
    })
}


