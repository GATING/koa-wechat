const fs = require('fs')
const path = require('path')

/**
 * 生成文件夹名称
 */
const getUploadDirName = () => {
  const date = new Date()
  let month = Number.parseInt(date.getMonth()) + 1
  month = month.toString().length > 1 ? month : `0${month}`
  const dir = `${date.getFullYear()}${month}${date.getDate()}`
  return dir
}
/**
 * 确定目录是否存在， 如果不存在则创建目录
 * @param {String} pathStr => 文件夹路径
 */
const confirmPath = dirname => {
  if (!fs.existsSync(dirname)) {
    if (confirmPath(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
  return true
}

function getIPAddress() {
  var interfaces = require('os').networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
}
module.exports = {
  /**
   * 生成文件夹名称
   */
  getUploadDirName,
  confirmPath,
  getIPAddress
}
