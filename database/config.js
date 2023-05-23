const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB Online");

  } catch (error) {
    console.log(error);
    throw new Error("Could not initialize DB");
  }
};

module.exports = {
  dbConnection,
};
module.exports.dbConnection = dbConnection;