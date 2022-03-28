const { replyJd, replyVip, vipHelp, replyHelp } = require('./bot')
const help = '亲爱的，欢迎关注磨蹭的小时光'
const urlReg = /(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/

// 自定义菜单
// https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141013
const replyEvent = () => {
  let reply = ''
  return new Map([
    [
      'voice',
      async message => {
        let content = message.Recognition
        content = content.slice(0, -1)
        reply = content
        return reply
      }
    ],
    [
      'image',
      async message => {
        console.log(message.PicUrl)
      }
    ],
    [
      'text',
      async message => {
        let content = message.Content
        if (/^\/?help$/.test(content)) {
          return replyHelp(content)
        } else if (/^\/?vip$/.test(content)) {
          return vipHelp(content)
        } else if (urlReg.test(content)) {
          //判断链接是否来自于京东
          if (content.includes('jd') || content.includes('jingxi')) {
            return await replyJd(content)
          } else {
            return replyVip(content)
          }
        }

        return 'Oh, 暂时无法理解 ' + content + ' 这句话'
      }
    ],
    [
      'location',
      async message => {
        console.log('地理位置： ' + message.Location_X + ',' + message.Location_Y)
        return `地理位置：${message.Location_X + ',' + message.Location_Y + '----' + message.Label}`
      }
    ],
    [
      'event_subscribe',
      async message => {
        reply = '欢迎订阅' + '！ '
        if (message.EventKey && message.ticket) {
          reply += '扫码参数是：' + message.EventKey + '_' + message.ticket
        } else {
          reply = help
        }
        return reply
      }
    ],
    [
      'event_unsubscribe',
      async message => {
        return '无情取消订阅'
      }
    ],
    [
      'event_scancode_push',
      async message => {
        console.log(
          '你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult
        )
      }
    ],
    [
      'event_scancode_waitmsg',
      async message => {
        console.log(
          '你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult
        )
      }
    ],
    [
      'event_pic_sysphoto',
      async message => {
        console.log(
          '系统拍照： ' +
            message.SendPicsInfo.count +
            ' ' +
            JSON.stringify(message.SendPicsInfo.PicList)
        )
      }
    ],
    [
      'event_pic_photo_or_album',
      async message => {
        console.log(
          '拍照或者相册： ' +
            message.SendPicsInfo.count +
            ' ' +
            JSON.stringify(message.SendPicsInfo.PicList)
        )
      }
    ],
    [
      'event_pic_weixin',
      async message => {
        console.log(
          '微信相册发图： ' +
            message.SendPicsInfo.count +
            ' ' +
            JSON.stringify(message.SendPicsInfo.PicList)
        )
      }
    ],
    [
      'event_flirt',
      async message => {
        return '调戏小编'
      }
    ],
    [
      'event_help',
      async message => {
        return '需要帮助吗？'
      }
    ],
    [
      'event_front_end',
      async message => {
        return '大前端'
      }
    ],
    [
      'event_back_end',
      async message => {
        return '大后端'
      }
    ]
  ])
}
const handleEvent = type => {
  let event = [...replyEvent()].filter(([key]) => key === type)
  return event[0][1]
}
exports.reply = async (ctx, next) => {
  const message = ctx.state.wechat
  const placeholder =
    message.EventKey || message.Event ? '_' + (message.EventKey || message.Event) : ''
  const event = message.MsgType + placeholder
  console.log(event)
  console.log(message)

  try {
    ctx.body = await handleEvent(event).call(null, message)
  } catch (err) {
    ctx.body = '请问有啥可以帮助您？'
    console.log(err)
  }
  await next()
}
