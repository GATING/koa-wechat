const xml2js = require("xml2js");
const template = require("./tpl");

const formatMessage = (result) => {
  let message = {};
  if (typeof result === "object") {
    const keys = Object.keys(result);

    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]];
      let key = keys[i];

      if (!(item instanceof Array) || item.length === 0) {
        continue;
      }

      if (item.length === 1) {
        let val = item[0];
        if (typeof val === "object") {
          message[key] = formatMessage(val);
        } else {
          message[key] = (val || "").trim();
        }
      } else {
        message[key] = [];

        for (let j = 0; j < item.length; j++) {
          message[key].push(formatMessage(item[j]));
        }
      }
    }
  }
  return message;
};
exports.formatMessage = formatMessage;
exports.parseXML = (xml) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(
      xml,
      {
        trim: true,
      },
      (err, content) => {
        if (err) reject(err);
        else resolve(content);
      }
    );
  });
};
exports.tpl = (content, message) => {
  let type = "text";
  if (Array.isArray(content)) {
    type = "news";
  }

  if (!content) content = "Empty News";
  if (content && content.type) {
    type = content.type;
  }
  let info = Object.assign(
    {},
    {
      content: content,
      msgType: type,
      createTime: new Date().getTime(),
      toUserName: message.FromUserName,
      fromUserName: message.ToUserName,
    }
  );
  console.log(type, template(info));

  return template(info);
};
