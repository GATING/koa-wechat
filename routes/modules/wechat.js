const Router = require('koa-router')
const wechat = require('../../controllers/wechat')
const router = new Router({
  prefix: '/wechat'
})

router.get('/', wechat.hear)
router.post('/', wechat.hear)
module.exports = router
