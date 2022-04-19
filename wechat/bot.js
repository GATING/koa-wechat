const fs = require('fs')
const path = require('path')
const glob = require('glob')
// const FormData = require('form-data')
// const concatStream = require('concat-stream')
// const { getWechat } = require('./index')
const { get, post } = require('../utils/request')
const { parseXML } = require('../wechat-lib/util')
const USER_AGENT = require('./userAgent')
const {
  getTotalBean,
  getTotalBean2,
  getJingBeanBalanceDetail,
  getJxBeanInfo,
  getJxBeanDetailData
} = require('./jd')
const { jdUrl, jdClientID, jdClientSecret } = process.env
const cityPath = path.resolve(__dirname, './city.json')

async function getCookie() {
  const url = `${jdUrl}open/auth/token?client_id=${jdClientID}&client_secret=${jdClientSecret}`
  const { data } = await get(url)
  const token = data.token
  const envResult = await get(
    `${jdUrl}open/envs?searchValue=JD_COOKIE&t=${new Date().getTime()}`,
    null,
    {
      headers: { Authorization: 'Bearer ' + token }
    }
  )
  return envResult
}

async function getJDCookie() {
  const envResult = await getCookie()
  return envResult.data[0].value
}
exports.replyJd = async function (content, urlList) {
  const Cookie = await getJDCookie()
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
  if (urlList.length > 1) {
    return linkInfo.data.originalContext
  }
  if (!linkInfo.data) {
    return `当前商品不支持转链哦，请您直接购买即可(#^.^#)`
  }
  const { price, imgList, promotionUrl, originalContext, couponAfterPrice } = linkInfo.data
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

exports.replyHelp = function ({ FromUserName }) {
  let userCity = {}
  if (fs.existsSync(cityPath)) {
    userCity = require(cityPath)
  }
  const city = userCity?.[FromUserName] || '广州'
  const messageList = [
    '目前支持的功能有：',
    '\n直接输入京东的商品链接，可以直接转链',
    '\n直接输入视频链接可以跳转到解析链接播放会员视频',
    '\n直接输入抖音、B站等短视频链接，可以直接转链去水印',
    '\n输入举牌+空格+内容可以输出举牌的图片，如：举牌 你说得对',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=摸鱼&msgmenuid=1">摸鱼</a> 欢迎你进入摸鱼的一套哦',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=微博热搜&msgmenuid=1">微博热搜</a> 查看实时微博热搜',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=随机人脸&msgmenuid=1">随机人脸</a> 可以生成一份随机的人脸',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=毒鸡汤&msgmenuid=1">毒鸡汤</a> 可以查看鸡汤',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=舔狗日记&msgmenuid=2">舔狗日记</a> 可以输出舔狗日记',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=每日一言&msgmenuid=3">每日一言</a> 可以输出每日一言',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=美女图片&msgmenuid=3">美女图片</a> 可以输出美女图片哦',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=动漫图片&msgmenuid=3">动漫图片</a> 可以输出动漫图片哦',
    `\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=天气&msgmenuid=3">天气</a> 可以输出指定城市的天气哦，默认值为${city}`,
    `\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=天气&msgmenuid=3">天气</a> 可以输出指定城市的天气哦，默认值为${city}`,
    `\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=疫情&msgmenuid=3">疫情</a> 可以输出指定城市疫情哦，默认值为${city}`,
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=vip&msgmenuid=3">/vip</a> 可以切换源播放视频',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=COVID&msgmenuid=3">/COVID</a> 可以疫情功能的用法',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=weather&msgmenuid=3">/weather</a> 可以查看天气的用法',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=random&msgmenuid=3">/random</a> 可以查看随机数的用法',
    '\n输入 <a href="weixin://bizmsgmenu?msgmenucontent=help&msgmenuid=4">/help</a> 可以再次回到这里哦'
  ]
  return messageList.join('\n')
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

exports.vipHelp = function () {
  return (
    '欢迎使用视频解析功能，目前可用的源有：\n' +
    parseInterfaces.map((interface, index) => `${index + 1}.${interface.name}`).join('\n') +
    '\n使用vip+数字可以切换源播放，默认使用第一个源哦，如不能播放请切换源\n' +
    '如: vip1 https://www.mgtv.com/b/291976/3283295.html?fpa=se&lastp=so_result'
  )
}
exports.replyVip = function (content) {
  const index = ~~content.match(/vip\s*(\d+)/)?.[1]
  const { name, url } = parseInterfaces[index ? index - 1 : 0]
  return `目前播放源是:${name},请复制到浏览器播放\n播放链接: ${url}=${content}\n如不能播放请输出 /vip 输出帮助文档哦`
}

// 微博热搜，长度不能过多，不然会报错
exports.replyWb = async function () {
  const { data } = await get('https://weibo.com/ajax/statuses/hot_band')
  const { band_list, hotgov } = data
  const list = [`<a href='${hotgov.url}'>${hotgov.name}</a>\n`].concat(
    band_list
      .filter(i => i.mblog)
      .slice(0, 16)
      .map(
        (item, idx) =>
          `<a href='https://s.weibo.com/weibo?q=${item.word}'>${idx + 1}.${item.word}</a>\n`
      )
  )
  return list.join('\n')
}

exports.COVIDHelp = function () {
  return (
    '欢迎使用查看疫情功能：\n' +
    parseInterfaces.map((interface, index) => `${index + 1}.${interface.name}`).join('\n') +
    '\n使用城市+疫情或者疫情+城市可以输出指定城市的疫情情况\n' +
    '如: 广州疫情 或者 疫情广州\n' +
    '使用默认+城市+疫情可以指定默认城市，如指定后，以后输入疫情直接输出默认城市疫情\n' +
    '如: 默认广州疫情'
  )
}

function concatDataStream(formData) {
  return new Promise(resolve => {
    formData.pipe(
      concatStream({ encoding: 'buffer' }, async data => {
        resolve(data)
      })
    )
  })
}

exports.replyGirlImg = async function () {
  // const imgData = await get('http://api.btstu.cn/sjbz/zsy.php', null, {
  //   responseType: 'stream'
  // })
  // let formData = new FormData()
  // formData.append('media', imgData)
  // const data = await concatDataStream(formData)
  // const { media_id } = await getWechat.handle('uploadMedia', data)
  // return {
  //   type: 'image',
  //   mediaId: media_id
  // }

  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='http://api.btstu.cn/sjbz/zsy.php'>美女图片</a> 进行查看。`
}

exports.replyComic = async function () {
  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='https://pximg2.rainchan.win/img'>动漫</a> 进行查看。`
}

exports.replyBlog = async function (content) {
  return `<a href='https://gatings.cn'>${content}</a>`
}

exports.replyRandomFace = async function () {
  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='https://thispersondoesnotexist.com/image'>随机人脸</a> 进行查看。`
}

exports.replyLeg = async function () {
  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='https://api.iyk0.com/mtt'>美腿图</a> 进行查看。`
}

exports.replyBuyerShow = async function () {
  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='https://api.iyk0.com/mjx'>美腿图</a> 进行查看。`
}

exports.replyBuyerShow = async function () {
  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='https://api.iyk0.com/mjx'>美腿图</a> 进行查看。`
}

exports.replyDeWatermark = async function (content) {
  const { title, cover, url } = await get('https://api.iyk0.com/qsy/', {
    url: content
  })
  return [
    {
      title: '去水印视频',
      description: title,
      picUrl: cover,
      url
    }
  ]
}

exports.replyLazy = async function () {
  const text = await get('https://vps.gamehook.top/api/face/my')
  return text.replace(/<br\/?>/g, '\n')
}

exports.replyFlatterer = async function () {
  const text = await get('https://api.ixiaowai.cn/tgrj/index.php')
  return text
}

exports.replyChickenSoup = async function () {
  const { data } = await get('http://api.lkblog.net/ws/api.php')
  return data
}

exports.replyLoveTalk = async function () {
  const text = await get('https://api.ixiaowai.cn/api/ylapi.php')
  return text
}

exports.replyScumbag = async function () {
  const text = await get('https://api.iyk0.com/zhanan/')
  return text
}

exports.replyHistory = async function () {
  const text = await get('https://api.ooomn.com/api/history?format=json')
  return text
}

exports.replyRainbow = async function () {
  const text = await get('https://api.iyk0.com/chp/')
  return text
}

exports.replyRaiseCard = async function () {
  const text = content.match(/举牌\s(.)*$/)?.[1]
  if (!text) {
    return `请输入文字`
  }
  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='http://lkaa.top/API/pai/?msg=${encodeURI(
    text
  )}'>举牌</a> 进行查看。`
}

