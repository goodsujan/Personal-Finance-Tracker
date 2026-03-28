import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<div className="p-8 text-xl font-medium">Login page coming soon</div>} />
        <Route path="/dashboard" element={<div className="p-8 text-xl font-medium">Dashboard coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
