import type React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import AddAction from './components/AddAction'

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add-action" element={<AddAction />} />
    </Routes>
  </BrowserRouter>
)

export default App
