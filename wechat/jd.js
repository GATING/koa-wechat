const { get, post } = require('../utils/request')
const UA =
  'jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
function getJingBeanBalanceDetail(page, cookie) {
  return post(
    `https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail`,
    `body=${escape(JSON.stringify({ pageSize: '20', page: page.toString() }))}&appid=ld`,
    {
      headers: {
        'User-Agent': UA,
        Host: 'api.m.jd.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie
      }
    }
  )
}

function getTotalBean(cookie) {
  return get('https://me-api.jd.com/user_new/info/GetJDUserInfoUnion', null, {
    headers: {
      Cookie: cookie,
      'User-Agent': UA
    }
  })
}

function getTotalBean2(cookie) {
  return get(
    'https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=${Date.now()}',
    null,
    {
      headers: {
        Cookie: cookie,
        'content-type': `application/x-www-form-urlencoded`,
        Connection: `keep-alive`,
        'Accept-Encoding': `gzip,compress,br,deflate`,
        Referer: `https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html`,
        Host: `wxapp.m.jd.com`,
        'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN`
      }
    }
  )
}

function getJxBeanDetailData(cookie) {
  let url = `https://m.jingxi.com/activeapi/queryuserjingdoudetail?pagesize=10&type=16`
  url += `&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(
    Math.floor(Math.random() * 26) + 'A'.charCodeAt(0)
  )}&g_ty=ls`
  return get(url, null, {
    headers: {
      Host: 'm.jingxi.com',
      Referer: 'https://st.jingxi.com/',
      Cookie: cookie,
      'User-Agent': `jdpingou;iPhone;4.13.0;14.4.2;${randomString(
        40
      )};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${
        Math.random * 98 + 1
      };pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    }
  })
}

function getJxBeanInfo(cookie) {
  let url = `https://m.jingxi.com/activeapi/querybeanamount?_=${
    Date.now() + 2
  }&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(
    Math.floor(Math.random() * 26) + 'A'.charCodeAt(0)
  )}&g_ty=ls`
  return get(url, null, {
    headers: {
      Host: 'm.jingxi.com',
      Referer: 'https://st.jingxi.com/',
      Cookie: cookie,
      'User-Agent': `jdpingou;iPhone;4.13.0;14.4.2;${randomString(
        40
      )};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${
        Math.random * 98 + 1
      };pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    }
  })
}

function randomString(e) {
  e = e || 32
  let t = '0123456789abcdef',
    a = t.length,
    n = ''
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
  return n
}

module.exports = {
  getTotalBean,
  getTotalBean2,
  getJingBeanBalanceDetail,
  // 京喜
  getJxBeanInfo,
  getJxBeanDetailData
}
