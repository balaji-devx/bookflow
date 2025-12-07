import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar";
import Footer from "../components/footer";
import "../pages/css/App.css"; // Your global styling file
import { API_BASE_URL } from '../utils/apiConfig';

function Lend() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Initial state for the book submission form
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        edition: '',
        condition: 'Good', // Default condition
        isbn: '',
        imageUrl: '',
        lendingDuration: '6', // Default lending term in months
        lendingCopies: 1,      // Default copies
        depositMultiplier: 0.5, // 50% refundable deposit
    });

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // --- Utility Functions ---
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) : value 
        }));
    };

    // --- Form Validation & Submission ---
    const handleSubmitLend = async (e) => {
        e.preventDefault();
        
        if (!token) {
            showToast("Please log in to submit a book for lending.");
            navigate('/login');
            return;
        }

        if (!formData.title || !formData.author || !formData.isbn) {
            showToast("Title, Author, and ISBN are required.");
            return;
        }

        setLoading(true);

        // 1. Structure the payload for the backend (must be added to a new /lend API route)
        const lendPayload = {
            title: formData.title,
            author: formData.author,
            isbn: formData.isbn,
            edition: formData.edition,
            condition: formData.condition,
            imgUrl: formData.imageUrl,
            copies: formData.lendingCopies,
            // These details would link to the authenticated user's ID in the backend
            // for tracking ownership and royalty/deposit payments.
        };
        
        // 🚨 IMPORTANT: You will need to create a new backend API route: /api/lend
        try {
            const response = await fetch(`${API_BASE_URL}/lend/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify(lendPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lending submission failed.');
            }

            // 2. Success: Clear form, notify user, and redirect
            showToast("✅ Submission Successful! Awaiting review.");
            setFormData({ // Clear all non-default fields
                title: '', author: '', edition: '', condition: 'Good', 
                isbn: '', imageUrl: '', lendingDuration: '6', lendingCopies: 1, 
                depositMultiplier: 0.5,
            });
            
            // Redirect user to their profile or a specific success page
            setTimeout(() => navigate('/profile'), 1000); 
            
        } catch (err) {
            console.error("Lend submission API Error:", err);
            setToast(err.message || 'Error submitting your book. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Render JSX ---
    return (
        <>
            <NavBar />
            <main className="lend-page-wrapper">
                <div className="lend-form-container">
                    <h1 className="lend-title">Lend Your Books to Us </h1>
                    <p className="lend-subtitle">
                        Expand our community inventory! Submit your books below to list them for borrowing. 
                    </p>

                    <form className="lend-form" onSubmit={handleSubmitLend}>
                        <h2>Book Identification Details</h2>
                        <div className="form-group">
                            <label htmlFor="title">Title:</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="author">Author:</label>
                            <input type="text" id="author" name="author" value={formData.author} onChange={handleInputChange} required />
                        </div>
                        
                        <div className="form-row-2">
                            <div className="form-group">
                                <label htmlFor="isbn">ISBN (Required for verification):</label>
                                <input type="text" id="isbn" name="isbn" value={formData.isbn} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edition">Edition / Year:</label>
                                <input type="text" id="edition" name="edition" value={formData.edition} onChange={handleInputChange} />
                            </div>
                        </div>

                        <h2>Lending Terms & Condition</h2>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label htmlFor="copies">Number of Copies to Lend:</label>
                                <input 
                                    type="number" 
                                    id="copies" 
                                    name="lendingCopies" 
                                    value={formData.lendingCopies} 
                                    onChange={handleInputChange} 
                                    min="1"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="duration">Minimum Lending Duration (Months):</label>
                                <select id="duration" name="lendingDuration" value={formData.lendingDuration} onChange={handleInputChange}>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="12">12 Months</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="condition">Book Condition:</label>
                            <select id="condition" name="condition" value={formData.condition} onChange={handleInputChange} required>
                                <option value="New">New (Unused)</option>
                                <option value="Good">Good (Minor wear)</option>
                                <option value="Acceptable">Acceptable (Significant wear)</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="imageUrl">Image URL (Optional):</label>
                            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} />
                        </div>
                        

                        <button type="submit" className="submit-lend-btn" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Book for Review"}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
            {toast && <div className="toast" role="status">{toast}</div>}
        </>
    );
}

export default Lend;