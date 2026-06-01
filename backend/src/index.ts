import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("al parecer funciona");
});

app.get("/api/transactions/:userId", (req, res) => {
  res.json([]);
});

app.post("/api/transactions", (req, res) => {
  res.json({ id: Date.now().toString() });
});

app.listen(4000, () => {
  console.log("Backend corriendo http://localhost:4000");
});