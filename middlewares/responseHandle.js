const codeTypes = require("../utils/codeTypes");
const responseHandle = () => {
  // 处理请求成功方法
  const successHandle = (ctx) => {
    return (data, msg = "请求成功") => {
      ctx.body = {
        code: 0,
        data,
        msg,
      };
    };
  };

  // 处理请求失败方法
  const errorHandle = (ctx) => {
    return (code, msg) => {
      ctx.body = {
        code,
        msg: msg || codeTypes[code] || "请求失败",
      };
    };
  };

  return async (ctx, next) => {
    ctx.send = successHandle(ctx);
    ctx.sendError = errorHandle(ctx);
    await next();
  };
};

module.exports = responseHandle;
