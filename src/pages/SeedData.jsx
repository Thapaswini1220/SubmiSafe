import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const sampleData = [
    {
        address: "Flat 402, Sunshine Apartments, HSR Layout",
        landlordName: "Ramesh Reddy",
        city: "Bengaluru",
        reviewText: "Great apartment with good ventilation. The landlord is very responsive to maintenance requests, but the rent is a bit high.",
    },
    {
        address: "Villa 15, Green Meadows, Gachibowli",
        landlordName: "Srinivas Rao",
        city: "Hyderabad",
        reviewText: "Beautiful villa in a gated community. The landlord deducted a large portion of the deposit for minor wear and tear.",
    },
    {
        address: "Apt 2B, Sea View Residency, Bandra West",
        landlordName: "Amitabh Desai",
        city: "Mumbai",
        reviewText: "Amazing location right by the sea. The building is old and plumbing issues are common. Landlord takes time to fix things.",
    },
    {
        address: "House No 45, Sector 21, Salt Lake City",
        landlordName: "Ananya Banerjee",
        city: "Kolkata",
        reviewText: "Spacious house in a quiet neighborhood. The landlord is extremely polite and didn't raise the rent for two years.",
    },
    {
        address: "Flat 101, Lotus Towers, Vasant Kunj",
        landlordName: "Vikram Singh",
        city: "New Delhi",
        reviewText: "Good location but the apartment was not clean when we moved in. Landlord was unhelpful during water shortages.",
    },
    {
        address: "3rd Floor, Shivam Complex, Kothrud",
        landlordName: "Prakash Kadam",
        city: "Pune",
        reviewText: "Affordable rent and decent condition. The landlord is strict about rules but generally fair.",
    },
    {
        address: "Villa 7, Palm Grove, ECR",
        landlordName: "Karthik Iyer",
        city: "Chennai",
        reviewText: "Luxurious villa, very well maintained. Landlord lives abroad so communication is sometimes delayed.",
    },
    {
        address: "Flat 505, Royal Enclave, Navrangpura",
        landlordName: "Patel Properties",
        city: "Ahmedabad",
        reviewText: "Good society amenities. The property management company is very professional and handles issues quickly.",
    },
    {
        address: "House 12, Bani Park",
        landlordName: "Rajendra Sharma",
        city: "Jaipur",
        reviewText: "Beautiful heritage style house. Winter heating was an issue and the landlord refused to upgrade the geyser.",
    },
    {
        address: "Apt 8C, IT Park View, Madhapur",
        landlordName: "Sita Reddy",
        city: "Hyderabad",
        reviewText: "Perfect for IT professionals. Very close to offices. Landlord is friendly and returned the full deposit without hassle.",
    }
];

const getRandomRating = () => Math.floor(Math.random() * 5) + 1;
const getRandomBoolean = () => Math.random() >= 0.5;

function SeedData() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSeedData = async () => {
        setLoading(true);
        setMessage('');
        
        try {
            const reviewsRef = collection(db, 'reviews');
            
            for (const item of sampleData) {
                await addDoc(reviewsRef, {
                    address: item.address,
                    landlordName: item.landlordName,
                    city: item.city,
                    ratings: {
                        Responsiveness: getRandomRating(),
                        Condition: getRandomRating(),
                        Deposit: getRandomRating(),
                        Value: getRandomRating(),
                    },
                    reviewText: item.reviewText,
                    verified: getRandomBoolean(),
                    createdAt: serverTimestamp(),
                    uid: 'seed',
                    email: 'seed@submitsafe.com'
                });
            }
            
            setMessage('Successfully added 10 sample reviews to Firestore!');
        } catch (error) {
            console.error("Error adding sample data: ", error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                <div className="mb-6">
                    <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Seeder</h1>
                    <p className="text-gray-600 text-sm">Populate your Firestore 'reviews' collection with 10 sample properties from across India.</p>
                </div>
                
                <button
                    onClick={handleSeedData}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all ${
                        loading 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                    }`}
                >
                    {loading ? 'Adding Data...' : 'Add Sample Reviews'}
                </button>
                
                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                        message.includes('Error') 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeedData;
