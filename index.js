const app = require("./server");
const Config = require("./config/config");
const { dbConnection } = require("./database/config");

dbConnection().then(async function onServerInit() {
  console.log("DB connected");

  app.listen(Config.app.PORT, () => {
    console.log(`Serving on port ${Config.app.PORT}`);
  });
});
