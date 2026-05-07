import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allLocations, setAllLocations] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchRecentReviews = async () => {
            try {
                const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(3));
                const querySnapshot = await getDocs(q);
                const reviews = [];
                querySnapshot.forEach((doc) => {
                    reviews.push({ id: doc.id, ...doc.data() });
                });
                setRecentReviews(reviews);
            } catch (error) {
                console.error("Error fetching recent reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentReviews();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAllLocations = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'reviews'));
                const locations = new Set();
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.city) locations.add(data.city);
                    if (data.address) locations.add(data.address);
                });
                setAllLocations(Array.from(locations));
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };
        fetchAllLocations();
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const q = searchQuery.toLowerCase();
        const matches = allLocations.filter(loc => loc.toLowerCase().includes(q)).slice(0, 5);
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
    }, [searchQuery, allLocations]);

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        navigate(`/property?search=${encodeURIComponent(suggestion)}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/property?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const getAverageRating = (ratings) => {
        if (!ratings) return 0;
        const sum = ratings.Responsiveness + ratings.Condition + ratings.Deposit + ratings.Value;
        return (sum / 4).toFixed(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative z-0 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:bg-indigo-700 transition-colors shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <span className="font-extrabold text-2xl tracking-tight text-gray-900 group-hover:text-indigo-700 transition-colors">SubmitSafe</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {user.email || 'Anonymous'}
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
                            <Link
                                to="/submit"
                                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
                            >
                                Submit Review
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center pt-24 pb-32">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                        Find Your Next Home <span className="text-indigo-600">Safely</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Search thousands of reviews by real tenants to discover the truth about properties and landlords before you sign a lease.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 shadow-xl shadow-indigo-100/50 p-2 bg-white rounded-2xl border border-gray-100">
                        <div className="relative flex-grow" ref={searchRef}>
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-14 pr-4 py-4 bg-transparent border-none rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-lg"
                                placeholder="Enter city or property address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                autoComplete="off"
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                                    <ul className="py-2 m-0 text-left">
                                        {suggestions.map((suggestion, index) => (
                                            <li key={index} className="border-b border-gray-50 last:border-0">
                                                <button
                                                    type="button"
                                                    className="w-full text-left px-5 py-3 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors font-medium focus:bg-indigo-50 focus:outline-none"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                >
                                                    {suggestion}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all shadow-md w-full sm:w-auto"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-[100px]"></div>
                    <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[100px]"></div>
                </div>
            </main>

            {/* How it works Section */}
            <section className="py-24 bg-white relative z-10 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">How It Works</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Three simple steps to making better rental decisions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="text-5xl mb-6">🔍</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Search your property</h3>
                            <p className="text-gray-600">Enter a city, landlord name, or specific property address into our search bar.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="text-5xl mb-6">📖</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Read honest reviews</h3>
                            <p className="text-gray-600">See what past and current tenants have to say about maintenance, deposits, and value.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="text-5xl mb-6">✍️</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Share your experience</h3>
                            <p className="text-gray-600">Help others by leaving your own anonymous review for places you've lived.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Reviews Section */}
            <section className="py-24 bg-gray-50 relative z-10 border-t border-gray-200 flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Recent Reviews</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">See the latest insights shared by our community.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : recentReviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {recentReviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{review.address}</h3>
                                            <p className="text-sm text-indigo-600 font-medium">{review.city}</p>
                                        </div>
                                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                            <span className="text-amber-500 mr-1">★</span>
                                            <span className="font-bold text-amber-700">{getAverageRating(review.ratings)}</span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-gray-500 font-medium uppercase tracking-wider text-xs">Landlord</p>
                                        <p className="text-gray-800">{review.landlordName || 'Unknown'}</p>
                                    </div>
                                    {review.reviewText && (
                                        <div className="mt-auto pt-4 border-t border-gray-50">
                                            <p className="text-gray-600 text-sm line-clamp-3 italic">"{review.reviewText}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No reviews found yet. Be the first to submit one!
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">SubmitSafe</span>
                        </div>
                        <div className="flex items-center flex-col sm:flex-row gap-4 sm:gap-8">
                            <span className="text-gray-500 text-sm text-center sm:text-left">© 2025 SubmitSafe. All rights reserved.</span>
                            <Link to="/submit" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                Submit a Review
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;