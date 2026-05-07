import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const StarRating = ({ label, rating, onChange }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-3 border-b border-gray-100 last:border-0 gap-2 sm:gap-0">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-transform duration-200 hover:scale-110 focus:outline-none"
                    >
                        <svg
                            className={`w-6 h-6 sm:w-7 sm:h-7 ${rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>
    );
};

function SubmitReview() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                navigate('/login');
            } else {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const [formData, setFormData] = useState({
        propertyAddress: '',
        landlordName: '',
        city: '',
        ratings: {
            Responsiveness: 0,
            Condition: 0,
            Deposit: 0,
            Value: 0,
        },
        reviewText: '',
        moveInDate: '',
        moveOutDate: '',
        stillLiveHere: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleRatingChange = (category, rating) => {
        setFormData((prev) => ({
            ...prev,
            ratings: {
                ...prev.ratings,
                [category]: rating,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        setError('');
        try {
            await addDoc(collection(db, 'reviews'), {
                address: formData.propertyAddress,
                landlordName: formData.landlordName,
                city: formData.city,
                moveInDate: formData.moveInDate,
                moveOutDate: formData.stillLiveHere ? null : formData.moveOutDate,
                stillLiveHere: formData.stillLiveHere,
                ratings: {
                    Responsiveness: formData.ratings.Responsiveness,
                    Condition: formData.ratings.Condition,
                    Deposit: formData.ratings.Deposit,
                    Value: formData.ratings.Value,
                },
                reviewText: formData.reviewText,
                verified: formData.moveInDate ? true : false,
                createdAt: serverTimestamp(),
                uid: user.uid,
                email: user.email,
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-indigo-900">SubmitSafe</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Submit a Review</h1>
                        <p className="text-lg text-gray-600">Help others by sharing your rental experience.</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">

                            {success && (
                                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center">
                                    <span className="font-medium">Review submitted successfully! Redirecting...</span>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center">
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {/* Property Information */}
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">Property Information</h2>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Property Address</label>
                                    <input
                                        type="text"
                                        name="propertyAddress"
                                        value={formData.propertyAddress}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. 123 Main St, Apt 4B"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Hyderabad"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Landlord Name</label>
                                        <input
                                            type="text"
                                            name="landlordName"
                                            value={formData.landlordName}
                                            onChange={handleChange}
                                            placeholder="e.g. John Doe"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Move-in Date</label>
                                        <input
                                            type="date"
                                            name="moveInDate"
                                            value={formData.moveInDate}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-semibold text-gray-700">Move-out Date</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="stillLiveHere"
                                                    name="stillLiveHere"
                                                    checked={formData.stillLiveHere}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <label htmlFor="stillLiveHere" className="text-sm text-gray-600 cursor-pointer">I still live here</label>
                                            </div>
                                        </div>
                                        <input
                                            type="date"
                                            name="moveOutDate"
                                            value={formData.stillLiveHere ? '' : formData.moveOutDate}
                                            onChange={handleChange}
                                            disabled={formData.stillLiveHere}
                                            required={!formData.stillLiveHere}
                                            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none ${formData.stillLiveHere ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-gray-50 focus:bg-white'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ratings */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">Rate Your Experience</h2>
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <StarRating label="Responsiveness" rating={formData.ratings.Responsiveness} onChange={(val) => handleRatingChange('Responsiveness', val)} />
                                    <StarRating label="Condition/Maintenance" rating={formData.ratings.Condition} onChange={(val) => handleRatingChange('Condition', val)} />
                                    <StarRating label="Deposit Return" rating={formData.ratings.Deposit} onChange={(val) => handleRatingChange('Deposit', val)} />
                                    <StarRating label="Overall Value" rating={formData.ratings.Value} onChange={(val) => handleRatingChange('Value', val)} />
                                </div>
                            </div>

                            {/* Written Review */}
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">Written Review</h2>
                                <textarea
                                    name="reviewText"
                                    value={formData.reviewText}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Write your review here..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || success}
                                className={`w-full text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 ${isSubmitting || success ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isSubmitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Review'}
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmitReview;