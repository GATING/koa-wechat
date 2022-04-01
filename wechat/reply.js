const {
  replyJd,
  replyVip,
  vipHelp,
  replyHelp,
  replyWb,
  replyGirlImg,
  replyComic,
  replyBlog,
  randomHelp,
  replyLazy,
  replyFlatterer,
  replyChickenSoup,
  replyRandomFace
} = require('./bot')
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
        } else if (/^\/?random$/.test(content)) {
          return randomHelp(content)
        } else if (/^微博热?搜?$/.test(content)) {
          return replyWb(content)
        } else if (/^(美女.?片?|小?姐姐)$/.test(content)) {
          return replyGirlImg(content)
        } else if (/^动[漫画].?片?$/.test(content)) {
          return replyComic(content)
        } else if (/^(博客|磨蹭(先生)?|gating)$/.test(content)) {
          return replyBlog(content)
        } else if (/^.{0,2}摸鱼.{0,2}$/.test(content)) {
          return replyLazy(content)
        } else if (/^随机(.脸)$/.test(content)) {
          return replyRandomFace(content)
        } else if (/^随机数?字?(\d+)?$/.test(content)) {
          const random = ~~content.match(/\d+/)?.[0] || 4
          if (random <= 1 || random > 15) {
            return '请输入正确的数字哦，最大15位'
          }
          return Math.floor(Math.random() * Math.pow(10, random + 1))
        } else if (/^舔狗(日记)?$/.test(content)) {
          return replyFlatterer()
        } else if (/^毒?鸡汤$/.test(content)) {
          return replyChickenSoup()
        } else if (/^每?日?一言$/.test(content)) {
          return replyLoveTalk()
        } else if (urlReg.test(content)) {
          //判断链接是否来自于京东
          if (content.includes('jd') || content.includes('jingxi')) {
            return await replyJd(content)
          } else {
            return replyVip(content)
          }
        }
        return (
          `Oh, 暂时无法理解 <a href='https://www.baidu.com/s?wd=${content}'>${content}</a>` +
          ' 这句话,如需帮助请回复 <a href="weixin://bizmsgmenu?msgmenucontent=help">/help</a> 哦'
        )
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
