import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PropertyPage from './pages/PropertyPage'
import SubmitReview from './pages/SubmitReview'
import Login from './pages/Login'
import SeedData from './pages/SeedData'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property" element={<PropertyPage />} />
        <Route path="/submit" element={<SubmitReview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seed" element={<SeedData />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App