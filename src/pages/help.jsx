import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, DollarSign, MessageSquare, User, BarChart2, Bell,
  HelpCircle, Settings, ChevronRight, Search, ArrowLeft,
  BookOpen, FileText, Phone, Video, MessageCircle, Shield,
  DollarSign as Dollar, Gift, Mail, Zap, Info, ChevronDown
} from 'lucide-react';

const HelpScreen = () => {
  const leftSidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const rightSidebarRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Enable independent scrolling for each section
  useEffect(() => {
    const handleScroll = (e) => {
      // Prevent scroll events from bubbling up to parent elements
      e.stopPropagation();
    };
  
    // Cache current ref values inside the effect
    const mainContent = mainContentRef.current;
    const leftSidebar = leftSidebarRef.current;
    const rightSidebar = rightSidebarRef.current;
  
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    if (leftSidebar) {
      leftSidebar.addEventListener('scroll', handleScroll);
    }
    if (rightSidebar) {
      rightSidebar.addEventListener('scroll', handleScroll);
    }
  
    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
      if (leftSidebar) {
        leftSidebar.removeEventListener('scroll', handleScroll);
      }
      if (rightSidebar) {
        rightSidebar.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const helpCategories = [
    { id: 'general', name: 'General', icon: <Info size={16} /> },
    { id: 'account', name: 'Account & Profile', icon: <User size={16} /> },
    { id: 'payments', name: 'Payments & Earnings', icon: <Dollar size={16} /> },
    { id: 'messaging', name: 'Messaging', icon: <MessageCircle size={16} /> },
    { id: 'posting', name: 'Posts & Content', icon: <FileText size={16} /> },
    { id: 'security', name: 'Privacy & Security', icon: <Shield size={16} /> }
  ];
  
  const faqs = {
    general: [
      {
        id: 'what-is-paypadm',
        question: 'What is PayPadm?',
        answer: 'PayPadm is a social platform that allows experts to monetize their knowledge by sharing insights and responding to direct messages. Users can discover free content or pay to unlock premium content and direct messaging with experts.'
      },
      {
        id: 'how-to-get-started',
        question: 'How do I get started on PayPadm?',
        answer: 'To get started, complete your profile with your expertise areas, set your messaging rate, and start sharing valuable content through posts. Engage with the community by responding to questions and creating both free and premium content.'
      },
      {
        id: 'difference-free-premium',
        question: 'What\'s the difference between free and premium content?',
        answer: 'Free content is accessible to all users. Premium content requires payment to unlock and typically contains more in-depth insights, analysis, or exclusive information. As a creator, you can choose which content to make premium to monetize your expertise.'
      }
    ],
    account: [
      {
        id: 'edit-profile',
        question: 'How do I edit my profile?',
        answer: 'Navigate to your Profile page by clicking on the Profile option in the left sidebar. Then click on the Edit Profile button to update your information, expertise areas, profile picture, and bio.'
      },
      {
        id: 'verification',
        question: 'How can I get verified?',
        answer: 'Verification is granted to established experts with consistent high-quality contributions. Maintain a high response rate, positive ratings, and regular content creation. You can apply for verification after reaching 100,000 UGX in earnings.'
      }
    ],
    payments: [
      {
        id: 'withdraw-earnings',
        question: 'How do I withdraw my earnings?',
        answer: 'Go to your account section in the right sidebar and click on "Withdraw Funds". You can withdraw to mobile money or bank accounts. The minimum withdrawal amount is 10,000 UGX, and processing takes 1-2 business days.'
      },
      {
        id: 'platform-fees',
        question: 'What are the platform fees?',
        answer: 'PayPadm takes a 15% fee from all transactions. This means you receive 85% of your earnings from direct messages and premium content. Fees help maintain the platform and provide customer support.'
      },
      {
        id: 'set-message-rate',
        question: 'How do I set my message rate?',
        answer: 'You can adjust your message rate in the right sidebar under "Your Message Rate" section. Move the slider to set your desired rate per message. We recommend setting a rate between 3,000-7,000 UGX based on your expertise level.'
      }
    ],
    messaging: [
      {
        id: 'messaging-system',
        question: 'How does the messaging system work?',
        answer: 'Users pay your set rate to send you a direct message. You receive 85% of this amount when you respond. Maintain a high response rate (above 90%) to appear in recommendations and search results. You have 24 hours to respond to paid messages.'
      },
      {
        id: 'message-notifications',
        question: 'How will I know when I receive messages?',
        answer: 'You\'ll receive notifications on the platform and via email for new paid messages. You can manage notification preferences in your Settings page under the Notifications tab.'
      }
    ],
    posting: [
      {
        id: 'create-post',
        question: 'How do I create a post?',
        answer: 'Click on the "New Post" button in the left sidebar or use the post composer at the top of your feed. You can create text posts, add images, and decide whether to make your content free or premium by toggling the lock icon.'
      },
      {
        id: 'premium-post',
        question: 'How do I set up a premium post?',
        answer: 'When creating a post, click the lock icon to make it premium. Set a price that users will pay to unlock the content. Good premium content typically includes in-depth analysis, exclusive insights, or useful resources.'
      }
    ],
    security: [
      {
        id: 'account-security',
        question: 'How can I secure my account?',
        answer: 'Enable two-factor authentication in your Settings under the Security tab. Use a strong password and regularly update it. Be cautious about clicking links in messages and never share your login credentials.'
      },
      {
        id: 'report-problem',
        question: 'How do I report a problem or abusive user?',
        answer: 'Click the three dots menu (...) on any post or message and select "Report". Fill in the details of your concern. Our trust and safety team reviews all reports within 24 hours.'
      }
    ]
  };

  const popularArticles = [
    { title: 'Getting Started Guide', icon: <BookOpen size={16} /> },
    { title: 'Maximizing Your Earnings', icon: <DollarSign size={16} /> },
    { title: 'Creating Engaging Content', icon: <FileText size={16} /> },
    { title: 'Understanding Analytics', icon: <BarChart2 size={16} /> }
  ];

  const supportOptions = [
    { title: 'Live Chat Support', icon: <MessageSquare size={16} />, available: 'Available 24/7' },
    { title: 'Phone Support', icon: <Phone size={16} />, available: '9AM - 5PM EAT' },
    { title: 'Video Call', icon: <Video size={16} />, available: 'By appointment' },
    { title: 'Email Support', icon: <Mail size={16} />, available: '24-48hr response' }
  ];

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setExpandedFaq(null); // Reset expanded FAQ when changing category
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      {/* Left Sidebar - Independent Scrolling */}
      <div 
        ref={leftSidebarRef}
        className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-3 overflow-y-auto h-screen sticky top-0"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-lg font-bold py-2 px-3 rounded-lg mb-6">
          PayPadm
        </div>
        
        <nav className="space-y-1 mb-4">
          <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Home className="w-4 h-4 mr-2" />
            <span className="font-medium">Home</span>
          </Link>
          <Link to="/transactions" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="font-medium">Transactions</span>
          </Link>
          <Link to="/chat" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="font-medium">Messages</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">3</span>
          </Link>
          <Link to="/profile" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Profile</span>
          </Link>
          <Link to="/analytics" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <BarChart2 className="w-4 h-4 mr-2" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link to="/notifications" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-4 h-4 mr-2" />
            <span className="font-medium">Notifications</span>
            <span className="ml-auto bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">5</span>
          </Link>
          <Link to="/help" className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg">
            <HelpCircle className="w-4 h-4 mr-2" />
            <span className="font-medium">Help Center</span>
          </Link>
        </nav>
        
        <div className="p-2 bg-gray-50 rounded-lg mb-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Popular Help Articles</h3>
          <div className="space-y-2">
            {popularArticles.map((article, index) => (
              <div key={index} className="flex items-center text-xs text-gray-700 hover:text-red-600 cursor-pointer p-1 hover:bg-gray-100 rounded">
                <span className="mr-2 text-gray-500">{article.icon}</span>
                <span>{article.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-2 bg-red-50 rounded-lg mb-4 border border-red-100">
          <div className="flex items-center text-red-800 mb-1">
            <Gift className="w-4 h-4 mr-1" />
            <h3 className="text-xs font-semibold">Need More Help?</h3>
          </div>
          <p className="text-xs text-red-700 mb-1">Our support team is ready to assist you!</p>
          <button className="w-full bg-red-600 text-white text-xs py-1 px-2 rounded-lg font-medium hover:bg-red-700">
            Contact Support
          </button>
        </div>
        
        <div className="mt-auto space-y-1 text-xs">
          <Link to="/settings" className="flex items-center justify-between text-gray-600 p-2 hover:bg-gray-100 rounded">
            <div className="flex items-center">
              <Settings size={14} className="mr-2" />
              <span>Settings</span>
            </div>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
      
      {/* Main Content - Independent Scrolling */}
      <div 
        ref={mainContentRef}
        className="flex-1 border-l border-r border-gray-200 bg-white overflow-y-auto h-screen"
      >
        {/* Top Navigation - Sticky */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center px-3 py-2">
            <Link to="/" className="text-gray-500 hover:text-gray-700 mr-2">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Help Center</h1>
          </div>
        </div>
        
        {/* Help Categories */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex overflow-x-auto space-x-2 pb-2 hide-scrollbar">
            {helpCategories.map((category) => (
              <button
                key={category.id}
                className={`px-3 py-1.5 font-medium text-sm rounded-full whitespace-nowrap flex items-center ${
                  activeCategory === category.id 
                    ? 'bg-red-50 text-red-600 border border-red-100' 
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Search Box */}
        <div className="p-3 border-b border-gray-200">
          <div className="bg-gray-100 rounded-lg p-2">
            <div className="flex items-center">
              <Search size={16} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search help articles..."
                className="bg-transparent border-none w-full focus:outline-none text-gray-700 text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            {helpCategories.find(c => c.id === activeCategory)?.name} FAQs
          </h2>
          
          <div className="space-y-2">
            {faqs[activeCategory] && faqs[activeCategory].map((faq) => (
              <div 
                key={faq.id} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button 
                  className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 text-left"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform ${expandedFaq === faq.id ? 'transform rotate-180' : ''}`} 
                  />
                </button>
                
                {expandedFaq === faq.id && (
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-red-800 mb-2">
              Didn't find what you're looking for? Our support team is here to help.
            </p>
            <button className="bg-red-600 text-white text-sm py-1.5 px-3 rounded-lg font-medium hover:bg-red-700 shadow-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - Independent Scrolling */}
      <div 
        ref={rightSidebarRef}
        className="hidden lg:flex flex-col w-80 p-3 overflow-y-auto h-screen sticky top-0"
      >
        {/* Contact Support Options */}
        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Contact Support</h3>
          
          <div className="space-y-3">
            {supportOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-2">
                    <span className="text-red-600">{option.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{option.title}</h4>
                    <p className="text-xs text-gray-500">{option.available}</p>
                  </div>
                </div>
                <button className="text-red-600 text-xs font-medium hover:text-red-700">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Video Tutorials */}
        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Video Tutorials</h3>
          
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden bg-gray-100 h-32 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              </div>
            </div>
            <h4 className="font-medium text-sm">Getting Started with PayPadm</h4>
            <p className="text-xs text-gray-500">Learn the basics of PayPadm and how to set up your expert profile</p>
            
            <div className="flex flex-wrap gap-1">
              <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Beginner</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">5:32</span>
            </div>
          </div>
          
          <div className="mt-3">
            <Link to="/tutorials" className="text-red-600 text-xs hover:text-red-700">
              View all tutorials
            </Link>
          </div>
        </div>
        
        {/* Quick Tips */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center text-gray-900 mb-3">
            <Zap size={16} className="text-red-600 mr-1" />
            <h3 className="font-bold text-sm">Quick Tips</h3>
          </div>
          
          <div className="space-y-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <span className="font-medium">Complete your profile:</span> Experts with complete profiles earn up to 40% more
              </p>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <span className="font-medium">Respond quickly:</span> Aim to respond to messages within 2-4 hours for higher ratings
              </p>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <span className="font-medium">Post regularly:</span> Share insights at least 3 times per week to stay visible
              </p>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <span className="font-medium">Use analytics:</span> Check your performance weekly to optimize your content
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpScreen;