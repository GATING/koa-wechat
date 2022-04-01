FROM keymetrics/pm2:latest-alpine

# 作者
MAINTAINER gating

# 执行命令，创建文件夹
RUN mkdir -p /home/koa-wechat

# 将koa-wechat目录拷贝到镜像里
ADD . /home/koa-wechat

# 指定工作目录
WORKDIR /home/koa-wechat

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# Expose the listening port of your app
EXPOSE 80

# Show current folder structure in logs
# RUN ls -al -R

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]