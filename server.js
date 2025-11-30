import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// --- Path Helpers for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming 'dist' is the build output folder inside a 'frontend' directory, 
// which is two levels up from the backend server.js file.
const FRONTEND_BUILD_PATH = path.join(__dirname, '..', 'frontend', 'dist');



// --- Import Route Modules ---
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";  
import transactionRoutes from "./routes/transactionRoutes.js"; 
import bookRoutes from "./routes/bookRoutes.js";

dotenv.config();

const app = express();

// --- Dynamic PORT Configuration ---
const PORT = process.env.PORT || 5000; 
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; 


// Middlewares
app.use(express.json()); 
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));


// ----------------------------------------------------
// --- 1. API ROUTES (MUST COME BEFORE FALLBACK) ---
// ----------------------------------------------------

app.use("/api", authRoutes);
app.use("/api", adminRoutes); 
app.use('/api/transactions', transactionRoutes); 
app.use('/api/books', bookRoutes);


// ----------------------------------------------------
// --- 2. UNIVERSAL FALLBACK ROUTE FOR REACT FRONTEND ---
// ----------------------------------------------------

// Serve static assets (JS, CSS, images)
app.use(express.static(FRONTEND_BUILD_PATH));


// 1. Serve static assets (JS, CSS, images) from the built frontend directory
app.use(express.static(FRONTEND_BUILD_PATH));

// 2. Catch-all: For any GET request that hasn't hit an /api route,
// serve the frontend's index.html file. This allows React Router to take over.
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(FRONTEND_BUILD_PATH, "index.html"));
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("🔥 MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Error:", err);
    process.exit(1);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
