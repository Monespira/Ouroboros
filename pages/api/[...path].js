const serverless = require("serverless-http");
const { app } = require("../../server/dist/server");

const handler = serverless(app);

module.exports = handler;

module.exports.config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