exports.replyCOVID = async function (content, { FromUserName }) {
  let userCity = {}
  if (fs.existsSync(cityPath)) {
    userCity = require(cityPath)
  }
  const match = content.match(/(默认)?(.{0,8})疫情(.{0,8})$/)
  const city = match?.[2] || match?.[3] || userCity[FromUserName] || '广州'
  const resp = await get('https://api.iyk0.com/yq/', {
    msg: city
  })
  if (resp.code != 200) {
    return resp.msg
  }
  if (match?.[1]) {
    userCity[FromUserName] = city
    fs.writeFileSync(cityPath, JSON.stringify(userCity))
  }
  return (
    '查询地区:' +
    resp.查询地区 +
    '\n目前确诊：' +
    resp.目前确诊 +
    '\n死亡人数：' +
    resp.死亡人数 +
    '\n治愈人数：' +
    resp.治愈人数 +
    '\n新增确诊:' +
    resp.新增确诊 +
    '\n现存确诊:' +
    resp.现存确诊 +
    '\n现存无症状:' +
    resp.现存无症状 +
    '\n更新时间:' +
    resp.time
  )
}

exports.randomHelp = function () {
  return (
    '欢迎使用随机数的功能：\n' +
    '\n随机+数字可以生成指定长度的数字,最大16位哦\n' +
    '如: 随机10 0370565456'
  )
}

