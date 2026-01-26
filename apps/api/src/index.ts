import express from "express";
import cors from "cors";
import "dotenv/config";
import router from "./routes";

const PORT = process.env.PORT || 4000;
const TZ = process.env.TZ || "UTC";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Express running on ${PORT}`);
  console.log(`Server Time: ${new Date()}`, TZ);
});
