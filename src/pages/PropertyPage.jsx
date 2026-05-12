import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function PropertyPage() {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [shareCopied, setShareCopied] = useState(false);
    const [selectedCity, setSelectedCity] = useState('All');
    const [filterVerified, setFilterVerified] = useState(false);
    const [filterRecent, setFilterRecent] = useState(false);
    const [filterRating, setFilterRating] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!searchQuery) {
                setLoading(false);
                return;
            }
            try {
                let fetchedReviews = [];
                const allSnapshot = await getDocs(collection(db, 'reviews'));
                const searchLower = searchQuery.toLowerCase();
                allSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const address = (data.address || '').toLowerCase();
                    const city = (data.city || '').toLowerCase();
                    const landlord = (data.landlordName || '').toLowerCase();
                    if (address.includes(searchLower) || city.includes(searchLower) || landlord.includes(searchLower)) {
                        fetchedReviews.push({ id: doc.id, ...data });
                    }
                });
                setReviews(fetchedReviews);
                setSelectedCity('All');
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [searchQuery]);

    const getReviewAverage = (review) => {
        if (!review || !review.ratings) return 0;
        const r = Number(review.ratings.Responsiveness) || 0;
        const c = Number(review.ratings.Condition) || 0;
        const d = Number(review.ratings.Deposit) || 0;
        const v = Number(review.ratings.Value) || 0;
        return (r + c + d + v) / 4;
    };

    const uniqueCities = useMemo(() => {
        const cities = reviews.map(r => r.city).filter(Boolean);
        return ['All', ...new Set(cities)];
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        let result = reviews;
        if (selectedCity !== 'All') {
            result = result.filter(r => r.city === selectedCity);
        }
        if (filterVerified) {
            result = result.filter(r => r.verified === true);
        }
        if (filterRecent) {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            result = result.filter(r => {
                const createdAt = r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : null;
                return createdAt && createdAt >= sixMonthsAgo;
            });
        }
        if (filterRating) {
            result = result.filter(r => getReviewAverage(r) >= 3);
        }
        return result;
    }, [reviews, selectedCity, filterVerified, filterRecent, filterRating]);

    const overallAverage = useMemo(() => {
        if (filteredReviews.length === 0) return 0;
        const total = filteredReviews.reduce((acc, review) => acc + getReviewAverage(review), 0);
        return (total / filteredReviews.length).toFixed(1);
    }, [filteredReviews]);

    const sortedReviews = useMemo(() => {
        const sorted = [...filteredReviews];
        if (sortBy === 'newest') {
            sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        } else if (sortBy === 'highest') {
            sorted.sort((a, b) => getReviewAverage(b) - getReviewAverage(a));
        } else if (sortBy === 'lowest') {
            sorted.sort((a, b) => getReviewAverage(a) - getReviewAverage(b));
        }
        return sorted;
    }, [filteredReviews, sortBy]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    const handleWhatsAppShare = () => {
        const url = `https://wa.me/?text=Check out this property review on SubmitSafe: ${window.location.href}`;
        window.open(url, '_blank');
    };

    const renderStars = (rating) => (
        <div className="flex gap-1 text-sm">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-4 h-4 ${rating >= star ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return 'Unknown Date';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
                        <Link to="/submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all">
                            Submit Review
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Search
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Results for "{searchQuery}"
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">
                                {loading ? 'Searching...' : `${filteredReviews.length} reviews found`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* WhatsApp Share Button */}
                            <button
                                onClick={handleWhatsAppShare}
                                className="inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-colors"
                                title="Share on WhatsApp"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </button>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm"
                            >
                                <option value="newest">Newest</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {!loading && uniqueCities.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {uniqueCities.map((city) => (
                            <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${selectedCity === city ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-indigo-600'}`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                )}

                {!loading && (
                    <div className="flex flex-wrap gap-3 mb-8 pb-4 border-b border-gray-100">
                        <button
                            onClick={() => setFilterVerified(!filterVerified)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterVerified ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200'}`}
                        >
                            <svg className={`w-4 h-4 mr-2 ${filterVerified ? 'text-white' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified Only
                        </button>
                        <button
                            onClick={() => setFilterRecent(!filterRecent)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterRecent ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200'}`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Last 6 months
                        </button>
                        <button
                            onClick={() => setFilterRating(!filterRating)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterRating ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200'}`}
                        >
                            <svg className={`w-4 h-4 mr-2 ${filterRating ? 'text-white' : 'text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Rating 3+
                        </button>
                    </div>
                )}

                {!loading && filteredReviews.length > 0 && parseFloat(overallAverage) < 3.0 && (
                    <div className="bg-red-600 text-white px-6 py-5 rounded-2xl shadow-xl mb-8 flex items-start sm:items-center gap-4 border border-red-700">
                        <div className="bg-red-700 p-2 rounded-full shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-extrabold text-lg sm:text-xl tracking-tight">
                                ⚠️ WARNING — This property has been flagged by {filteredReviews.length} {filteredReviews.length === 1 ? 'tenant' : 'tenants'} for poor conditions.
                            </p>
                            <p className="text-red-100 font-medium text-base mt-1">Read reviews carefully before signing any lease.</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredReviews.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Overall Score</h2>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="text-5xl font-extrabold text-gray-900">{overallAverage}</div>
                                    <div className="flex flex-col">
                                        <div className="flex text-amber-400 mb-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} className={`w-6 h-6 ${overallAverage >= star ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500 font-medium">Based on {filteredReviews.length} reviews</span>
                                        {filteredReviews.length >= 10 ? (
                                            <span className="mt-1.5 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 w-max">Highly Trusted</span>
                                        ) : filteredReviews.length >= 5 ? (
                                            <span className="mt-1.5 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 w-max">Credible</span>
                                        ) : filteredReviews.length >= 2 ? (
                                            <span className="mt-1.5 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 w-max">Growing</span>
                                        ) : (
                                            <span className="mt-1.5 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 w-max">New</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-xs text-yellow-800 leading-relaxed">
                                    ⚠️ Reviews are submitted anonymously by tenants. SubmitSafe does not verify individual claims. Use reviews as a guide, not as absolute truth.
                                </div>

                                {parseFloat(overallAverage) < 2.5 && (
                                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 flex items-center gap-3 mb-6">
                                        <span className="text-2xl">⚠️</span>
                                        <div>
                                            <p className="font-bold text-sm">Poor Landlord Alert</p>
                                            <p className="text-xs">Consistently low ratings reported.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    {['Responsiveness', 'Condition', 'Deposit', 'Value'].map((category) => {
                                        const catAvg = (filteredReviews.reduce((acc, rev) => acc + (Number(rev.ratings?.[category]) || 0), 0) / filteredReviews.length).toFixed(1);
                                        return (
                                            <div key={category} className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">{category}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">{catAvg}</span>
                                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(catAvg / 5) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {sortedReviews.map((review) => (
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
                                                <span className="font-bold text-gray-900 mr-2 text-lg">{getReviewAverage(review).toFixed(1)}</span>
                                                {renderStars(getReviewAverage(review))}
                                            </div>
                                            {review.verified && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                    Verified Tenant
                                                </span>
                                            )}
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

                                    <p className="text-gray-700 leading-relaxed italic">"{review.reviewText}"</p>

                                    <div className="mt-4 pt-4 text-xs text-gray-400 font-medium">
                                        Reviewed on {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto mt-10">
                        <div className="text-6xl mb-4">🏠</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No reviews found</h2>
                        <p className="text-gray-600 mb-8">We couldn't find any reviews matching "{searchQuery}". Be the first to share your experience!</p>
                        <Link to="/submit" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all">
                            Submit a Review
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PropertyPage;