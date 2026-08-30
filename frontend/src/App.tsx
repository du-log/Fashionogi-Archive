import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Gallery from './components/Gallery';
import SubmissionUpload from './components/submission/SubmissionUpload';
import SubmissionPage from './components/submission/SubmissionPage';
import LoginPage from './components/user/LoginPage';
import SignUpPage from './components/user/SignUpPage';
import AuthProvider from './contexts/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router basename='/'>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/gallery' element={<Gallery />} />
            <Route path='/upload' element={<SubmissionUpload />} />
            <Route path='/submission/:id' element={<SubmissionPage />} />
          </Route>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<SignUpPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
