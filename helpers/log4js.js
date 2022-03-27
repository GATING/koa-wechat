const log4js = require('log4js')
const path = require('path')
const { confirmPath } = require('../utils')

const basePath = path.resolve(__dirname, '../logs')
const errorPath = basePath + '/errors/'
const resPath = basePath + '/responses/'
const otherPath = basePath + '/otherPath/'

const errorFilename = errorPath + '/error'
const resFilename = resPath + '/response'
const otherFilename = otherPath + '/other'

log4js.configure({
  appenders: {
    // 控制台输出
    out: {
      type: 'stdout'
    },
    errorLog: {
      type: 'dateFile', //日志类型
      filename: errorFilename, //日志输出位置
      alwaysIncludePattern: true, //是否总是有后缀名
      pattern: '-yyyy-MM-dd.log', //后缀，每小时创建一个新的日志文件
      maxLogSize: 1024 * 1024 * 50, // 表示文件多大时才会创建下一个文件,单位是字节.
      backups: 20 // 表示备份的文件数量,如果文件过多则会将最旧的删除
    },
    responseLog: {
      type: 'dateFile',
      filename: resFilename,
      alwaysIncludePattern: true,
      pattern: '-yyyy-MM-dd.log',
      maxLogSize: 1024 * 1024 * 50,
      backups: 20
    },
    otherLog: {
      type: 'dateFile', //日志类型
      filename: otherFilename, //日志输出位置
      alwaysIncludePattern: true, //是否总是有后缀名
      pattern: '-yyyy-MM-dd.log', //后缀，每小时创建一个新的日志文件
      maxLogSize: 1024 * 1024 * 50, // 表示文件多大时才会创建下一个文件,单位是字节.
      backups: 10 // 表示备份的文件数量,如果文件过多则会将最旧的删除
    }
  },
  categories: {
    out: {
      appenders: ['out'],
      level: 'info'
    },
    errorLog: {
      appenders: ['errorLog'],
      level: 'error'
    },
    responseLog: {
      appenders: ['responseLog'],
      level: 'info'
    },
    otherLog: {
      appenders: ['otherLog'],
      level: 'error'
    },
    default: {
      appenders: ['out'],
      level: 'trace'
    }
  },
  disableClustering: true
})
//创建log的根目录'logs'
confirmPath(errorPath)
confirmPath(resPath)
confirmPath(otherPath)

module.exports = log4js
