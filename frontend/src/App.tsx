import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TatCa from './pages/TatCa'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TatCa />} />
        <Route path="/tat-ca" element={<TatCa />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
