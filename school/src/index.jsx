import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  Bot, Clock, Target, TrendingUp, BookOpen, Users, Award, Brain,
  Building2, GraduationCap, Sparkles, Check, Smartphone, MessageSquare,
  Globe, Star, Quote, Code, Palette, Heart, Camera, Cpu,
  Menu, X, Send, CalendarDays, ChevronLeft, ChevronRight, MessageCircle, Play, Moon, Sun
} from 'lucide-react';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

function LandingGate() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatInput, setChatInput] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState([
    { from: 'bot', text: 'Hi! How can I help today?' }
  ]);
  const [billing, setBilling] = React.useState('monthly'); // 'monthly' | 'yearly'
  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const activitiesRef = React.useRef(null);
  const activities = React.useMemo(() => ([
    { 
      title: 'Admissions Open Day', 
      date: 'Nov 25', 
      time: '10:00 AM', 
      type: 'Admissions',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop'
    },
    { 
      title: 'AI in Education Webinar', 
      date: 'Nov 28', 
      time: '4:00 PM', 
      type: 'Webinar',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop'
    },
    { 
      title: 'Culinary Workshop', 
      date: 'Dec 2', 
      time: '1:00 PM', 
      type: 'Workshop',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop'
    },
    { 
      title: 'Design Portfolio Review', 
      date: 'Dec 6', 
      time: '3:00 PM', 
      type: 'Event',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop'
    },
    { 
      title: 'Business Pitch Night', 
      date: 'Dec 10', 
      time: '6:00 PM', 
      type: 'Event',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop'
    },
  ]), []);
  const scrollDirRef = React.useRef(1);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [planToBuy, setPlanToBuy] = React.useState(null);
  const [courseToBuy, setCourseToBuy] = React.useState(null);

  

  const openPayment = (plan) => {
    setPlanToBuy(plan);
    setCourseToBuy(null);
    setPaymentOpen(true);
  };

  const openCoursePayment = (course) => {
    setCourseToBuy(course);
    setPlanToBuy(null);
    setPaymentOpen(true);
  };

  const closePayment = () => {
    if (processingPayment) return;
    setPaymentOpen(false);
    setPlanToBuy(null);
    setCourseToBuy(null);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (processingPayment) return;
    setProcessingPayment(true);
    
    try {
      const formData = new FormData(e.target);
      const cardholderName = formData.get('cardholderName') || e.target.querySelector('input[placeholder="Jane Doe"]')?.value || '';
      const cardNumber = formData.get('cardNumber') || e.target.querySelector('input[placeholder*="4242"]')?.value || '';
      const expiry = formData.get('expiry') || e.target.querySelector('input[placeholder="MM/YY"]')?.value || '';
      const cvc = formData.get('cvc') || e.target.querySelector('input[placeholder="123"]')?.value || '';
      
      // Extract amount from course or plan
      let amount = 0;
      let description = '';
      
      if (courseToBuy) {
        // Extract numeric value from price string (e.g., "UGX 50,000" -> 50000)
        const priceStr = courseToBuy.price.replace(/[^\d.]/g, '');
        amount = parseFloat(priceStr) || 0;
        description = `Course Enrollment: ${courseToBuy.title}`;
      } else if (planToBuy) {
        const priceStr = (billing === 'monthly' ? planToBuy.priceMonthly : planToBuy.priceYearly)?.replace(/[^\d.]/g, '') || '0';
        amount = parseFloat(priceStr) || 0;
        description = `Plan Subscription: ${planToBuy.name}`;
      }
      
      if (amount <= 0) {
        alert('Invalid payment amount');
        setProcessingPayment(false);
        return;
      }
      
      // Get token for authentication
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Process payment through API
      const response = await fetch(`${baseUrl}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          method: 'stripe', // Credit card payment
          fee_type: courseToBuy ? 'course_enrollment' : 'subscription',
          description: description,
          cardholder_name: cardholderName,
          card_number: cardNumber.replace(/\s/g, ''),
          expiry: expiry,
          cvc: cvc
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Save enrolled course to localStorage if it's a course payment
        if (courseToBuy) {
          try {
            const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
            enrolledCourses.push({
              ...courseToBuy,
              enrolledAt: Date.now(),
              status: 'active',
              payment_id: result.payment_id
            });
            localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
          } catch (err) {
            console.error('Failed to save enrolled course:', err);
          }
        }
        
        alert('✅ Payment processed successfully!');
        setPaymentOpen(false);
        setPlanToBuy(null);
        setCourseToBuy(null);
        loadApp();
      } else {
        alert(`❌ Payment failed: ${result.message || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment processing error. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  React.useEffect(() => {
    const el = activitiesRef.current;
    if (!el) return;

    let rafId;
    const speed = 1.2; // pixels per frame (marquee speed)

    const step = () => {
      const total = el.scrollWidth;
      const half = total / 2; // since items are duplicated
      if (half > 0) {
        if (el.scrollLeft >= half) {
          // seamless loop: when we've scrolled past the first set, jump back by half
          el.scrollLeft -= half;
        } else {
          el.scrollLeft += speed;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    const onEnter = () => { if (rafId) cancelAnimationFrame(rafId); };
    const onLeave = () => { rafId = requestAnimationFrame(step); };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch {}
  };

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadApp = () => {
    import('./SmartSchoolApp.jsx')
      .then(({ default: SmartSchoolApp }) => {
        root.render(
          <React.StrictMode>
            <ErrorBoundary>
              <SmartSchoolApp />
            </ErrorBoundary>
          </React.StrictMode>
        );
      })
      .catch((err) => {
        console.error('Failed to load ModernSchoolApp:', err);
        showFatalError('Failed to load app module.', err?.stack || String(err));
      });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full backdrop-blur border-b z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-950/90 border-gray-800' : 'bg-gray-100/90 border-gray-300'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Modern-school</span>
            </a>
            <div className={`hidden md:flex items-center gap-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <a href="#pricing" className={`hover:text-blue-600 transition-colors ${darkMode ? 'hover:text-blue-400' : ''}`} onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Courses</a>
              <a href="#pricing" className={`hover:text-blue-600 transition-colors ${darkMode ? 'hover:text-blue-400' : ''}`} onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-yellow-400' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={loadApp} className={`px-4 py-2 text-sm rounded-lg border flex items-center gap-2 transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}>
                <Users className="w-4 h-4" /> Sign In
              </button>
              <button onClick={loadApp} className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90">
                Get Started
              </button>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-yellow-400' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button aria-label="Open menu" className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`} onClick={() => setMobileOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
  <div className="md:hidden fixed inset-0  z-[9999]">
    <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)}></div>
    <div className="absolute right-0 top-0 h-full w-72 shadow-2xl p-5 flex flex-col border-l" style={{ backgroundColor: darkMode ? '#172554' : '#ffffff', borderColor: darkMode ? '#1e3a8a' : '#93c5fd', zIndex: 60 }} onClick={(e)=>e.stopPropagation()}>
              <div className={`flex items-center justify-between mb-6 pb-4 border-b ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Modern-school</span>
                </div>
                <button aria-label="Close menu" className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-blue-700 hover:bg-blue-900 text-gray-300' : 'border-blue-300 hover:bg-blue-100 text-blue-700'}`} onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-2 flex-1">
                <a 
                  href="#pricing" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    setTimeout(() => {
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className={`px-3 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-900 hover:bg-blue-800 text-gray-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-900'}`}
                  style={{ backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe' }}
                >
                  Courses
                </a>
                <a 
                  href="#pricing" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    setTimeout(() => {
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className={`px-3 py-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-900 hover:bg-blue-800 text-gray-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-900'}`}
                  style={{ backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe' }}
                >
                  Pricing
                </a>
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                  <button 
                    onClick={()=>{
                      setMobileOpen(false); 
                      loadApp();
                    }} 
                    className={`w-full mb-2 px-4 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-blue-900 border-blue-700 hover:bg-blue-800 text-gray-200' : 'bg-blue-100 border-blue-400 hover:bg-blue-200 text-blue-900'}`}
                    style={{ backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe' }}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={()=>{
                      setMobileOpen(false); 
                      loadApp();
                    }} 
                    className="w-full px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
                  >
                    Get Started
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className={`w-full h-full transition-colors ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200'}`} />
          <div className={`absolute inset-0 transition-colors ${darkMode ? 'bg-gradient-to-b from-gray-950/0 to-gray-950/50' : 'bg-gradient-to-b from-gray-100/0 to-gray-100/40'}`} />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur border shadow mb-8 transition-colors ${darkMode ? 'bg-gray-900/90 border-blue-800/50' : 'bg-gray-100/90 border-blue-200'}`}>
            <Bot className="w-4 h-4 text-indigo-600" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>AI-Powered Personalization</span>
          </div>
          <h1 className={`text-5xl sm:text-6xl font-extrabold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Learn Anything, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Anywhere, Anytime</span>
          </h1>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore global courses, vocational diplomas, and short programs tailored to your goals. Powered by AI to track progress, send reminders, and suggest your perfect learning path.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a 
              href="#pricing" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 text-white rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold hover:opacity-90"
            >
              Start Learning Now
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-8 py-3 rounded-lg border backdrop-blur transition-colors ${darkMode ? 'border-gray-700 bg-gray-900/80 hover:bg-gray-800 text-gray-200' : 'border-gray-400 bg-gray-100/80 hover:bg-gray-200 text-gray-700'}`}
            >
              Browse Free Courses
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm transition-colors ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Target className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="text-left">
                <div className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Smart Goals</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI learning paths</div>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm transition-colors ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                <Clock className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div className="text-left">
                <div className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Reminders</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Never miss a lesson</div>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm transition-colors ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className="text-left">
                <div className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Progress Tracking</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time analytics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className={`py-20 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Why Choose <span className="text-blue-600">Modern-school</span></h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Experience AI-powered personalization and world-class content</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Brain, 
                title: 'AI-Personalized Study Plans', 
                desc: 'Smart recommendations based on your goals',
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop'
              },
              { 
                icon: Clock, 
                title: 'Smart Learning Reminders', 
                desc: 'Never miss a lesson',
                image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&auto=format&fit=crop'
              },
              { 
                icon: Award, 
                title: 'Accredited Institutional Courses', 
                desc: 'Recognized certificates',
                image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop'
              },
              { 
                icon: Globe, 
                title: '100% Online or Hybrid', 
                desc: 'Study anywhere, anytime',
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop'
              },
              { 
                icon: Smartphone, 
                title: 'Certificates for LinkedIn', 
                desc: 'Share achievements easily',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'
              },
              { 
                icon: MessageSquare, 
                title: 'AI Study Coach 24/7', 
                desc: 'Instant help and tutoring',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop'
              },
            ].map((f, i) => (
              <div key={i} className={`group relative overflow-hidden rounded-2xl border hover:shadow-xl transition-all duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={f.image} 
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay for better text readability */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${darkMode ? 'from-gray-900/85 via-gray-900/75 to-gray-900/85' : 'from-gray-900/70 via-gray-800/60 to-gray-900/70'}`} />
                </div>
                {/* Content */}
                <div className="relative p-6 z-10">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm ${darkMode ? 'bg-blue-600/30 border border-blue-400/30' : 'bg-white/20 border border-white/30'}`}>
                    <f.icon className={`w-7 h-7 ${darkMode ? 'text-blue-300' : 'text-white'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-white'}`}>{f.title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-100'}`}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Activities (Horizontal Slider) */}
      <section id="activities" className={`py-16 transition-colors ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Activities</h2>
            <div className="hidden sm:flex gap-2">
              <button aria-label="Prev" onClick={()=>{ if(!activitiesRef.current) return; activitiesRef.current.scrollBy({left:-340,behavior:'smooth'}); }} className={`w-9 h-9 rounded-lg border grid place-items-center transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}><ChevronLeft className="w-5 h-5"/></button>
              <button aria-label="Next" onClick={()=>{ if(!activitiesRef.current) return; activitiesRef.current.scrollBy({left:340,behavior:'smooth'}); }} className={`w-9 h-9 rounded-lg border grid place-items-center transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          <div ref={activitiesRef} className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {activities.concat(activities).map((ev, i) => (
              <div key={i} className={`min-w-[320px] rounded-2xl border shadow-sm transition-colors overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
                {/* Activity Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={ev.image} 
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-block text-xs px-3 py-1 rounded-full backdrop-blur-sm font-semibold ${darkMode ? 'bg-gray-900/80 text-blue-300 border border-blue-500/50' : 'bg-white/90 text-blue-700 border border-blue-200'}`}>
                      {ev.type}
                    </span>
                  </div>
                </div>
                {/* Activity Content */}
                <div className="p-5">
                  <div className={`flex items-center gap-2 text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <CalendarDays className="w-4 h-4"/> 
                    <span>{ev.date} • {ev.time}</span>
                  </div>
                  <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{ev.title}</h3>
                  <button className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}>
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutions */}
      <section id="institutions" className={`py-20 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Trusted by <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Top Institutions</span></h2>
            <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Partner institutions offering accredited programs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Global Tech Institute', icon: Building2, courses: 45, students: '12K+', specialty: 'Technology & AI' },
              { name: 'Culinary Arts Academy', icon: GraduationCap, courses: 28, students: '8K+', specialty: 'Catering & Hospitality' },
              { name: 'Business Leadership School', icon: Users, courses: 35, students: '15K+', specialty: 'Business & Management' },
              { name: 'Creative Design University', icon: Award, courses: 52, students: '20K+', specialty: 'Design & Creative Arts' },
            ].map((ins, i) => (
              <div key={i} className={`p-6 rounded-2xl border hover:shadow-md transition-colors text-center ${darkMode ? 'bg-gray-950 border-gray-700' : 'bg-white border-gray-300'}`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <ins.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{ins.name}</h3>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ins.specialty}</p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-blue-600 font-medium">{ins.courses} courses</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{ins.students} students</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">List Your Institution</button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="pricing" className={`py-20 transition-colors ${darkMode ? 'bg-gray-950' : 'bg-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Courses</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Start learning with our most popular courses, taught by industry experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                title: "AI & Machine Learning Masterclass",
                instructor: "Dr. Sarah Johnson",
                rating: 4.9,
                students: 12500,
                duration: "40 hours",
                price: "$99",
                level: "Intermediate",
                category: "Technology & AI",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
              },
              {
                id: 2,
                title: "Professional Pastry & Baking",
                instructor: "Chef Michael Chen",
                rating: 4.8,
                students: 8900,
                duration: "25 hours",
                price: "$79",
                level: "Beginner",
                category: "Catering",
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop",
              },
              {
                id: 3,
                title: "Full Stack Web Development",
                instructor: "Alex Rodriguez",
                rating: 4.9,
                students: 15200,
                duration: "60 hours",
                price: "$129",
                level: "All Levels",
                category: "Technology",
                image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
              },
              {
                id: 4,
                title: "Digital Marketing & SEO Strategy",
                instructor: "Emma Williams",
                rating: 4.7,
                students: 9800,
                duration: "30 hours",
                price: "$89",
                level: "Intermediate",
                category: "Marketing",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
              },
              {
                id: 5,
                title: "UI/UX Design Fundamentals",
                instructor: "David Park",
                rating: 4.8,
                students: 11300,
                duration: "35 hours",
                price: "$94",
                level: "Beginner",
                category: "Design",
                image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
              },
              {
                id: 6,
                title: "Business Leadership & Management",
                instructor: "Dr. Lisa Anderson",
                rating: 4.9,
                students: 13700,
                duration: "45 hours",
                price: "$109",
                level: "Advanced",
                category: "Business",
                image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop",
              },
            ].map((course, index) => (
              <div
                key={course.id}
                className={`group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 rounded-2xl ${darkMode ? 'border-gray-700 hover:border-blue-500/50 bg-gray-900' : 'border-gray-300 hover:border-blue-500/50 bg-white'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Course Image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-2 rounded-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Preview
                    </button>
                  </div>
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-600'}`}>
                    {course.level}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{course.category}</div>
                  <h3 className={`font-bold text-lg mb-2 line-clamp-2 transition-colors ${darkMode ? 'text-gray-100 group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'}`}>
                    {course.title}
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{course.instructor}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{course.rating}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <span className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{course.price}</span>
                    <button 
                      onClick={() => openCoursePayment(course)}
                      className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${darkMode ? 'border-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-gray-300' : 'border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-gray-700'}`}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={loadApp}
              className={`px-6 py-3 rounded-lg font-semibold border-2 transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}
            >
              Browse All Courses
            </button>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className={`border-t transition-colors ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Modern-school</span>
              </div>
              <p className={`mb-4 max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Learn Anything, Anywhere, Anytime. AI-powered personalized learning for everyone.</p>
              <div className="flex gap-3">
                <button className={`w-9 h-9 rounded-full border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-300 hover:bg-gray-200'}`} aria-label="Facebook" />
                <button className={`w-9 h-9 rounded-full border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-300 hover:bg-gray-200'}`} aria-label="Twitter" />
                <button className={`w-9 h-9 rounded-full border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-300 hover:bg-gray-200'}`} aria-label="LinkedIn" />
                <button className={`w-9 h-9 rounded-full border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-300 hover:bg-gray-200'}`} aria-label="Instagram" />
              </div>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Platform</h4>
              <ul className={`space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600">Browse Courses</a></li>
                <li><button onClick={loadApp} className="hover:text-blue-600">Learner Portal</button></li>
                <li><button onClick={loadApp} className="hover:text-blue-600">Teach on level-up</button></li>
                <li><button onClick={loadApp} className="hover:text-blue-600">For Institutions</button></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Company</h4>
              <ul className={`space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:text-blue-600">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Stay Updated</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} />
                <button className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white grid place-items-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div className={`pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-3 ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>© {new Date().getFullYear()} modern-school. All rights reserved.</p>
            <div className={`flex gap-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600">Terms of Service</a>
              <a href="#" className="hover:text-blue-600">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {paymentOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden transition-colors ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {courseToBuy ? `Enroll in Course – ${courseToBuy.title}` : `Checkout ${planToBuy ? `– ${planToBuy.name}` : ''}`}
              </div>
              <button aria-label="Close" onClick={closePayment} className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
              {courseToBuy ? (
                <div className="space-y-4">
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{courseToBuy.price}</span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{courseToBuy.instructor}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{courseToBuy.duration} • {courseToBuy.level}</p>
                  </div>
                </div>
              ) : (
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{billing==='monthly' ? (planToBuy?.priceMonthly || '') : (planToBuy?.priceYearly || '')}</span>
                    {planToBuy && planToBuy.priceMonthly !== 'Custom' && (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>/ {billing==='monthly' ? planToBuy.periodMonthly : planToBuy.periodYearly}</span>
                    )}
                  </div>
                  {planToBuy?.priceMonthly === 'Custom' && (
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>We will contact you for a custom quote.</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm">
                  <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cardholder Name</span>
                  <input required name="cardholderName" className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} placeholder="Jane Doe" />
                </label>
                <label className="text-sm">
                  <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Card Number</span>
                  <input required name="cardNumber" inputMode="numeric" pattern="[0-9 ]{12,23}" className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} placeholder="4242 4242 4242 4242" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expiry</span>
                    <input required name="expiry" className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} placeholder="MM/YY" />
                  </label>
                  <label className="text-sm">
                    <span className={`block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>CVC</span>
                    <input required name="cvc" inputMode="numeric" pattern="[0-9]{3,4}" className={`w-full px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} placeholder="123" />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 gap-3">
                <button type="button" onClick={closePayment} className={`px-4 py-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}>Cancel</button>
                <button type="submit" disabled={processingPayment} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-70 hover:opacity-90">
                  {processingPayment ? 'Processing…' : courseToBuy ? 'Pay and Enroll' : 'Pay and Start Learning'}
                </button>
              </div>

              {planToBuy?.name === 'Pro' && (
                <div className={`mt-3 p-3 rounded-lg border transition-colors ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  {isProTrialActive() ? (
                    <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span>Free trial active • {proTrialDaysLeft()} days left</span>
                      <button type="button" onClick={loadApp} className="px-3 py-1.5 rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600">Continue</button>
                    </div>
                  ) : hasUsedProTrial() ? (
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You already used your 7‑day free trial on this device.</div>
                  ) : (
                    <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span>Or try Pro free for 7 days</span>
                      <button type="button" onClick={() => { if (startProTrial()) { loadApp(); } }} className={`px-3 py-1.5 rounded-md border transition-colors ${darkMode ? 'border-blue-500 text-blue-400 hover:bg-blue-900/50' : 'border-blue-600 text-blue-700 hover:bg-blue-50'}`}>Start Free Trial</button>
                    </div>
                  )}
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* Chatbot and App Launcher */}
      {chatOpen && (
        <div className={`fixed bottom-24 right-6 w-80 max-w-[92vw] border-2 rounded-2xl shadow-2xl overflow-hidden transition-colors ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-blue-200'}`}>
          <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4"/> AI Study Coach</div>
            <button aria-label="Close chat" onClick={()=>setChatOpen(false)} className="p-1 rounded hover:bg-white/20 transition-colors"><X className="w-4 h-4"/></button>
          </div>
          <div className={`p-3 h-64 overflow-y-auto space-y-2 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {chatMessages.map((m, idx)=> (
              <div key={idx} className={`flex ${m.from==='bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${m.from==='bot' ? (darkMode ? 'bg-gray-700 text-gray-100 border border-gray-600' : 'bg-blue-100 text-blue-900 border border-blue-200') : 'bg-blue-600 text-white shadow-md'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <form className={`p-3 border-t flex gap-2 transition-colors ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-blue-200 bg-white'}`} onSubmit={(e)=>{e.preventDefault(); if(!chatInput.trim()) return; const userMsg = {from:'user', text: chatInput.trim()}; setChatMessages(prev=>[...prev, userMsg]); setChatInput(''); setTimeout(()=>{ setChatMessages(prev=>[...prev, {from:'bot', text: 'Thanks! I\'ll help you explore courses. Ready to sign in?'}]); }, 500); }}>
            <input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder="Ask about courses..." className={`flex-1 px-3 py-2 rounded-lg border focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-blue-300 text-gray-800'}`} />
            <button type="submit" className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"><Send className="w-4 h-4"/></button>
          </form>
        </div>
      )}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
        <button onClick={()=>setChatOpen(v=>!v)} className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-700 shadow-lg hover:shadow-xl hover:scale-110 transition-all grid place-items-center">
          <MessageCircle className="w-6 h-6 text-white"/>
        </button>
      </div>
    </div>
  );
}

function ErrorScreen({ message, details }) {
  return (
    <div style={{
      padding: '16px',
      background: '#fff5f5',
      color: '#b00020',
      border: '1px solid #f5c2c7',
      borderRadius: '8px',
      fontFamily: 'system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
    }}>
      <h2 style={{ margin: '0 0 8px 0' }}>Runtime error</h2>
      <div style={{ marginBottom: 8 }}>{message}</div>
      {details ? (
        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, maxHeight: '40vh', overflow: 'auto' }}>{details}</pre>
      ) : null}
    </div>
  );
}

function showFatalError(message, details) {
  // Render via React to avoid DOM mutations outside React tree
  root.render(
    <React.StrictMode>
      <ErrorScreen message={message} details={details} />
    </React.StrictMode>
  );
}

window.addEventListener('error', (e) => {
  showFatalError(e.message || 'An unexpected error occurred.', e.error?.stack);
});
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason instanceof Error ? `${e.reason.message}\n${e.reason.stack}` : String(e.reason);
  showFatalError('Unhandled promise rejection', reason);
});

// Add error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c00' }}>
          <h1>Something went wrong with the Modern School App</h1>
          <p>Error: {this.state.error?.message}</p>
          <pre>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the landing gate first; it will load the app on Continue
console.log('BOOT: rendering LandingGate from index.jsx');
document.title = 'Modern School';
try { document.body.style.background = '#e0f2fe'; } catch {}
root.render(
  <React.StrictMode>
    <LandingGate />
  </React.StrictMode>
);
