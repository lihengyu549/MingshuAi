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
    }
  },
  actions: {
    GenerateRoutes({ commit, rootState }, payload = {}) {
      return new Promise((resolve, reject) => {
        const language = payload.language || rootState.app.language || 'zh'
        getRouters({ language }).then(res => {
          const sdata = JSON.parse(JSON.stringify(res.data))
          const rdata = JSON.parse(JSON.stringify(res.data))
          const sidebarRoutes = filterAsyncRouter(sdata)
          const rewriteRoutes = filterAsyncRouter(rdata, false, true)
          const asyncRoutes = filterDynamicRoutes(dynamicRoutes)

          const categorizedSidebarRoutes = categorizeRoutes(sidebarRoutes, language)
          const categorizedRewriteRoutes = categorizeRoutes(rewriteRoutes, language)

          rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })
          router.addRoutes(asyncRoutes)
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

function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
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
      delete route.children
      delete route.redirect
    }
    return true
  })
}

function categorizeRoutes(routes, language = 'zh') {
  const categoryTitles = getCategoryTitles(language)
  const hasCoreRoot = routes.some(route => isCategoryRoot(route, '/core', categoryTitles.coreFunctions))
  const hasSystemRoot = routes.some(route => isCategoryRoot(route, '/system', categoryTitles.systemManagement))

  if (hasCoreRoot) {
    return routes.map(route => {
      if (isCategoryRoot(route, '/core', categoryTitles.coreFunctions)) {
        return buildCategoryRoute(route)
      }

      if (hasSystemRoot && isCategoryRoot(route, '/system', categoryTitles.systemManagement)) {
        return buildCategoryRoute(route)
      }

      return addHideChildrenFlag(route)
    })
  }

  if (hasSystemRoot) {
    const result = []
    const coreFunctions = []
    const processedRoutes = new Set()

    routes.forEach((route, index) => {
      const isSystemManagement = route.path && (
        route.path.startsWith('/system/') ||
        route.path.startsWith('/monitor/') ||
        route.path.startsWith('/tool/') ||
        route.path.startsWith('/jobWork/')
      )

      const isCoreBusiness = route.path && (
        route.path.startsWith('/dataAssetManagement/') ||
        route.path.startsWith('/standard/') ||
        route.path.startsWith('/strategy/') ||
        route.path.startsWith('/APIAbutment/') ||
        route.path.startsWith('/hierarchicalTask/')
      )

      const titleContainsSystemKeywords = route.meta && route.meta.title && hasSystemKeyword(route.meta.title, language)
      const finalIsSystemManagement = !isCoreBusiness && (isSystemManagement || titleContainsSystemKeywords)

      if (!finalIsSystemManagement && !isCategoryRoot(route, '/system', categoryTitles.systemManagement)) {
        coreFunctions.push(addHideChildrenFlag(route))
        processedRoutes.add(index)
      }
    })

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

    routes.forEach((route, index) => {
      if (isCategoryRoot(route, '/system', categoryTitles.systemManagement)) {
        result.push(buildCategoryRoute(route))
      } else if (!processedRoutes.has(index)) {
        result.push(addHideChildrenFlag(route))
      }
    })

    return result
  }

  const coreFunctions = []
  const systemManagement = []

  routes.forEach(route => {
    const isSystemManagement = route.path && (
      route.path.startsWith('/system/') ||
      route.path.startsWith('/monitor/') ||
      route.path.startsWith('/tool/') ||
      route.path.startsWith('/jobWork/')
    )

    const isCoreBusiness = route.path && (
      route.path.startsWith('/dataAssetManagement/') ||
      route.path.startsWith('/standard/') ||
      route.path.startsWith('/strategy/') ||
      route.path.startsWith('/APIAbutment/') ||
      route.path.startsWith('/hierarchicalTask/')
    )

    const titleContainsSystemKeywords = route.meta && route.meta.title && hasSystemKeyword(route.meta.title, language)
    const finalIsSystemManagement = !isCoreBusiness && (isSystemManagement || titleContainsSystemKeywords)

    if (finalIsSystemManagement) {
      systemManagement.push(route)
    } else {
      coreFunctions.push(addHideChildrenFlag(route))
    }
  })

  const categorizedRoutes = []

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

function isCategoryRoot(route, expectedPath, expectedTitle) {
  if (!route) return false
  const compactPath = expectedPath.replace(/^\//, '')
  return route.path === expectedPath || route.path === compactPath || (route.meta && route.meta.title === expectedTitle)
}

function buildCategoryRoute(route) {
  return {
    ...route,
    meta: {
      ...route.meta,
      type: 'category'
    },
    children: processCategoryChildren(route),
    alwaysShow: true
  }
}

function processCategoryChildren(route) {
  if (!route.children || route.children.length === 0) {
    return []
  }

  return route.children.map(child => {
    const normalizedChild = normalizeCategoryChildPath(route.path, child)
    return addHideChildrenFlag(normalizedChild)
  })
}

function normalizeCategoryChildPath(parentPath, child) {
  if (!child || !child.path) {
    return child
  }

  const normalizedParentPath = parentPath && parentPath.startsWith('/') ? parentPath : `/${parentPath}`
  const childPath = child.path.startsWith('/') ? child.path : `/${child.path}`

  return {
    ...child,
    path: normalizedParentPath === '/' ? childPath : normalizedParentPath + childPath
  }
}

function filterChildren(childrenMap, lastRouter = false) {
  let children = []
  childrenMap.forEach(el => {
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
}

export default permission
