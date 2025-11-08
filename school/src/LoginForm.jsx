import React, { useState, useEffect } from 'react';
import { Mail, Shield, Eye, EyeOff, GraduationCap, User, UserPlus } from 'lucide-react';

const LoginForm = ({ loginForm, setLoginForm, handleLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    showPassword: false
  });
  const backgroundOptions = [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2060&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2060&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=2060&auto=format&fit=crop'
  ];
  const [bgIndex, setBgIndex] = useState(0);

  // Auto-slide background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prevIndex) => (prevIndex + 1) % backgroundOptions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundOptions.length]);

  // Auto-detect role from email pattern
  const detectRoleFromEmail = (email) => {
    if (email.endsWith('.admin@gmail.com')) return 'admin';
    if (email.endsWith('.teacher@gmail.com')) return 'teacher';
    if (email.endsWith('.parent@gmail.com')) return 'parent';
    if (email.endsWith('.student@gmail.com')) return 'student';
    return null; // No role detected
  };

  const handleRegister = async () => {
    const { name, email, password } = registerForm;
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    // Auto-detect role from email
    const role = detectRoleFromEmail(email);
    
    if (!role) {
      alert('Registration failed. Your email address is not authorized for registration. Please contact the school administrator.');
      return;
    }
    
    try {
      // Use database API only - in dev, Vite proxy handles /api, in prod use VITE_API_URL
      const explicit = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
      const apiBase = explicit ? `${explicit}/api` : '/api';
      const response = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get text to see what we got
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Backend returned non-JSON response. Is the server running at ${apiBase}?`);
      }
      
      if (!response.ok) {
        // Show detailed error message from backend
        const errorMsg = data.error || data.msg || data.details || 'Registration failed';
        console.error('Registration error:', data);
        throw new Error(errorMsg);
      }
      
      alert('✅ Registration successful! You can now login with your credentials.');
      setIsRegistering(false);
      setRegisterForm({ name: '', email: '', password: '', showPassword: false });
    } catch (err) {
      console.error('Registration failed:', err);
      let errorMessage = err.message;
      
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on port 5000.';
      } else if (err.message.includes('Backend returned non-JSON')) {
        errorMessage = 'Backend server returned an invalid response. Please check if the server is running correctly.';
      }
      
      alert(`❌ Registration failed: ${errorMessage}`);
    }
  };

  return (
  <div className="min-h-screen relative flex items-center justify-center p-4" style={{backgroundImage: `url('${backgroundOptions[bgIndex]}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-black/60 to-gray-900/70" />
    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Modern School</h1>
        <p className="text-gray-600 mt-2">AI-Powered Management System</p>
      </div>
      {/* Toggle buttons */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setIsRegistering(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            !isRegistering 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Login
        </button>
        <button
          type="button"
          onClick={() => setIsRegistering(true)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            isRegistering 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Register
        </button>
      </div>

      {!isRegistering ? (
        /* Login Form */
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={loginForm.showPassword ? 'text' : 'password'}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setLoginForm({...loginForm, showPassword: !loginForm.showPassword})}
              >
                {loginForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      ) : (
        /* Registration Form */
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={registerForm.showPassword ? 'text' : 'password'}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setRegisterForm({...registerForm, showPassword: !registerForm.showPassword})}
              >
                {registerForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
          >
            Create Account
          </button>
        </div>
      )}
    </div>
  </div>
  );
};

export default LoginForm;
