import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isRelogin } from '@/utils/request'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect', '/bind', '/register']

function hasChildren(route) {
  return route.children && route.children.length > 0 && !route.meta.hideChildrenInNavbar
}

function findFirstChildRoute(routes, currentPath) {
  for (const route of routes) {
    if (route.path === currentPath || route.path === '/' + currentPath || '/' + route.path === currentPath) {
      if (route.children && route.children.length > 0) {
        return route.children[0]
      }
    }
    if (route.children) {
      const found = findFirstChildRoute(route.children, currentPath)
      if (found) return found
    }
  }
  return null
}

function shouldAutoRedirectToChild(to, routes) {
  if (!to.meta || to.meta.hideChildrenInNavbar) return false
  for (const route of routes) {
    if (route.children && route.children.length > 0 && route.meta && route.meta.hideChildrenInNavbar) {
      const fullPath = route.path.startsWith('/') ? route.path : '/' + route.path
      const childFullPath = route.children[0].path.startsWith('/') 
        ? route.children[0].path 
        : fullPath + '/' + route.children[0].path
      
      if (to.path === fullPath || to.path === childFullPath) {
        if (to.path === fullPath && to.meta && to.meta.hideChildrenInNavbar) {
          return childFullPath
        }
      }
    }
  }
  return null
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        isRelogin.show = true
        store.dispatch('GetInfo').then(() => {
          isRelogin.show = false
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            const redirectPath = shouldAutoRedirectToChild(to, accessRoutes)
            if (redirectPath) {
              next({ path: redirectPath, replace: true })
            } else {
              router.addRoutes(accessRoutes)
              next({ ...to, replace: true })
            }
          })
        }).catch(err => {
            store.dispatch('LogOut').then(() => {
              Message.error(err)
              next({ path: '/' })
            })
          })
      } else {
        const sidebarRouters = store.getters.sidebarRouters
        const redirectPath = shouldAutoRedirectToChild(to, sidebarRouters)
        if (redirectPath) {
          next({ path: redirectPath, replace: true })
        } else {
          next()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
