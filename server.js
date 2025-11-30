import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";  
import transactionRoutes from "./routes/transactionRoutes.js"; 
import bookRoutes from "./routes/bookRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// --- 1. Dynamic PORT Configuration ---
// Use the port provided by the environment (Render), or default to 5000 for local development.
const PORT = process.env.PORT || 5000; 


// --- 2. CORS Configuration for Deployment ---
// IMPORTANT: Replace 'https://bookflow-client.onrender.com' with the actual URL of your deployed frontend.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Default to Vite port

// Middlewares
app.use(express.json()); // Body parser must come before CORS/Routes
app.use(cors({
    // Allow access from the specific deployed frontend URL and localhost for development
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true, // Allows cookies/authorization headers
}));


// Routes
app.use("/api", authRoutes);
app.use("/api", adminRoutes); 
app.use('/api/transactions', transactionRoutes); 
app.use('/api/books', bookRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("🔥 MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Error:", err);
    // Exit process if DB connection fails, which is fatal
    process.exit(1); 
});

// Start Server
app.listen(PORT, () => { // 🎯 Use the dynamic PORT variable
  console.log(`🚀 Server running on port ${PORT}`);
});
