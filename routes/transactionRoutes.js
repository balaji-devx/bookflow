import express from 'express';
// 1. Import your custom middleware and controller
import { auth, adminOnly } from '../middleware/auth.js'; 
// 🎯 UPDATE: Import ALL transaction controller functions
import { 
    placeOrder, 
    placeBorrowRequest,
    getUserOrders,
    getUserBorrows,
    getPendingOrders, 
    getActiveBorrows,
    markOrderShipped, // 👈 ADDED
    updateBorrowStatus // 👈 ADDED
} from '../controllers/transactionController.js';

const router = express.Router();

// -----------------------------------------------------------
// --- USER TRANSACTION ROUTES (Authentication Required) ---
// -----------------------------------------------------------

// 1. BUYING ROUTE (Order Placement)
// Endpoint: POST /api/transactions/order
router.post('/order', auth, placeOrder);

// 2. BORROWING ROUTE (Request Placement)
// Endpoint: POST /api/transactions/borrow
router.post('/borrow', auth, placeBorrowRequest); 

// 3. GET USER ORDER HISTORY
// Endpoint: GET /api/transactions/user/orders
router.get('/user/orders', auth, getUserOrders);

// 4. GET USER BORROW HISTORY
// Endpoint: GET /api/transactions/user/borrows
router.get('/user/borrows', auth, getUserBorrows);


// -----------------------------------------------------------
// --- ADMIN TRACKING ROUTES (Auth + adminOnly Required) ---
// -----------------------------------------------------------

// 5. GET ALL PENDING ORDERS (Admin)
// Endpoint: GET /api/transactions/admin/orders/pending
// Used for the Admin Dashboard fulfillment table.
router.get('/admin/orders/pending', auth, adminOnly, getPendingOrders);

// 6. GET ALL ACTIVE BORROWS (Admin)
// Endpoint: GET /api/transactions/admin/borrows/active
// Used for the Admin Dashboard loan tracking table.
router.get('/admin/borrows/active', auth, adminOnly, getActiveBorrows);

// 7. MARK ORDER AS SHIPPED
// Endpoint: PATCH /api/transactions/admin/orders/:id/ship
// ✅ FIX: Include '/admin/orders' to match the URL you are sending from the frontend/Postman.
router.patch('/admin/orders/:id/ship', auth, adminOnly, markOrderShipped);

// 8. UPDATE BORROW STATUS (Confirm Borrowed/Returned)
// Endpoint: PATCH /api/transactions/admin/borrows/:id/status
// ✅ FIX: Include '/admin/borrows' to match the URL sent by the client.
router.patch('/admin/borrows/:id/status', auth, adminOnly, updateBorrowStatus);


export default router;