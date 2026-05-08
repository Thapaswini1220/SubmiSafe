import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                navigate('/login');
            } else {
                setUser(currentUser);
                await fetchUserReviews(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchUserReviews = async (uid) => {
        try {
            setLoading(true);
            const q = query(collection(db, 'reviews'), where('uid', '==', uid));
            const querySnapshot = await getDocs(q);
            const fetchedReviews = [];
            querySnapshot.forEach((doc) => {
                fetchedReviews.push({ id: doc.id, ...doc.data() });
            });
            // Sort by newest first
            fetchedReviews.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching user reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return 'Unknown Date';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getAverageRating = (ratings) => {
        if (!ratings) return 0;
        const sum = (Number(ratings.Responsiveness) || 0) +
            (Number(ratings.Condition) || 0) +
            (Number(ratings.Deposit) || 0) +
            (Number(ratings.Value) || 0);
        return (sum / 4).toFixed(1);
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1 text-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (!user) return null; // Wait for redirect

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
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            My Profile
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">
                            {loading ? 'Loading...' : `You have submitted ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`}
                        </p>
                    </div>
                    <Link to="/submit" className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all">
                        Submit New Review
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{review.address}</h3>
                                        <p className="text-gray-600 font-medium">{review.city}</p>
                                        <div className="mt-2 text-sm text-gray-500">
                                            Landlord: <span className="font-semibold text-gray-800">{review.landlordName || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-2">
                                        <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <span className="font-bold text-gray-900 mr-2 text-lg">{getAverageRating(review.ratings)}</span>
                                            {renderStars(getAverageRating(review.ratings))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 my-4 bg-gray-50 rounded-xl px-4">
                                    {['Responsiveness', 'Condition', 'Deposit', 'Value'].map((cat) => (
                                        <div key={cat}>
                                            <div className="text-xs text-gray-500 mb-1">{cat}</div>
                                            <div className="flex items-center gap-1 font-semibold text-gray-900 text-sm">
                                                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                {review.ratings?.[cat] || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-gray-700 leading-relaxed italic">
                                    "{review.reviewText}"
                                </p>

                                <div className="mt-4 pt-4 text-xs text-gray-400 font-medium">
                                    Reviewed on {formatDate(review.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto mt-10">
                        <div className="text-6xl mb-4">✍️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No reviews yet</h2>
                        <p className="text-gray-600 mb-8">You haven't submitted any reviews. Help others by sharing your rental experience!</p>
                        <Link to="/submit" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all">
                            Submit Your First Review
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Profile;
