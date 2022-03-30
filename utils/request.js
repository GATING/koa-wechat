const axios = require('axios')
const log = require('./log')

const errorStatus = {
  400: '请求错误',
  401: '未授权，请登录',
  403: '拒绝访问',
  404: '请求的资源不存在',
  405: '请求方式不正确',
  406: '无法使用请求的内容特性响应请求的网页',
  408: '请求超时',
  410: '请求的资源被永久删除',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持'
}

const request = axios.create({
  baseURL: 'https://api.weixin.qq.com/cgi-bin',
  timeout: 10000
})

const errorHandler = error => {
  const status = error?.response?.status
  error.message = errorStatus[status] || '未知错误'
  console.log(error)
  log.o(error?.response)
  return Promise.reject(error)
}

// 请求拦截器
request.interceptors.request.use(
  config => config,
  error => errorHandler(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const data = response.data
    return data
  },
  error => errorHandler(error)
)

function post(url, ...config) {
  return request.post(url, ...config)
}
function put(url, ...config) {
  return request.put(url, ...config)
}
function del(url, params, config) {
  return request.delete(url, {
    params,
    ...config
  })
}
function get(url, params, config) {
  return request.get(url, {
    params,
    ...config
  })
}

module.exports = {
  get,
  post,
  put,
  del
}
