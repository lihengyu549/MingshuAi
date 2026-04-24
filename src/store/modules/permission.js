import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes, resetRouter } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes)
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = routes
    },
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit, rootState }, payload = {}) {
      return new Promise((resolve, reject) => {
        const language = payload.language || rootState.app.language || 'zh'
        // 向后端请求路由数据
        getRouters({ language }).then(res => {
          const sdata = JSON.parse(JSON.stringify(res.data))
          const rdata = JSON.parse(JSON.stringify(res.data))
          const sidebarRoutes = filterAsyncRouter(sdata)
          const rewriteRoutes = filterAsyncRouter(rdata, false, true)
          const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
          
          const categorizedSidebarRoutes = categorizeRoutes(sidebarRoutes, language)
          const categorizedRewriteRoutes = categorizeRoutes(rewriteRoutes, language)
          
          rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })
          router.addRoutes(asyncRoutes);
          commit('SET_ROUTES', categorizedRewriteRoutes)
          commit('SET_SIDEBAR_ROUTERS', constantRoutes.concat(categorizedSidebarRoutes))
          commit('SET_DEFAULT_ROUTES', categorizedSidebarRoutes)
          commit('SET_TOPBAR_ROUTES', categorizedSidebarRoutes)
          resolve(rewriteRoutes)
        }).catch(reject)
      })
    },
    RefreshRoutes({ dispatch }, payload = {}) {
      return new Promise((resolve, reject) => {
        resetRouter()
        dispatch('GenerateRoutes', payload).then(accessRoutes => {
          router.addRoutes(accessRoutes)
          resolve(accessRoutes)
        }).catch(reject)
      })
    }
  }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

