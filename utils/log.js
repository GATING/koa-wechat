const log4js = require('../helpers/log4js')
const errorLog = log4js.getLogger('errorLog') //此处使用category的值
const resLog = log4js.getLogger('responseLog') //此处使用category的值
const otherLog = log4js.getLogger('otherLog') //此处使用category的值
const log = {}
log.i = (req, resTime) => {
  if (req) {
    resLog.info(formatRes(req, resTime))
  }
}

log.e = (ctx, error, resTime) => {
  if (ctx && error) {
    console.log(error)
    errorLog.error(formatError(ctx, error, resTime))
  }
}

log.o = err => {
  if (err) {
    otherLog.error(formatOtherError(err))
  }
}

//格式化请求日志
const formatReqLog = (req, resTime) => {
  let ip = req.ip.match(/\d+.\d+.\d+.\d+/)
  let logText = ''
  //访问方法
  const method = req.method
  logText += 'request method: ' + method + '\n'
  //请求原始地址
  logText += 'request originalUrl:  ' + req.originalUrl + '\n'
  //客户端ip
  logText += 'request client ip:  ' + ip + '\n'
  //请求参数
  if (method === 'GET') {
    logText += 'request query:  ' + JSON.stringify(req.query) + '\n'
  } else {
    logText += 'request body: ' + '\n' + JSON.stringify(req.body) + '\n'
  }
  //服务器响应时间
  logText += 'response time: ' + resTime + '\n'
  return logText
}

//格式化响应日志
const formatRes = (res, resTime) => {
  let logText = ''
  //响应日志开始
  logText += '\n' + '*************** response log start ***************' + '\n'
  //添加请求日志
  logText += formatReqLog(res, resTime)
  //响应状态码
  logText += 'response status: ' + res.res.statusCode + '\n'
  //响应内容
  logText += 'response body: ' + '\n' + JSON.stringify(res.body) + '\n'
  //响应日志结束
  logText += '*************** response log end ***************' + '\n'
  return logText
}

//格式化错误日志
const formatError = (ctx, err, resTime) => {
  let logText = ''
  //错误信息开始
  logText += '\n' + '*************** error log start ***************' + '\n'
  //添加请求日志
  logText += formatReqLog(ctx, resTime)
  //错误名称
  logText += 'err name: ' + err.name + '\n'
  //错误信息
  logText += 'err message: ' + err.message + '\n'
  //错误详情
  logText += 'err stack: ' + err.stack + '\n'
  //错误信息结束
  logText += '*************** error log end ***************' + '\n'
  return logText
}

// 格式化其他错误日志（如数据库）
const formatOtherError = err => {
  let logText = ''
  //错误信息开始
  logText += '\n' + '*************** error log start ***************' + '\n'
  logText += 'err info: ' + JSON.stringify(err) + '\n'
  logText += '*************** error log end ***************' + '\n'
  return logText
}

module.exports = log
