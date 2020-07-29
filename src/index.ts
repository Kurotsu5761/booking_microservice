import app from "./app";
import db from "./db";

const PORT = process.env.PORT || 8000;

db.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
});
