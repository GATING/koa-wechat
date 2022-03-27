const { get, post } = require('../utils/request')
module.exports = class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket

    this.fetchAccessToken()
  }

  // 1. 首先检查数据库里的 token 是否过期
  // 2. 过期则刷新
  // 3. token 入库
  async fetchAccessToken() {
    let data = await this.getAccessToken()
    if (!this.isValid(data)) {
      data = await this.updateAccessToken()
    }
    await this.saveAccessToken(data)
    return data
  }

  // 获取 token
  async updateAccessToken() {
    const data = await get('/token', {
      grant_type: 'client_credential',
      appid: this.appID,
      secret: this.appSecret
    })
    const now = Date.now()
    const expiresIn = now + (data.expires_in - 20) * 1000
    data.expires_in = expiresIn
    return data
  }

  // 票据是否过期
  isValid(data) {
    if (!data || !data.expires_in) {
      return false
    }
    const expiresIn = data.expires_in
    const now = Date.now()
    if (now < expiresIn) {
      return true
    } else {
      return false
    }
  }

  // 封装用来请求接口的入口方法
  async handle(operation, ...args) {
    const tokenData = await this.fetchAccessToken()
    const data = await this[operation](tokenData.access_token, ...args)
    return data
  }

  // 创建菜单和自定义菜单
  createMenu(token, menu) {
    return post(`/menu/create?access_token=${token}`, menu)
  }
  // 删除菜单
  deleteMenu(token) {
    return get(`/menu/delete?access_token=${token}`)
  }

  // 获取菜单
  fetchMenu(token) {
    return get(`/menu/get?access_token=${token}`)
  }
}
