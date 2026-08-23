import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Gallery from './components/Gallery';
import SubmissionUpload from './components/submission/SubmissionUpload';
import SubmissionPage from './components/submission/SubmissionPage';

function App() {
  return (
    <Router basename='/'>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/upload' element={<SubmissionUpload />} />
          <Route path='/submission/:id' element={<SubmissionPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
