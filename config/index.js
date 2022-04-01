const { appID, appSecret, token } = process.env
module.exports = {
  port: 80,
  wechat: { appID, appSecret, token }
}