exports.replyLogin = async function (pt_key, pt_pin) {
  const baseURL = `http://localhost:5801`
  const resp = await post(`${baseURL}/api/cklogin`, {
    pt_key,
    pt_pin
  })
  const { data, message } = resp || {}
  if (data?.eid) {
    const resp = await get(`${baseURL}/api/userinfo`, { eid: data?.eid })
    return `登陆成功，${resp.data.nickName}`
  }
  return message || 'cookie 解析失败，请检查后重试！'
}

exports.weatherHelp = function () {
  return (
    '欢迎使用查询天气的功能：\n' +
    '\n城市+天气可以查询指定城市的天气\n' +
    '如: 广州天气\n' +
    '\n默认+城市+天气可以查询指定城市的天气，并指定属于你的默认值哦\n' +
    'ps：原默认值为广州哦~'
  )
}

exports.replyWeather = async function (content, { FromUserName }) {
  let userCity = {}
  if (fs.existsSync(cityPath)) {
    userCity = require(cityPath)
  }
  const match = content?.match(/(默认)?(.{0,8})天气$/)
  const city = match[2] || userCity[FromUserName] || '广州'
  const data = await get('http://wthrcdn.etouch.cn/WeatherApi', {
    city
  })
  if (match?.[1]) {
    userCity[FromUserName] = city
    fs.writeFileSync(cityPath, JSON.stringify(userCity))
  }

  const { resp } = await parseXML(data)

  if (resp.error) {
    return `暂不支持该地区`
  }
  const { wendu, fengli, shidu, fengxiang, forecast, zhishus, yesterday } = resp
  const blackList = ['钓鱼指数', '赏月指数', '洗车指数', '中暑指数']
  const zhishu = zhishus?.[0]?.zhishu
    .map(({ name, detail }) => {
      if (blackList.includes(name[0])) {
        return
      }
      return `${name}：${detail}`
    })
    .filter(i => i)
    .join('\n')
  const _yesterday = yesterday.map(
    ({ date_1, high_1, low_1, day_1 }) => `${date_1} ${day_1[0].type_1}:${high_1}，${low_1}`
  )
  const weather = forecast?.[0].weather
    .map(({ date, high, low, day }) => `${date} ${day[0].type}:${high}，${low}`)
    .join('\n')
  return `${city} ${wendu[0]}°C ${forecast?.[0].weather[0].day[0].type} 湿度:${shidu[0]} 风力:${fengli[0]} 风向:${fengxiang[0]}\n昨日天气：\n${_yesterday}\n预测天气：\n${weather}\n指数：\n${zhishu}`
}

