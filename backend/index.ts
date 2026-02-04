import express from "express";
import cors from "cors";

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.status(200).json({ message: "API is running" });
});

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
