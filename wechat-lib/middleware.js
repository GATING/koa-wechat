// 工具库
const util = require('./util')
// node原生加密库
const crypto = require('crypto')

module.exports = (config, reply) => {
  return async (ctx, next) => {
    // 微信环境检查和回复
    const { signature, timestamp, nonce, echostr } = ctx.query
    const token = config.token

    let str = [token, timestamp, nonce].sort().join('')
    // sha1加密
    const sha = crypto.createHash('sha1').update(str).digest('hex')
    if (ctx.method === 'GET') {
      // 实际上直接返回 echostr 就可以通过验证，这里主要是为了验证是不是微信的发过来的请求
      if (sha === signature) {
        ctx.body = echostr
      } else {
        ctx.body = 'Failed'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        return (ctx.body = 'Failed')
      }
      // 获取用户的回复
      const data = ctx.request.body
      const content = await util.parseXML(data)
      const message = util.formatMessage(content.xml)
      ctx.state.wechat = message
      await reply.apply(ctx, [ctx, next])

      const xml = util.tpl(ctx.body, message)
      ctx.status = 200
      ctx.type = 'application/xml'
      ctx.body = xml
    }
  }
}
