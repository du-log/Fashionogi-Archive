import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Gallery from './components/gallery/Gallery';
import SubmissionUpload from './components/submission/SubmissionUpload';
import SubmissionPage from './components/submission/SubmissionPage';
import LoginPage from './components/user/LoginPage';
import SignUpPage from './components/user/SignUpPage';
import AuthProvider from './contexts/AuthProvider';
import AdminDashboard from './components/admin/AdminDashboard';
import PendingSubs from './components/admin/PendingSubs';
import TagManagement from './components/admin/TagManagement';
import DeletionSubs from './components/admin/DeletionSubs';
import EquipManagement from './components/admin/EquipManagement';
import UserProfile from './components/user/UserProfile';
import UserDashboard from './components/user/UserDashboard';
import AccountSettings from './components/user/AccountSettings';

function App() {
  return (
    <AuthProvider>
      <Router basename='/'>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/gallery' element={<Gallery />} />
            <Route path='/upload' element={<SubmissionUpload />} />
            <Route path='/fashion/id/:id' element={<SubmissionPage />} />
            <Route path='/profile/:username' element={<UserProfile />} />
            <Route path='/account/dashboard' element={<UserDashboard />} />
            <Route path='/account/settings' element={<AccountSettings />} />
          </Route>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<SignUpPage />} />
          <Route path='/admin' element={<AdminDashboard />}>
            <Route path='/admin/pending' element={<PendingSubs />} />
            <Route path='/admin/tags' element={<TagManagement />} />
            <Route path='/admin/equip' element={<EquipManagement />} />
            <Route path='/admin/deletion' element={<DeletionSubs />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
