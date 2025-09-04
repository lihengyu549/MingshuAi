import axios from 'axios'
import { Notification, MessageBox, Message, Loading } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from "@/utils/ruoyi";
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'

let downloadLoadingInstance;
// 是否显示重新登录
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: 600000
})

// 在请求拦截器中添加token过期检查
// 计算token剩余有效期
const checkTokenExpiration = () => {
  const expiresIn = getExpiresIn();
  if (expiresIn && expiresIn > 60) { // 如果剩余时间小于60秒，则自动刷新
    // 触发token刷新
    if (!isRefreshing) {
      store.dispatch('RefreshToken');
    }
  }
};

// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改

  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }

  /** 配置全屏加载 */
  if (config.loading == true) {
    config.loading = Loading.service({
      lock: true,
      background: 'rgba(0, 0, 0, 0.7)',
      spinner: 'el-icon-loading',
      text: '请稍候...'
    })
  }

  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {

    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url;                  // 请求地址
      const s_data = sessionObj.data;                // 请求数据
      const s_time = sessionObj.time;                // 请求时间
      const interval = 200;                         // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = '数据正在处理，请勿重复提交';
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  checkTokenExpiration();
  return config
}, error => {
  // console.log(error)
  Promise.reject(error)
})

// 在文件顶部添加一个变量用于控制刷新状态
let isRefreshing = false;
let refreshSubscribers = [];

// 添加一个函数用于通知所有等待的请求
function onAccessTokenFetched(newToken) {
  refreshSubscribers.forEach(callback => {
    callback(newToken);
  });
  refreshSubscribers = [];
}

// 添加一个函数用于将请求添加到等待队列
function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// 修改响应拦截器
// 响应拦截器
service.interceptors.response.use(
  async res => {
    await closeLoading(res)
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        if (!isRefreshing) {
          // 首次遇到401，尝试刷新token
          isRefreshing = true;
          try {
            // 调用刷新token接口
            const refreshRes = await store.dispatch('RefreshToken');
            const newToken = getToken(); // 刷新后获取新token

            // 更新当前请求的token并重新发送
            res.config.headers['Authorization'] = 'Bearer ' + newToken;

            // 通知所有等待的请求使用新token重新发送
            onAccessTokenFetched(newToken);

            // 重新发送当前请求
            return service(res.config);
          } catch (error) {
            // 刷新token失败，才执行登出
            isRelogin.show = true;
            MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
              confirmButtonText: '重新登录',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              isRelogin.show = false;
              store.dispatch('LogOut').then(() => {
                location.href = '/index';
              })
            }).catch(() => {
              isRelogin.show = false;
            });
            return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
          } finally {
            isRefreshing = false;
          }
        } else {
          // 已经有请求在刷新token，将当前请求加入等待队列
          return new Promise(resolve => {
            addRefreshSubscriber((newToken) => {
              res.config.headers['Authorization'] = 'Bearer ' + newToken;
              resolve(service(res.config));
            });
          });
        }
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 500) {
      Message({ message: msg, type: 'error' })
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      Message({ message: msg, type: 'warning' })
      return Promise.reject('error')
    } else if (code == 400) {
      return res.data
    } else if (code == 4003) {
      location.href = "/license";
    }
    else if (code !== 200) {
      Notification.error({ title: msg })
      return Promise.reject('error')
    } else {
      return res.data
    }
  },
  async error => {
    await closeLoading(error)
    // console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    Message({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

/**
 * 关闭全局加载
 * 延迟200毫秒关闭，以免晃眼睛
 * @param target
 */
const closeLoading = (target) => {
  if (!target.config.loading) return true
  return new Promise((resolve, reject) => {
    // setTimeout(() => {
    target.config.loading.close()
    resolve()
    // }, )
  })
}

// 通用下载方法
export function download(url, params, filename, config) {
  downloadLoadingInstance = Loading.service({ text: "正在下载数据，请稍候", spinner: "el-icon-loading", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isLogin = await blobValidate(data);
    if (isLogin) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      Message.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error(r)
    Message.error('下载文件出现错误，请联系管理员！')
    downloadLoadingInstance.close();
  })
}


export default service
