import mongoose from "mongoose";
const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/myapp";

const db = {
  connect: () => {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV === "test") {
        /*
              Mocking Mongoose for integration testing 
            */
        const Mockgoose = require("mockgoose").Mockgoose;
        const mockgoose = new Mockgoose(mongoose);

        mockgoose.prepareStorage().then(() => {
          mongoose
            .connect(DB_URI, {
              useNewUrlParser: true,
              useCreateIndex: true,
              useUnifiedTopology: true,
            })
            .then((_) => {
              resolve();
            });
        });
      } else {
        mongoose
          .connect(DB_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
          })
          .then((_) => {
            resolve();
          });
      }
    });
  },

  close: () => {
    return mongoose.disconnect();
  },
};

export default db;
