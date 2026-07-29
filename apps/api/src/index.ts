import express from "express";
import cors from "cors";
import "dotenv/config";
import router from "./routes/index.js";
import { initCronJobs } from "./cron.js";
import { apiLimiter } from "./utils/middlewares/index.js";

const PORT = process.env.PORT || 4000;
const TZ = process.env.TZ || "UTC";

const app = express();
app.disable('x-powered-by')

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(apiLimiter);
app.use("/api/v1", router);

initCronJobs()

app.listen(PORT, () => {
  console.log(`Express running on ${PORT}`);
  console.log(`Server Time: ${new Date()}`, TZ);
});
