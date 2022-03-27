module.exports = () => async (ctx, next) =>
  next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      return ctx.sendError(19999);
    } else {
      throw err;
    }
  });
