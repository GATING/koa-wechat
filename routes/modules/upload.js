const Router = require("koa-router");
const router = new Router({
  prefix: "/upload",
});
router.post("/", async (ctx) => {
  ctx.send({
    path: ctx.uploadPath,
  });
});
module.exports = router;
