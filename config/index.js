const { appId, appSecret, token } = process.env
module.exports = {
  port: 3000,
  wechat: { appId, appSecret, token }
}
