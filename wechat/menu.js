module.exports = {
  button: [
    {
      name: '调戏小编',
      type: 'click',
      key: 'flirt'
    },
    {
      name: '分类',
      sub_button: [
        {
          name: '扫码',
          type: 'scancode_push',
          key: 'no_4'
        },
        {
          name: '等待中扫码',
          type: 'scancode_waitmsg',
          key: 'no_5'
        },
        {
          name: '地理位置',
          type: 'location_select',
          key: 'no_12'
        }
      ]
    },
    {
      name: '测试功能',
      sub_button: [
        {
          name: '博客',
          type: 'view',
          url: 'http://www.gatings.cn/'
        },
        {
          name: '系统拍照',
          type: 'pic_sysphoto',
          key: 'no_1'
        },
        {
          name: '拍照或者发图',
          type: 'pic_photo_or_album',
          key: 'no_2'
        },
        {
          name: '微信相册发布',
          type: 'pic_weixin',
          key: 'no_3'
        }
      ]
    }
  ]
}
