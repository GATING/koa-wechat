const { get } = require('../utils/request')
const USER_AGENT = require('./userAgent')
const { jdUrl, jdClientID, jdClientSecret } = process.env

async function getCookie() {
  const url = `${jdUrl}open/auth/token?client_id=${jdClientID}&client_secret=${jdClientSecret}`
  const { data } = await get(url)
  const token = data.token
  const evnResult = await get(
    `${jdUrl}open/envs?searchValue=JD_COOKIE&t=${new Date().getTime()}`,
    null,
    {
      headers: { Authorization: 'Bearer ' + token }
    }
  )

  return evnResult.data[0].value
}
module.exports.replyJd = async function (content) {
  const Cookie = await getCookie()
  //判断链接是否来自于京东
  let linkInfo = await get(
    'https://api.m.jd.com/api',
    {
      functionId: 'ConvertSuperLink',
      appid: 'u',
      _: Date.now(),
      body: {
        funName: 'getSuperClickUrl',
        param: {
          materialInfo: content
        },
        unionId: '2020839744'
      },
      loginType: 2
    },
    {
      headers: {
        Cookie,
        'User-Agent': USER_AGENT
      }
    }
  )
  const { price, imgList, promotionUrl, originalContext, couponAfterPrice, discount } =
    linkInfo.data
  let title = `京东价￥${price}`
  if (couponAfterPrice) {
    title += ' 券后价￥' + couponAfterPrice
  }
  if (!price) {
    return originalContext
  }
  return [
    {
      title,
      description: originalContext,
      picUrl: imgList ? `https://img14.360buyimg.com/n1/s_${imgList[0]}` : '',
      url: promotionUrl
    }
  ]
}

module.exports.replyHelp = function () {
  return (
    '目前支持的功能有：\n' +
    '\n直接输入京东的商品链接，可以直接转链\n' +
    '\n直接输入视频链接可以跳转到解析链接播放会员视频\n' +
    '\n输入 /vip 可以切换源播放视频\n'
  )
}

// 解析路线
const parseInterfaces = [
  { name: 'B站1', url: 'https://vip.parwix.com:4433/player/?url=' },
  { name: 'LE', url: 'https://lecurl.cn/?url=' },
  { name: 'M3U8', url: 'https://jx.m3u8.tv/jiexi/?url=' },
  { name: '乐多', url: 'https://api.leduotv.com/wp-api/ifr.php?isDp=1&vid=' },
  { name: 'OK', url: 'https://okjx.cc/?url=' },
  { name: 'm2090', url: 'https://m2090.com/?url=' },
  { name: '51wujin', url: 'http://51wujin.net/?url=' },
  { name: '660e', url: 'https://660e.com/?url=' },
  { name: '思古', url: 'https://api.sigujx.com/?url=' },
  { name: 'MUTV', url: 'https://jiexi.janan.net/jiexi/?url=' },
  { name: '百域', url: 'https://jx.618g.com/?url=' },
  { name: '云端', url: 'https://jx.ergan.top/?url=' },
  { name: '147g', url: 'https://api.147g.cc/m3u8.php?url=' },
  { name: '17kyun', url: 'http://17kyun.com/api.php?url=' },
  { name: '纯净1', url: 'https://z1.m1907.cn/?jx=' },
  { name: '爱跟', url: 'https://vip.2ktvb.com/player/?url=' },
  { name: '江湖', url: 'https://api.jhdyw.vip/?url=' },
  { name: '可乐', url: 'https://jx.keleapi.com/?url=' },
  { name: '懒猫', url: 'https://api.lanmaody.com/dm/?url=' },
  { name: '沐白', url: 'https://www.miede.top/jiexi/?url=', t: 'm' },
  { name: 'RDHK', url: 'https://jx.rdhk.net/?v=' },
  { name: '听乐', url: 'https://jx.dj6u.com/?url=', t: 'm' },
  { name: '4K', url: 'https://jx.4kdv.com/?url=' }
]

module.exports.vipHelp = function () {
  return (
    '欢迎使用视频解析功能，目前可用的源有：\n' +
    parseInterfaces.map((interface, index) => `${index + 1}.${interface.name}`).join('\n') +
    '\n使用vip+数字可以切换源播放，默认使用第一个源哦，如不能播放请切换源\n' +
    '如: vip1 https://www.mgtv.com/b/291976/3283295.html?fpa=se&lastp=so_result'
  )
}
module.exports.replyVip = function (content) {
  const index = ~~content.match(/vip(\d+)/)?.[1]
  const { name, url } = parseInterfaces[index ? index - 1 : 0]
  return `目前播放源是:${name},请复制到浏览器播放\n播放链接: ${url}=${content}\n如不能播放请输出 /vip 输出帮助文档哦`
}
