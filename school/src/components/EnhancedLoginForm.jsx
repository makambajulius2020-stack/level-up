import React from 'react';
import { GraduationCap, Eye, EyeOff, Sun, Moon, Mail, Shield, User, Users, Phone, CheckCircle } from 'lucide-react';

const EnhancedLoginForm = ({ loginForm, setLoginForm, handleLogin, darkMode, setDarkMode }) => {
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [registerForm, setRegisterForm] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (registerForm.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    try {
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if email already exists
      if (existingUsers.find(user => user.email === registerForm.email)) {
        alert('Email already registered. Please use a different email or login instead.');
        return;
      }
      
      // Create new user
      const newUser = {
        id: Date.now(),
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
        phone: registerForm.phone,
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      // Reset form and switch to login
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        phone: ''
      });
      
      setIsRegistering(false);
      setLoginForm({ ...loginForm, email: registerForm.email, password: '' });
      
      alert('Registration successful! Please login with your credentials.');
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800' : 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200'}`}>
      {/* Enhanced Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full transition-all duration-500 transform hover:scale-110 ${
            darkMode 
              ? 'bg-gray-800/90 text-blue-400 hover:bg-gray-700 border-2 border-blue-400/30 shadow-lg shadow-blue-500/20' 
              : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200 border-2 border-gray-300 shadow-lg shadow-gray-400/30'
          } backdrop-blur-sm`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div className="relative">
            {darkMode ? (
              <Sun className="w-5 h-5 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {/* Glow effect for dark mode */}
            {darkMode && (
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm animate-pulse"></div>
            )}
          </div>
        </button>
      </div>

      {/* Beautiful Background with Students Image */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-gray-800 via-blue-800 to-gray-900' : 'bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500'}`}></div>
          
          {/* Smart Students Background - Reduced opacity for better contrast */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
            }}
          />
          
          {/* Additional overlay for better form visibility */}
          <div className={`absolute inset-0 ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100/30'}`}></div>
          
          {/* Fallback: Beautiful Illustrated Students */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='bg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:0.8' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:0.8' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23bg1)'/%3E%3C!-- Realistic Students with Books and Bags --%3E%3Cg%3E%3C!-- Student 1: Girl with backpack --%3E%3Cg transform='translate(180,350)'%3E%3C!-- Body --%3E%3Cellipse cx='0' cy='80' rx='35' ry='50' fill='%23FDB462' opacity='0.9'/%3E%3C!-- Head --%3E%3Ccircle cx='0' cy='0' r='28' fill='%23FDBCB4' opacity='0.9'/%3E%3C!-- Hair --%3E%3Cpath d='M-25,-15 Q0,-35 25,-15 Q20,-25 0,-30 Q-20,-25 -25,-15' fill='%23654321' opacity='0.8'/%3E%3C!-- Uniform --%3E%3Crect x='-25' y='25' width='50' height='55' rx='8' fill='%234169E1' opacity='0.9'/%3E%3C!-- Backpack --%3E%3Crect x='-35' y='30' width='18' height='35' rx='4' fill='%23FF6B6B' opacity='0.8'/%3E%3Cpath d='M-35,35 Q-40,30 -35,25 Q-30,30 -35,35' fill='%23FF5252' opacity='0.7'/%3E%3C!-- Books in hand --%3E%3Crect x='20' y='45' width='15' height='3' rx='1' fill='%23FFF' opacity='0.9'/%3E%3Crect x='20' y='49' width='15' height='3' rx='1' fill='%23FFD54F' opacity='0.9'/%3E%3Crect x='20' y='53' width='15' height='3' rx='1' fill='%23FF8A65' opacity='0.9'/%3E%3C!-- Legs --%3E%3Crect x='-12' y='80' width='10' height='35' rx='5' fill='%234169E1' opacity='0.9'/%3E%3Crect x='2' y='80' width='10' height='35' rx='5' fill='%234169E1' opacity='0.9'/%3E%3C!-- Shoes --%3E%3Cellipse cx='-7' cy='118' rx='8' ry='4' fill='%23333' opacity='0.9'/%3E%3Cellipse cx='7' cy='118' rx='8' ry='4' fill='%23333' opacity='0.9'/%3E%3C/g%3E%3C!-- Student 2: Boy with books --%3E%3Cg transform='translate(400,360)'%3E%3C!-- Body --%3E%3Cellipse cx='0' cy='75' rx='32' ry='48' fill='%23A0522D' opacity='0.9'/%3E%3C!-- Head --%3E%3Ccircle cx='0' cy='0' r='26' fill='%23D2B48C' opacity='0.9'/%3E%3C!-- Hair --%3E%3Cpath d='M-22,-12 Q0,-28 22,-12 Q18,-22 0,-25 Q-18,-22 -22,-12' fill='%232F1B14' opacity='0.8'/%3E%3C!-- Uniform --%3E%3Crect x='-22' y='22' width='44' height='50' rx='6' fill='%23228B22' opacity='0.9'/%3E%3C!-- Books stack --%3E%3Crect x='-35' y='35' width='20' height='4' rx='2' fill='%23FF6B6B' opacity='0.9'/%3E%3Crect x='-35' y='40' width='20' height='4' rx='2' fill='%234CAF50' opacity='0.9'/%3E%3Crect x='-35' y='45' width='20' height='4' rx='2' fill='%23FF9800' opacity='0.9'/%3E%3Crect x='-35' y='50' width='20' height='4' rx='2' fill='%239C27B0' opacity='0.9'/%3E%3C!-- Legs --%3E%3Crect x='-10' y='75' width='8' height='32' rx='4' fill='%23228B22' opacity='0.9'/%3E%3Crect x='2' y='75' width='8' height='32' rx='4' fill='%23228B22' opacity='0.9'/%3E%3C!-- Shoes --%3E%3Cellipse cx='-6' cy='110' rx='7' ry='3' fill='%23654321' opacity='0.9'/%3E%3Cellipse cx='6' cy='110' rx='7' ry='3' fill='%23654321' opacity='0.9'/%3E%3C/g%3E%3C!-- Student 3: Girl with bag --%3E%3Cg transform='translate(620,345)'%3E%3C!-- Body --%3E%3Cellipse cx='0' cy='82' rx='36' ry='52' fill='%23CD853F' opacity='0.9'/%3E%3C!-- Head --%3E%3Ccircle cx='0' cy='0' r='29' fill='%23F4A460' opacity='0.9'/%3E%3C!-- Hair (braids) --%3E%3Cpath d='M-26,-10 Q-30,-20 -25,-25 Q-20,-20 -26,-10' fill='%238B4513' opacity='0.8'/%3E%3Cpath d='M26,-10 Q30,-20 25,-25 Q20,-20 26,-10' fill='%238B4513' opacity='0.8'/%3E%3Cpath d='M-20,-18 Q0,-30 20,-18 Q15,-25 0,-28 Q-15,-25 -20,-18' fill='%238B4513' opacity='0.8'/%3E%3C!-- Uniform --%3E%3Crect x='-26' y='26' width='52' height='56' rx='8' fill='%23FF1744' opacity='0.9'/%3E%3C!-- School bag --%3E%3Crect x='25' y='35' width='16' height='25' rx='3' fill='%234CAF50' opacity='0.8'/%3E%3Cpath d='M25,40 Q30,35 35,40 Q30,45 25,40' fill='%23388E3C' opacity='0.7'/%3E%3C!-- Notebook --%3E%3Crect x='-40' y='40' width='12' height='16' rx='1' fill='%23FFF' opacity='0.9'/%3E%3Cpath d='M-40,42 L-28,42 M-40,45 L-28,45 M-40,48 L-28,48' stroke='%234169E1' stroke-width='0.5' opacity='0.7'/%3E%3C!-- Legs --%3E%3Crect x='-14' y='82' width='12' height='38' rx='6' fill='%23FF1744' opacity='0.9'/%3E%3Crect x='2' y='82' width='12' height='38' rx='6' fill='%23FF1744' opacity='0.9'/%3E%3C!-- Shoes --%3E%3Cellipse cx='-8' cy='123' rx='9' ry='4' fill='%23000' opacity='0.9'/%3E%3Cellipse cx='8' cy='123' rx='9' ry='4' fill='%23000' opacity='0.9'/%3E%3C/g%3E%3C!-- Student 4: Boy with backpack --%3E%3Cg transform='translate(840,355)'%3E%3C!-- Body --%3E%3Cellipse cx='0' cy='78' rx='34' ry='49' fill='%23DEB887' opacity='0.9'/%3E%3C!-- Head --%3E%3Ccircle cx='0' cy='0' r='27' fill='%23F5DEB3' opacity='0.9'/%3E%3C!-- Hair --%3E%3Cpath d='M-24,-14 Q0,-32 24,-14 Q20,-24 0,-28 Q-20,-24 -24,-14' fill='%23FFD700' opacity='0.8'/%3E%3C!-- Uniform --%3E%3Crect x='-24' y='24' width='48' height='54' rx='7' fill='%23800080' opacity='0.9'/%3E%3C!-- Backpack --%3E%3Crect x='-40' y='32' width='20' height='30' rx='4' fill='%23FF8C00' opacity='0.8'/%3E%3Cpath d='M-40,37 Q-45,32 -40,27 Q-35,32 -40,37' fill='%23FF7F00' opacity='0.7'/%3E%3Cpath d='M-40,45 Q-45,40 -40,35 Q-35,40 -40,45' fill='%23FF7F00' opacity='0.7'/%3E%3C!-- Pencil case --%3E%3Crect x='22' y='48' width='8' height='18' rx='4' fill='%234169E1' opacity='0.9'/%3E%3C!-- Legs --%3E%3Crect x='-11' y='78' width='9' height='34' rx='4' fill='%23800080' opacity='0.9'/%3E%3Crect x='2' y='78' width='9' height='34' rx='4' fill='%23800080' opacity='0.9'/%3E%3C!-- Shoes --%3E%3Cellipse cx='-6' cy='115' rx='8' ry='4' fill='%23FFF' opacity='0.9'/%3E%3Cellipse cx='6' cy='115' rx='8' ry='4' fill='%23FFF' opacity='0.9'/%3E%3C/g%3E%3C!-- Student 5: Girl reading --%3E%3Cg transform='translate(1020,365)'%3E%3C!-- Body --%3E%3Cellipse cx='0' cy='76' rx='33' ry='47' fill='%23F0E68C' opacity='0.9'/%3E%3C!-- Head --%3E%3Ccircle cx='0' cy='0' r='25' fill='%23FFDBAC' opacity='0.9'/%3E%3C!-- Hair (ponytail) --%3E%3Cpath d='M-22,-8 Q0,-25 22,-8 Q18,-18 0,-22 Q-18,-18 -22,-8' fill='%23A0522D' opacity='0.8'/%3E%3Cpath d='M20,-8 Q25,-5 22,0 Q18,-3 20,-8' fill='%23A0522D' opacity='0.8'/%3E%3C!-- Uniform --%3E%3Crect x='-23' y='23' width='46' height='53' rx='6' fill='%23FF69B4' opacity='0.9'/%3E%3C!-- Open book --%3E%3Crect x='-18' y='35' width='36' height='20' rx='2' fill='%23FFF' opacity='0.9'/%3E%3Cpath d='M0,35 L0,55' stroke='%23DDD' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M-15,38 L-3,38 M-15,41 L-8,41 M-15,44 L-5,44' stroke='%234169E1' stroke-width='0.5' opacity='0.6'/%3E%3Cpath d='M3,38 L15,38 M8,41 L15,41 M5,44 L15,44' stroke='%234169E1' stroke-width='0.5' opacity='0.6'/%3E%3C!-- Legs --%3E%3Crect x='-9' y='76' width='8' height='31' rx='4' fill='%23FF69B4' opacity='0.9'/%3E%3Crect x='1' y='76' width='8' height='31' rx='4' fill='%23FF69B4' opacity='0.9'/%3E%3C!-- Shoes --%3E%3Cellipse cx='-5' cy='110' rx='7' ry='3' fill='%23FF1493' opacity='0.9'/%3E%3Cellipse cx='5' cy='110' rx='7' ry='3' fill='%23FF1493' opacity='0.9'/%3E%3C/g%3E%3C/g%3E%3C!-- Educational Elements --%3E%3Cg fill='white' fill-opacity='0.1'%3E%3C!-- Floating books --%3E%3Crect x='100' y='150' width='25' height='4' rx='2' transform='rotate(15 112 152)'/%3E%3Crect x='102' y='146' width='21' height='4' rx='2' transform='rotate(15 112 148)'/%3E%3Crect x='300' y='120' width='28' height='5' rx='2' transform='rotate(-10 314 122)'/%3E%3Crect x='500' y='180' width='24' height='4' rx='2' transform='rotate(20 512 182)'/%3E%3Crect x='700' y='140' width='26' height='5' rx='2' transform='rotate(-15 713 142)'/%3E%3C!-- Academic symbols --%3E%3Ccircle cx='150' cy='100' r='20' fill='white' fill-opacity='0.05'/%3E%3Cpath d='M140,100 L150,90 L160,100 L150,110 Z' fill='white' fill-opacity='0.08'/%3E%3Ccircle cx='550' cy='80' r='18' fill='white' fill-opacity='0.05'/%3E%3Cpath d='M545,80 Q550,70 555,80 Q550,90 545,80' fill='white' fill-opacity='0.08'/%3E%3Ccircle cx='950' cy='120' r='22' fill='white' fill-opacity='0.05'/%3E%3Crect x='940' y='110' width='20' height='20' rx='2' fill='white' fill-opacity='0.08'/%3E%3C/g%3E%3C!-- School name at bottom --%3E%3Ctext x='600' y='750' text-anchor='middle' fill='white' fill-opacity='0.4' font-family='Arial, sans-serif' font-size='28' font-weight='600'%3ESmart School Uganda%3C/text%3E%3Ctext x='600' y='780' text-anchor='middle' fill='white' fill-opacity='0.3' font-family='Arial, sans-serif' font-size='16'%3EEmpowering the Future of Education%3C/text%3E%3C/svg%3E")`
            }}
          />
          
          {/* Floating Animation Elements */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Login Form Container */}
        <div className="relative z-10 w-full max-w-lg mx-4">
          {/* Multiple Glowing Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className={`relative backdrop-blur-2xl rounded-3xl shadow-2xl border-2 transition-all duration-700 transform hover:scale-102 ${
            darkMode 
              ? 'bg-gray-900/95 border-blue-400/40 shadow-blue-500/40' 
              : 'bg-gray-50/95 border-purple-400/50 shadow-purple-500/30'
          }`}>
            
            {/* Enhanced Decorative Header with School Badge */}
            <div className="relative overflow-visible rounded-t-3xl">
              <div className={`h-32 bg-gradient-to-br ${darkMode ? 'from-gray-700 via-blue-700 to-gray-800' : 'from-blue-500 via-purple-500 to-indigo-600'}`}>
                <div className={`absolute inset-0 ${darkMode ? 'bg-black/20' : 'bg-black/10'}`}></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
                
                {/* School Name in Header */}
                <div className="absolute top-6 left-6">
                  <h2 className="font-bold text-lg text-white">SMART SCHOOL</h2>
                  <p className="text-sm text-white/90">UGANDA</p>
                </div>
              </div>
              
              {/* Enhanced School Badge/Logo - Fully visible */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className={`absolute -inset-3 rounded-full blur-lg opacity-40 animate-pulse ${
                    darkMode ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}></div>
                  
                  {/* School Badge with perfect visibility */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 relative ${
                    darkMode 
                      ? 'bg-white border-blue-500 shadow-blue-500/50' 
                      : 'bg-white border-purple-500 shadow-purple-500/50'
                  }`}>
                    <div className="relative z-10 text-center">
                      <GraduationCap className={`w-6 h-6 mx-auto mb-0.5 ${darkMode ? 'text-blue-600' : 'text-purple-600'}`} />
                      <div className={`text-xs font-bold ${darkMode ? 'text-blue-600' : 'text-purple-600'}`}>SSU</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-14 pb-6 px-6">
              {/* Title Section */}
              <div className="text-center mb-6">
                <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                  darkMode 
                    ? 'from-blue-400 to-cyan-400 text-transparent bg-clip-text' 
                    : 'from-blue-600 to-purple-600 text-transparent bg-clip-text'
                }`}>
                  Smart School Uganda
                </h1>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  🎓 Empowering Education Through Technology
                </p>
                <div className={`w-16 h-1 mx-auto mt-3 rounded-full bg-gradient-to-r ${
                  darkMode ? 'from-blue-400 to-cyan-400' : 'from-blue-500 to-purple-500'
                }`}></div>
                
                {/* Login/Register Toggle */}
                <div className="mt-5 flex justify-center">
                  <div className={`flex rounded-xl p-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <button
                      onClick={() => setIsRegistering(false)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                        !isRegistering
                          ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-lg`
                          : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsRegistering(true)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                        isRegistering
                          ? `${darkMode ? 'bg-cyan-600 text-white' : 'bg-purple-500 text-white'} shadow-lg`
                          : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Form Content */}
              {!isRegistering ? (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-5">
                    {/* Email Field */}
                    <div className="group">
                      <div className="relative">
                        <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                          } focus:ring-4 focus:ring-blue-500/20 focus:outline-none`}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="group">
                      <div className="relative">
                        <Shield className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type={loginForm.showPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className={`w-full pl-12 pr-14 py-4 rounded-xl border-2 transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                          } focus:ring-4 focus:ring-blue-500/20 focus:outline-none`}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setLoginForm({ ...loginForm, showPassword: !loginForm.showPassword })}
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                            darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {loginForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Sign In to Smart School
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="group">
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                          } focus:ring-4 focus:ring-purple-500/20 focus:outline-none`}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="group">
                      <div className="relative">
                        <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`} />
                        <select
                          value={registerForm.role}
                          onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-600 text-white focus:border-purple-500' 
                              : 'bg-white/90 border-gray-300 text-gray-900 focus:border-purple-500'
                          } focus:ring-4 focus:ring-purple-500/20 focus:outline-none`}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group">
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                          darkMode 
                            ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                            : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                        } focus:ring-4 focus:ring-purple-500/20 focus:outline-none`}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="group">
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                          darkMode 
                            ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                            : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                        } focus:ring-4 focus:ring-purple-500/20 focus:outline-none`}
                        placeholder="+256 7XX XXX XXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="group">
                      <div className="relative">
                        <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                          } focus:ring-4 focus:ring-purple-500/20 focus:outline-none`}
                          placeholder="Create password"
                          required
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="group">
                      <div className="relative">
                        <CheckCircle className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                            darkMode 
                              ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                              : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                          } focus:ring-4 focus:ring-purple-500/20 focus:outline-none`}
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Create Smart School Account
                  </button>
                </form>
              )}


              {/* Footer */}
              <div className="mt-6 text-center">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Smart School Management System
                </p>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Empowering students, teachers, and administrators
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoginForm;
