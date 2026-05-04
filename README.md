# SubmitSafe 🏠

SubmitSafe is the "Glassdoor for rentals" — a platform where tenants can anonymously rate and review their landlords and rental properties. By bringing transparency to the rental market, SubmitSafe empowers renters to make informed decisions before signing a lease.

## 🌟 Features

- **Advanced Search**: Instantly search for properties or landlords by city or specific address.
- **Anonymous Reviews**: Submit honest feedback securely and anonymously.
- **Detailed Rating System**: Rate properties across four crucial categories (1-5 stars):
  - 📞 Responsiveness
  - 🛠️ Condition/Maintenance
  - 💰 Deposit Return
  - 💎 Overall Value
- **Overall Score Card**: Automatically calculates aggregated scores for properties with multiple reviews.
- **🚩 Red Flag System**: Automatically displays a warning badge for landlords with an average rating below 2.5.
- **✅ Verified Tenant Badge**: Highlights reviews from users who can verify they actually lived at the property.
- **Sort & Filter**: Sort reviews by Newest, Highest Rated, or Lowest Rated.
- **Shareable Links**: Built-in share button to easily copy and send property review pages to friends or roommates.

## 🚀 Tech Stack

- **Frontend**: React, Vite
- **Styling**: Tailwind CSS
- **Backend/Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Deployment**: Vercel

## 🌐 Live Demo

[Link to Live Project](#) *(Update this with your Vercel URL once deployed)*

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your application)*

| Home Page | Property Search Results |
| :---: | :---: |
| ![Home Page](https://via.placeholder.com/400x250?text=Home+Page) | ![Property Page](https://via.placeholder.com/400x250?text=Property+Results) |

| Submit a Review | Red Flag Warning |
| :---: | :---: |
| ![Submit Review](https://via.placeholder.com/400x250?text=Submit+Review+Form) | ![Red Flag Badge](https://via.placeholder.com/400x250?text=Poor+Landlord+Badge) |

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/submitsafe.git
   cd submitsafe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Firestore Database** and **Authentication** (Email/Password).
   - Get your Firebase config object from the Project Settings.
   
4. **Environment Variables**
   - Create a `.env.local` file in the root directory.
   - Add your Firebase configuration keys:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
