const wechatMiddle = require("../wechat-lib/middleware");
const config = require("../config");
const { reply } = require("../wechat/reply");

// 接入微信消息中间件
exports.hear = async (ctx, next) => {
  const middle = wechatMiddle(config.wechat, reply);
  await middle(ctx, next);
};
