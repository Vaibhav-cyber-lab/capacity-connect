import React from 'react';
import { 
  BookOpen, Users, Award, CheckCircle, GraduationCap, 
  ArrowRight, ShieldCheck, Facebook, Twitter, 
  Instagram, Linkedin, PlayCircle, Star, Quote
} from 'lucide-react';
import { storage } from '../../lib/storage';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const users = storage.getUsers();
  const courses = storage.getCourses();
  const traineeCount = users.filter(u => u.role === 'trainee').length;
  const trainerCount = users.filter(u => u.role === 'trainer').length;
  const categoriesCount = new Set(courses.map(c => c.category || 'General')).size;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* 1. Modern Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center text-indigo-600 dark:text-indigo-400 cursor-pointer">
            <GraduationCap className="w-8 h-8 mr-2.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              SMART<span className="text-indigo-600 dark:text-indigo-400">EDUCATION</span>
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8 font-medium text-slate-600 dark:text-slate-300">
            <a href="#home" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Testimonials</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onGetStarted}
              className="hidden md:block text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for sticky header */}
      <div className="h-20" id="home"></div>

      {/* 2. Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            Empower Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Learning Journey
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The premium digital Capacity Building Platform. Connect with expert trainers, master new skills, and accelerate your career with enterprise-grade learning tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transform hover:-translate-y-1 transition-all flex items-center justify-center"
            >
              Start Learning <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 text-lg font-bold rounded-xl text-indigo-700 bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm transform hover:-translate-y-1 transition-all"
            >
              Become a Trainer
            </button>
          </div>
        </div>
      </section>

      {/* 3. Statistics Bar */}
      <section className="bg-indigo-900 py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-indigo-800">
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white mb-2">{traineeCount.toLocaleString()}+</span>
              <span className="text-indigo-200 font-medium">Active Trainees</span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white mb-2">{trainerCount.toLocaleString()}+</span>
              <span className="text-indigo-200 font-medium">Expert Trainers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white mb-2">{categoriesCount.toLocaleString()}+</span>
              <span className="text-indigo-200 font-medium">Skill Categories</span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white mb-2">99%</span>
              <span className="text-indigo-200 font-medium">Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Upgraded Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Built for every role in the learning ecosystem</h3>
            <p className="text-xl text-gray-600">Dedicated tools and intelligent workflows designed to accelerate growth whether you are learning, teaching, or managing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Pillar 1 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Trainee Experience</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Discover courses, access rich learning materials, take interactive assessments, and earn verifiable certificates in a beautifully designed workspace.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Gamified Performance Tracking</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Instant Quiz Feedback</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> 1-Click Course Enrollment</li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Trainer Tools</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Empower your teaching with a robust course builder, dynamic assessment creator, and deep analytics to monitor trainee competency.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Drag & Drop Material Upload</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Custom Assessment Engine</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Trainee Evaluation Rubrics</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Admin Controls</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Maintain complete oversight of the platform with user management, system-wide analytics, and automated certification tracking.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Role & Approval Workflows</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Global KPI Dashboards</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Platform Announcements</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Demo Courses Showcase */}
      <section id="courses" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-2 block">Explore Catalog</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Featured Demo Courses</h2>
            <p className="text-xl text-gray-600">Discover professional training programs designed with rich materials, assessments, and certifications.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {storage.getCourses().filter(c => c.status === 'published').map(course => {
              const trainer = storage.getUserById(course.trainerId);
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-2 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img 
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600'} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {course.category && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-md">
                        {course.category}
                      </span>
                    )}
                    {course.duration && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                        {course.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">Trainer: {trainer?.name || 'Expert Instructor'}</p>
                    <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-2">{course.description}</p>
                    <button
                      onClick={onGetStarted}
                      className="w-full py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center"
                    >
                      Enroll in Course <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How Capacity Connect Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">A seamless journey from registration to certification.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line (Desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-indigo-100 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl border-4 border-white mb-6">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Sign Up & Choose Role</h4>
              <p className="text-gray-600">Create your account instantly. Select whether you want to learn as a Trainee, or teach as a Trainer.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-0">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl border-4 border-white mb-6">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Enroll & Access</h4>
              <p className="text-gray-600">Browse the dynamic course catalog. Enroll in programs and instantly access PDFs, videos, and notes.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-0">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl border-4 border-white mb-6">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Assess & Certify</h4>
              <p className="text-gray-600">Take timed assessments, receive instant scores, and automatically earn digital certificates.</p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section Before Footer */}
      <section className="bg-indigo-600 py-20 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to transform your learning capabilities?</h2>
        <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto">Join the premium Capacity Building Platform today. Registration is free and takes less than a minute.</p>
        <button
          onClick={onGetStarted}
          className="px-10 py-4 text-xl font-bold rounded-xl text-indigo-600 bg-white hover:bg-gray-50 shadow-xl transform hover:-translate-y-1 transition-all"
        >
          Create Free Account
        </button>
      </section>

      {/* 7. Comprehensive Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center text-white mb-4">
                <BookOpen className="w-6 h-6 mr-2 text-indigo-400" />
                <span className="text-xl font-bold tracking-tight">CAPACITY CONNECT</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                The all-in-one digital Learning Management & Capacity Building Platform connecting Trainees, Trainers, and Admins.
              </p>
            </div>
            
            {/* Column 2 */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#home" className="hover:text-indigo-400 transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</a></li>
                <li><button onClick={onGetStarted} className="hover:text-indigo-400 transition-colors">Sign In</button></li>
              </ul>
            </div>
            
            {/* Column 3 */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Accessibility</a></li>
              </ul>
            </div>
            
            {/* Column 4 */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Capacity Connect. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Designed for modern learning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
