import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PropertyPage from './pages/PropertyPage'
import SubmitReview from './pages/SubmitReview'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property" element={<PropertyPage />} />
        <Route path="/submit" element={<SubmitReview />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App