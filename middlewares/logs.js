const log = require("../utils/log");
module.exports = () => async (ctx, next) => {
  //响应开始时间
  const start = Date.now();

  const { request } = ctx;
  //开始进入到下一个中间件
  await next();
  try {
    //记录响应日志
    log.i(request, Date.now() - start);
  } catch (error) {
    //记录异常日志
    log.e(request, error, Date.now() - start);
  }
};
