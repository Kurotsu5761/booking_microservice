import express from "express";
import bodyParser from "body-parser";
import { BookingRouter } from "./routes";

const app: express.Application = express();
app.use(bodyParser.json());

app.use("/booking", BookingRouter);

export default app;
