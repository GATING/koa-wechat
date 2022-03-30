const fs = require('fs')
const { resolve } = require('path')
const Wechat = require('../wechat-lib/wechat')
const config = require('../config')
const tokenPath = resolve(__dirname, 'token.json')
const wechatCfg = {
  wechat: {
    appID: config.wechat.appID,
    appSecret: config.wechat.appSecret,
    token: config.wechat.token,
    getAccessToken() {
      if (fs.existsSync(tokenPath)) {
        const res = require('./token.json')
        return res
      }
    },
    saveAccessToken(data) {
      fs.writeFileSync(tokenPath, JSON.stringify(data, null, '\t'), {
        encoding: 'utf-8'
      })
      return data
    }
  }
}
exports.getWechat = new Wechat(wechatCfg.wechat)
