import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  })
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'get'
  })
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: '/system/menu/treeselect',
    method: 'get'
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/system/menu',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/system/menu',
    method: 'put',
    data: data
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'delete'
  })
}

// 修改界面设计接口
export function updateInterfaceDesign(data) {
  return request({
    url: '/system/interfaceDesign/updateInterfaceDesign',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data: data
  })
}

// 图片上传
export function uploadUserAppLogo(data) {
  return request({
    url: '/system/interfaceDesign/upload',
    method: 'post',
    data: data
  })
}

// 获取界面设计信息接口
export function getInterfaceDesignById(roleId) {
  return request({
    url: '/system/interfaceDesign/getInterfaceDesignById',
    method: 'get'
  })
}