exports.replyLuHan = async function (content) {
  const imgUrl = glob
    .sync(path.resolve(__dirname, '../public/uploads/777/**/*'))
    .filter(filePaht => fs.statSync(filePaht).isFile())
    .sort(() => Math.random() > 0.5)[0]
  const url = jdUrl.replace(/\:\d+\/?/, '/')
  const filePath = imgUrl?.match(/.*public\/(.*)/)[1]
  if (!filePath) {
    return `当前没有图片哦，请联系管理员上传`
  }
  return `因微信认证的问题，此功能暂时无法使用，请点击 <a href='${url}${filePath}'>${content}</a> 进行查看哦。`
}

const beanPath = path.resolve(__dirname, './bean.json')
exports.replyBean = async (content, { FromUserName }) => {
  let envResult = await getCookie()
  let jdCookieList = envResult.data
  let userBean = {}
  if (fs.existsSync(beanPath)) {
    userBean = require(beanPath)
  }
  const ptKey = content.match(/pt_key=(.*?);/)?.[1]
  const ptPin = content.match(/pt_pin=(.*?);/)?.[1]
  if (!userBean[FromUserName]?.pin?.length) {
    if (ptKey && ptPin) {
      await this.replyLogin(ptKey, ptPin)
      userBean[FromUserName] = {
        remark: '',
        pin: [ptPin]
      }
    } else {
      return `暂无用户哦，请联系管理员添加`
    }
  } else {
    if (ptKey && ptPin) {
      const pin = userBean[FromUserName].pin
      if (!pin.includes(encodeURIComponent(ptPin))) {
        pin.push(ptPin)
      }
    }
  }
  if (ptKey && ptPin) {
    fs.writeFileSync(beanPath, JSON.stringify(userBean))
  }

  const pinList = userBean[FromUserName].pin
  const messageList = []
  // 前一天的0:0:0时间戳
  const yesterday =
    parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - 24 * 60 * 60 * 1000
  // 今天0:0:0时间戳
  const today = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000
  for (let i = 0; i < pinList.length; i++) {
    const pin = pinList[i]
    const user = jdCookieList.find(({ value }) => {
      const ptPin = value.match(/pt_pin=(.*?);/)?.[1]
      return encodeURIComponent(ptPin) === encodeURIComponent(pin)
    })
    if (!user) {
      continue
    }
    const { value: cookie, remarks, status } = user
    const remark = remarks?.replace(/remark\=(.*)?;/, '$1')
    if (status) {
      messageList.push(`${remark}已过期，请重新登录`)
      continue
    }
    let page = 1,
      t = 0,
      yesterdayArr = [],
      todayArr = [],
      incomeBean = 0,
      expenseBean = 0,
      todayIncomeBean = 0,
      todayOutcomeBean = 0,
      inJxBean = 0,
      OutJxBean = 0,
      todayinJxBean = 0,
      todayOutJxBean = 0,
      beanCount = 0,
      xibeanCount = 0

    while (t === 0) {
      let response = await getJingBeanBalanceDetail(page, cookie)
      if (response && response.code === '0') {
        page++
        let detailList = response.detailList
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const date = new Date(item.date.replace(/-/g, '/') + '+08:00').getTime()
            const isNotBack =
              !item['eventMassage'].includes('退还') && !item['eventMassage'].includes('扣赠')
            if (date >= today && isNotBack) {
              todayArr.push(item)
            } else if (yesterday <= date && date < today && isNotBack) {
              //昨日的
              yesterdayArr.push(item)
            } else if (yesterday > date) {
              //前天的
              t = 1
              break
            }
          }
        } else {
          $.errorMsg = `数据异常`
          t = 1
        }
      } else if (response && response.code === '3') {
        console.log(`cookie已过期，或者填写不规范，跳出`)
        messageList.push(`${remark}已过期，请重新登录`)
        t = 1
      } else {
        console.log(`未知情况：${JSON.stringify(response)}`)
        console.log(`未知情况，跳出`)
        t = 1
      }
    }

    for (let item of yesterdayArr) {
      if (Number(item.amount) > 0) {
        incomeBean += Number(item.amount)
      } else if (Number(item.amount) < 0) {
        expenseBean += Number(item.amount)
      }
    }
    for (let item of todayArr) {
      if (Number(item.amount) > 0) {
        todayIncomeBean += Number(item.amount)
      } else if (Number(item.amount) < 0) {
        todayOutcomeBean += Number(item.amount)
      }
    }

    const totalResp = await getTotalBean(cookie)
    beanCount = totalResp.data?.assetInfo?.beanNum
    if (!beanCount) {
      const user = await getTotalBean2(cookie)
      beanCount = user?.jingBean ?? 0
    }

    // 京喜
    let JxYesterdayArr = [],
      JxTodayArr = []
    let JxResponse = await getJxBeanDetailData(cookie)
    JxResponse = JSON.parse(JxResponse.match(new RegExp(/jsonpCBK.?\((.*);*/))[1])
    if (JxResponse && JxResponse.ret == '0') {
      let Jxdetail = JxResponse.detail
      if (Jxdetail && Jxdetail.length > 0) {
        for (let item of Jxdetail) {
          const date = new Date(item.createdate.replace(/-/g, '/') + '+08:00').getTime()
          const isNotBack =
            !item['visibleinfo'].includes('退还') && !item['visibleinfo'].includes('扣赠')
          if (date >= today && isNotBack) {
            JxTodayArr.push(item)
          } else if (yesterday <= date && date < today && isNotBack) {
            //昨日的
            JxYesterdayArr.push(item)
          } else if (yesterday > date) {
            break
          }
        }
      } else {
        console.log(`数据异常`)
      }
      for (let item of JxYesterdayArr) {
        if (Number(item.amount) > 0) {
          inJxBean += Number(item.amount)
        } else if (Number(item.amount) < 0) {
          OutJxBean += Number(item.amount)
        }
      }
      for (let item of JxTodayArr) {
        if (Number(item.amount) > 0) {
          todayinJxBean += Number(item.amount)
        } else if (Number(item.amount) < 0) {
          todayOutJxBean += Number(item.amount)
        }
      }
    }

    let jxResp = await getJxBeanInfo(cookie)
    jxResp = JSON.parse(jxResp.match(new RegExp(/jsonpCBK.?\((.*);*/))[1])
    xibeanCount = jxResp?.data?.xibean ?? 0

    let message = `${remark}
    【今日京豆】收${todayIncomeBean}豆,支${Math.abs(todayOutcomeBean)}豆
    【昨日京豆】收${incomeBean}豆,支${Math.abs(expenseBean)}豆
    【当前京豆】${beanCount}豆(≈${(beanCount / 100).toFixed(2)}元)
    【今日喜豆】收${todayinJxBean}豆,支${Math.abs(todayOutJxBean)}豆
    【昨日喜豆】收${inJxBean}豆,支${Math.abs(OutJxBean)}豆
    【当前喜豆】${xibeanCount}喜豆(≈${(xibeanCount / 100).toFixed(2)}元)
    `.replace(/(\n)(\s+)/g, '$1')
    messageList.push(message)
  }
  if (!messageList.length) {
    return `暂无用户或者用户已过期，有疑问请联系管理员哦~`
  }
  return messageList.join('\n')
}