// 将路由分为核心功能和系统管理两部分
function categorizeRoutes(routes, language = 'zh') {
  const categoryTitles = getCategoryTitles(language)

  // 检查是否已经存在系统管理或核心功能的根节点
  const hasSystemRoot = routes.some(route => 
    route.path === '/system' || 
    (route.meta && route.meta.title === categoryTitles.systemManagement)
  )
  
  // 如果已经存在系统管理根节点，添加分类标记并创建核心功能分组
   if (hasSystemRoot) {
     const result = []
     const coreFunctions = []
     const processedRoutes = new Set() // 用于跟踪已处理的路由
     
     // 分离核心功能路由
     routes.forEach((route, index) => {
       // 判断是否为系统管理路由（根据路径或其他标识）
       const isSystemManagement = route.path && (
         route.path.startsWith('/system/') || 
         route.path.startsWith('/monitor/') ||
         route.path.startsWith('/tool/') ||
         route.path.startsWith('/jobWork/')
       )
       
       // 核心业务功能路径判断
       const isCoreBusiness = route.path && (
         route.path.startsWith('/dataAssetManagement/') ||
         route.path.startsWith('/standard/') ||
         route.path.startsWith('/strategy/') ||
         route.path.startsWith('/APIAbutment/') ||
         route.path.startsWith('/hierarchicalTask/')
       )
       
       // 检查标题中的关键词，但要排除数据资产相关的
       const titleContainsSystemKeywords = route.meta && route.meta.title && hasSystemKeyword(route.meta.title, language)
       
       const finalIsSystemManagement = !isCoreBusiness && (isSystemManagement || titleContainsSystemKeywords)
       
       if (!finalIsSystemManagement && !(route.path === '/system' || (route.meta && route.meta.title === categoryTitles.systemManagement))) {
         // 为核心功能路由添加 hideChildrenInNavbar 标记，用于L型菜单展示
         const routeWithFlag = addHideChildrenFlag(route)
         coreFunctions.push(routeWithFlag)
         processedRoutes.add(index)
       }
     })
     
     // 添加核心功能分组
     if (coreFunctions.length > 0) {
        result.push({
          path: '/core-functions-category',
          component: Layout,
          meta: {
           title: categoryTitles.coreFunctions,
           icon: '',
           type: 'category'
          },
         children: coreFunctions,
         alwaysShow: true
       })
     }
     
     // 处理系统管理根节点和未处理的路由
     routes.forEach((route, index) => {
       if (route.path === '/system' || (route.meta && route.meta.title === categoryTitles.systemManagement)) {
         // 为系统管理根节点创建新的结构，子菜单添加 hideChildrenInNavbar 标记
         const processedChildren = route.children ? route.children.map(child => {
           const childPath = child.path.startsWith('/') ? child.path : '/' + child.path
           const fullPath = route.path === '/' ? childPath : route.path + childPath
           return {
             ...child,
             path: fullPath,
             meta: child.children && child.children.length > 0 ? {
               ...child.meta,
               hideChildrenInNavbar: true
             } : child.meta
           }
         }) : []
         
         result.push({
           ...route,
           meta: {
             ...route.meta,
             type: 'category'
           },
           children: processedChildren,
           alwaysShow: true
         })
       } else if (!processedRoutes.has(index)) {
         const routeWithFlag = addHideChildrenFlag(route)
         result.push(routeWithFlag)
       }
     })
     
     return result
   }
  
  // 原有的分类逻辑（当不存在系统管理根节点时）
  const coreFunctions = []
  const systemManagement = []
  
  routes.forEach(route => {
    // 判断是否为系统管理路由（根据路径或其他标识）
    const isSystemManagement = route.path && (
      route.path.startsWith('/system/') || 
      route.path.startsWith('/monitor/') ||
      route.path.startsWith('/tool/') ||
      route.path.startsWith('/jobWork/')
    )
    
    // 核心业务功能路径判断
    const isCoreBusiness = route.path && (
      route.path.startsWith('/dataAssetManagement/') ||
      route.path.startsWith('/standard/') ||
      route.path.startsWith('/strategy/') ||
      route.path.startsWith('/APIAbutment/') ||
      route.path.startsWith('/hierarchicalTask/')
    )
    
    // 检查标题中的关键词，但要排除数据资产相关的
    const titleContainsSystemKeywords = route.meta && route.meta.title && hasSystemKeyword(route.meta.title, language)
    
    const finalIsSystemManagement = !isCoreBusiness && (isSystemManagement || titleContainsSystemKeywords)
    
    if (finalIsSystemManagement) {
      systemManagement.push(route)
    } else {
      // 为核心功能路由添加 hideChildrenInNavbar 标记，用于L型菜单展示
      const routeWithFlag = addHideChildrenFlag(route)
      coreFunctions.push(routeWithFlag)
    }
  })
  
  const categorizedRoutes = []
  
  // 添加核心功能分组
  if (coreFunctions.length > 0) {
    categorizedRoutes.push({
      path: '/core-functions',
      component: Layout,
      meta: {
        title: categoryTitles.coreFunctions,
        icon: '',
        type: 'category'
      },
      children: coreFunctions,
      alwaysShow: true
    })
  }
  
  // 添加系统管理分组
  if (systemManagement.length > 0) {
    categorizedRoutes.push({
      path: '/system-management',
      component: Layout,
      meta: {
        title: categoryTitles.systemManagement,
        icon: '',
        type: 'category'
      },
      children: systemManagement,
      alwaysShow: true
    })
  }
  
  return categorizedRoutes.length > 0 ? categorizedRoutes : routes
}

function getCategoryTitles(language) {
  if (language === 'en') {
    return {
      coreFunctions: 'Core Functions',
      systemManagement: 'System Management'
    }
  }
  return {
    coreFunctions: '核心功能',
    systemManagement: '系统管理'
  }
}

function hasSystemKeyword(title, language) {
  if (!title) return false

  if (language === 'en') {
    return (
      (title.includes('System') && !title.includes('Data Asset')) ||
      (title.includes('Management') && !title.includes('Data Asset') && !title.includes('Standard')) ||
      title.includes('Monitor') ||
      title.includes('Tool')
    )
  }

  return (
    (title.includes('系统') && !title.includes('数据资产')) ||
    (title.includes('管理') && !title.includes('数据资产') && !title.includes('标准')) ||
    title.includes('监控') ||
    title.includes('工具')
  )
}

// 为路由添加 hideChildrenInNavbar 标记，用于L型菜单展示
function addHideChildrenFlag(route) {
  if (route.children && route.children.length > 0) {
    return {
      ...route,
      meta: {
        ...route.meta,
        hideChildrenInNavbar: true
      },
      children: route.children.map(child => ({
        ...child,
        meta: {
          ...child.meta,
          parentPath: route.path
        }
      }))
    }
  }
  return route
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
    return (resolve) => require([`@/views/${view}`], resolve)
  //   if (process.env.NODE_ENV === 'development') {
  //   return (resolve) => require([`@/views/${view}`], resolve)
  // } else {
  //   // 使用 import 实现生产环境的路由懒加载
  //   return () => import(`@/views/${view}`)
  // }
}

export default permission
