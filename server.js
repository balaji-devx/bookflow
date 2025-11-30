import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// --- Path Helpers for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming your frontend build (dist) is two levels up from the backend root
const FRONTEND_BUILD_PATH = path.join(__dirname, '..', '..', 'frontend', 'dist');


// --- Import Route Modules ---
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";  
import transactionRoutes from "./routes/transactionRoutes.js"; 
import bookRoutes from "./routes/bookRoutes.js";

dotenv.config();

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 5000; 
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; 


// Middlewares
app.use(express.json()); 
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));


// 1. API ROUTES 
app.use("/api", authRoutes);
app.use("/api", adminRoutes); 
app.use('/api/transactions', transactionRoutes); 
app.use('/api/books', bookRoutes);


// ----------------------------------------------------
// --- 🎯 CORRECTED UNIVERSAL FALLBACK FOR REACT ---
// ----------------------------------------------------

// Serve static assets (JS, CSS, images)
app.use(express.static(FRONTEND_BUILD_PATH));


// FIX: Use app.use() middleware to catch remaining GET requests.
// This resolves the PathError by avoiding the problematic app.get('*') syntax.
app.use((req, res, next) => {
    // If the request is for a frontend page (and not an /api route), serve index.html
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.resolve(FRONTEND_BUILD_PATH, 'index.html')); 
    }
    next();
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
