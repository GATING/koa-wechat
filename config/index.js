const { appID, appSecret, token } = process.env
module.exports = {
  port: 3000,
  wechat: { appID, appSecret, token }
}
