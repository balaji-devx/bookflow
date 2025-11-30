import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";  
import dotenv from "dotenv";

// 🎯 FIX: IMPORT THE TRANSACTION ROUTES
import transactionRoutes from "./routes/transactionRoutes.js"; 
import bookRoutes from "./routes/bookRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", adminRoutes); 
// This line needs the variable defined above:
app.use('/api/transactions', transactionRoutes); 
app.use('/api/books', bookRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("🔥 MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// Start Server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});