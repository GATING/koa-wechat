;(async () => {
  try {
    require('dotenv').config()
    const { resolve } = require('path')
    const { port } = require('./config')
    const { getUploadDirName, confirmPath } = require('./utils')

    const Koa = require('koa')
    // 允许跨域请求
    const cors = require('koa2-cors')

    // 解析post请求，
    const koaBody = require('koa-body')
    // 静态服务器
    const serve = require('koa-static')
    // uuid，生成不重复的文件名
    const uuid = require('uuid')
    // 处理正确响应的中间件
    const responseHandle = require('./middlewares/responseHandle')
    // 处理错误响应的中间件
    const errorHandle = require('./middlewares/errorHandle')
    // log的中间件
    const log = require('./middlewares/logs')
    // 初始化路由
    const initRoutes = require('./routes')
    const app = new Koa()
    app.use(responseHandle())
    app.use(errorHandle())
    app.use(log())
    // 允许跨域的中间件
    app.use(
      cors({
        maxAge: 5,
        credentials: true,
        allowMethods: ['GET', 'POST', 'DELETE'],
        allowHeaders: ['Content-Type', 'Accept']
      })
    )
    // 处理post请求的中间件
    app.use(
      koaBody({
        multipart: true,
        includeUnparsed: true,
        formidable: {
          maxFieldsSize: 10 * 1024 * 1024, // 设置上传文件大小最大限制，默认2M
          keepExtensions: true,
          uploadDir: resolve(__dirname, `public/uploads`),
          onFileBegin(name, file) {
            // 最终要保存到的文件夹目录
            const dirName = getUploadDirName()
            const fileName = uuid.v4()
            const dir = resolve(__dirname, `public/uploads/${dirName}`)
            // 检查文件夹是否存在如果不存在则新建文件夹
            confirmPath(dir)
            // 重新覆盖 file.path 属性
            file.path = `${dir}/${fileName}`
            app.context.uploadPath = `${dirName}/${fileName}`
          }
        }
      })
    )
    // 静态服务器
    app.use(
      serve(resolve(__dirname, 'public'), {
        maxage: 60 * 60 * 1000
      })
    )

    // 初始化路由
    initRoutes(app)
    app.listen(port, async () => {
      const { getWechat } = require('./wechat')
      // 木有创建菜单的权限
      // const res = await getWechat.handle('createMenu', require('./wechat/menu'))
      // console.log('创建菜单成功', res)
      console.log(`listen successd`)
      console.log(`服务器运行于 http://localhost:${port}`)
    })
  } catch (err) {
    console.log(err)
  }
})()
