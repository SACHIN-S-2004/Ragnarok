import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import RealmExperience from './pages/RealmExperience';

import './App.css'

function App() {

    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/realms' element={<RealmExperience />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
