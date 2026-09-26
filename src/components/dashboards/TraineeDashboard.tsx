import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../lib/storage';
import { Course, Enrollment, Material, Assessment, Score, User } from '../../types';
import { Book, PlayCircle, FileText, CheckCircle, Award, Compass, User as UserIcon, BarChart3, Star, Download, Clock, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RealTimeClock } from '../common/RealTimeClock';

type ViewState = 'profile' | 'catalog' | 'learning' | 'learning_course' | 'quiz' | 'performance' | 'certificates' | 'feedback';

export const TraineeDashboard: React.FC<{ currentView?: string }> = ({ currentView }) => {
  const { user, updateProfile } = useAuth();
  const [view, setView] = useState<ViewState>('learning');

  useEffect(() => {
    if (currentView && currentView !== 'home') {
      const mappedView = (currentView === 'learning_course' || currentView === 'quiz') ? currentView : currentView;
      setView(mappedView as ViewState);
    }
  }, [currentView]);

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  
  // Active course states
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  // Quiz taking states
  const [activeQuiz, setActiveQuiz] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<Score | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Form states for profile
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    qualifications: user?.profile?.qualifications || '',
    workExperience: user?.profile?.workExperience || '',
    skills: user?.profile?.skills || '',
    interests: user?.profile?.interests || '',
  });

  // Trainer Profile Modal State
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);

  const openTrainerModal = (trainerId: string) => {
    const trainer = storage.getUserById(trainerId);
    if (trainer) setSelectedTrainer(trainer);
  };

  const closeTrainerModal = () => setSelectedTrainer(null);

  const loadData = () => {
    if (!user) return;
    setAllCourses(storage.getCourses().filter(c => c.status === 'published'));
    setMyEnrollments(storage.getEnrollmentsByTrainee(user.id));
    setScores(storage.getScoresByTrainee(user.id));
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('capacity_data_changed', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('capacity_data_changed', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, [view, user]);

  // Quiz Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'quiz' && activeQuiz && !quizResult && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz(); // Auto submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, activeQuiz, quizResult, timeLeft]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateProfile({
      phone: profileData.phone,
      qualifications: profileData.qualifications,
      workExperience: profileData.workExperience,
      skills: profileData.skills,
      interests: profileData.interests,
    });
    // Also update basic details in user object
    const updatedUser: User = { ...user, name: profileData.name, email: profileData.email };
    storage.saveUser(updatedUser);
    alert('Profile updated successfully!');
  };

  const handleEnroll = (courseId: string) => {
    if (!user) return;
    const enrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      courseId,
      traineeId: user.id,
      progress: 0,
      status: 'enrolled',
      enrolledAt: new Date().toISOString()
    };
    storage.saveEnrollment(enrollment);
    loadData();
    setView('learning');
  };

  const startLearning = (courseId: string) => {
    const course = storage.getCourseById(courseId);
    if (course) {
      setActiveCourse(course);
      setMaterials(storage.getMaterialsByCourse(courseId));
      setAssessments(storage.getAssessmentsByCourse(courseId));
      setView('learning_course');
    }
  };

  const startQuiz = (quiz: Assessment) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setQuizResult(null);
    setTimeLeft(quiz.questions.length * 60); // 1 min per question
    setView('quiz');
  };

  const submitQuiz = () => {
    if (!user || !activeQuiz || !activeCourse) return;
    
    let correct = 0;
    activeQuiz.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        correct++;
      }
    });

    const score: Score = {
      id: `score_${Date.now()}`,
      assessmentId: activeQuiz.id,
      traineeId: user.id,
      score: correct,
      maxScore: activeQuiz.questions.length,
      submittedAt: new Date().toISOString()
    };
    storage.saveScore(score);
    
    // Update enrollment progress
    const enrollment = storage.getEnrollment(activeCourse.id, user.id);
    if (enrollment) {
      storage.saveEnrollment({
        ...enrollment,
        progress: 100,
        status: 'completed'
      });
    }

    setQuizResult(score);
  };

  const getCourseForEnrollment = (courseId: string) => {
    return allCourses.find(c => c.id === courseId);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const completedCourses = myEnrollments.filter(e => e.status === 'completed');

  // Chart data
  const performanceData = scores.map(s => {
    const assessment = storage.getAssessmentById(s.assessmentId);
    return {
      name: assessment?.title || 'Quiz',
      score: Math.round((s.score / s.maxScore) * 100)
    };
  });

  return (
    <div className="flex-1 overflow-y-auto">
        
        {/* Profile View */}
        {view === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Professional Profile</h2>
              <p className="text-gray-500">Update your personal details and professional background.</p>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Educational Qualifications</label>
                  <textarea rows={2} value={profileData.qualifications} onChange={e => setProfileData({...profileData, qualifications: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="E.g., BSc Computer Science"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Work Experience</label>
                  <textarea rows={2} value={profileData.workExperience} onChange={e => setProfileData({...profileData, workExperience: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Briefly describe your experience"></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Skills & Interests</label>
                  <textarea rows={2} value={profileData.skills} onChange={e => setProfileData({...profileData, skills: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="E.g., JavaScript, Project Management"></textarea>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">Save Profile</button>
              </div>
            </form>
          </div>
        )}

        {/* Catalog View */}
        {view === 'catalog' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center text-gray-900"><Book className="mr-3 text-blue-600"/> Course Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.filter(c => !myEnrollments.find(e => e.courseId === c.id)).map(course => {
                const trainer = storage.getUserById(course.trainerId);
                return (
                  <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img 
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600'} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {course.category && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                          {course.category}
                        </span>
                      )}
                      {course.duration && (
                        <span className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                          {course.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">By {trainer?.name || 'Unknown Trainer'}</p>
                        {trainer && (
                          <button onClick={() => openTrainerModal(course.trainerId)} className="text-sm font-medium text-blue-600 hover:underline">
                            View Trainer Profile
                          </button>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-2">{course.description}</p>
                      <button onClick={() => handleEnroll(course.id)} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        Enroll Now
                      </button>
                    </div>
                  </div>
                );
              })}
              {allCourses.filter(c => !myEnrollments.find(e => e.courseId === c.id)).length === 0 && (
                <p className="text-gray-500 col-span-full">No new courses available right now.</p>
              )}
            </div>
          </div>
        )}

        {/* My Learning View */}
        {view === 'learning' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-2xl font-bold flex items-center text-gray-900"><PlayCircle className="mr-3 text-blue-600"/> My Learning</h2>
              <RealTimeClock variant="nav" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEnrollments.map(enr => {
                const course = getCourseForEnrollment(enr.courseId);
                if (!course) return null;
                return (
                  <div key={enr.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                      <img 
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600'} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {course.category && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                          {course.category}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                      {course.trainerId && (
                        <div className="mb-4">
                          <button onClick={() => openTrainerModal(course.trainerId)} className="text-sm font-medium text-blue-600 hover:underline">
                            View Trainer Profile
                          </button>
                        </div>
                      )}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-500">Progress</span>
                          <span className="text-sm font-bold text-blue-600">{enr.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div className={`h-2 rounded-full transition-all duration-500 ${enr.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${enr.progress}%` }}></div>
                        </div>
                        <button onClick={() => startLearning(course.id)} className="w-full py-2 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100 transition-colors">
                          {enr.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {myEnrollments.length === 0 && (
                <div className="col-span-full p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Compass className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                  <button onClick={() => setView('catalog')} className="text-blue-600 font-medium hover:underline">Browse Catalog</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Course View */}
        {view === 'learning_course' && activeCourse && (
          <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={() => setView('learning')} className="text-sm text-gray-500 hover:text-gray-800 font-medium">&larr; Back to My Learning</button>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900">{activeCourse.title}</h2>
              <p className="text-gray-600 mt-3 text-lg">{activeCourse.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900"><FileText className="mr-3 text-blue-500" /> Learning Materials</h3>
                <ul className="space-y-4">
                  {materials.map(m => {
                    const isExternal = m.url && m.url !== '#';
                    return (
                      <li key={m.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded mr-4">
                          {m.type === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-semibold text-sm sm:text-base truncate">{m.title}</p>
                          {isExternal ? (
                            <a 
                              href={m.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center mt-1 font-bold"
                            >
                              Click to watch / open resource &rarr;
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Resource file attached</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                  {materials.length === 0 && <p className="text-sm text-gray-500">No materials available yet.</p>}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900"><CheckCircle className="mr-3 text-purple-500" /> Assessments</h3>
                <ul className="space-y-4">
                  {assessments.map(a => {
                    const existingScore = scores.find(s => s.assessmentId === a.id);
                    return (
                      <li key={a.id} className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{a.title}</span>
                        </div>
                        {existingScore ? (
                          <div className="mt-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
                            Completed - Score: {existingScore.score}/{existingScore.maxScore}
                          </div>
                        ) : (
                          <button onClick={() => startQuiz(a)} className="mt-2 text-sm bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium transition">Begin Quiz</button>
                        )}
                      </li>
                    )
                  })}
                  {assessments.length === 0 && <p className="text-sm text-gray-500">No assessments available yet.</p>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quiz View */}
        {view === 'quiz' && activeQuiz && (
          <div className="max-w-3xl mx-auto py-8">
            {!quizResult ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900">{activeQuiz.title}</h2>
                  <div className={`flex items-center px-4 py-2 rounded-full font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    <Clock className="w-5 h-5 mr-2" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="space-y-10">
                  {activeQuiz.questions.map((q, i) => (
                    <div key={q.id}>
                      <p className="font-semibold text-lg text-gray-900 mb-4">{i + 1}. {q.text}</p>
                      <div className="space-y-3">
                        {q.options.map(opt => (
                          <label key={opt.id} className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input 
                              type="radio" 
                              name={`q_${q.id}`} 
                              value={opt.id}
                              checked={answers[q.id] === opt.id}
                              onChange={() => setAnswers({...answers, [q.id]: opt.id})}
                              className="mr-4 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" 
                            />
                            <span className={answers[q.id] === opt.id ? 'text-blue-900 font-medium' : 'text-gray-700'}>{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <button 
                    onClick={submitQuiz}
                    disabled={Object.keys(answers).length !== activeQuiz.questions.length}
                    className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                  >
                    Submit Assessment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
                  <Award className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Assessment Completed!</h2>
                <p className="text-xl text-gray-600 mb-8">
                  You scored <span className="font-bold text-gray-900">{quizResult.score}</span> out of <span className="font-bold text-gray-900">{quizResult.maxScore}</span>
                  {' '} ({Math.round((quizResult.score / quizResult.maxScore) * 100)}%)
                </p>
                <button 
                  onClick={() => setView('learning_course')}
                  className="py-3 px-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  Return to Course
                </button>
              </div>
            )}
          </div>
        )}

        {/* Performance Dashboard */}
        {view === 'performance' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
              <p className="text-gray-500">Track your progress and assessment scores across all enrolled courses.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Courses Enrolled</p>
                <p className="text-3xl font-bold text-gray-900">{myEnrollments.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Courses Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedCourses.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Average Quiz Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {scores.length > 0 
                    ? `${Math.round(scores.reduce((acc, s) => acc + (s.score / s.maxScore) * 100, 0) / scores.length)}%` 
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-6 text-gray-900">Assessment Scores</h3>
              {scores.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                      <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                      <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No assessment data available yet. Complete a quiz to see your chart!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificates */}
        {view === 'certificates' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
              <p className="text-gray-500">View and download your earned certificates.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myEnrollments.map(enr => {
                const course = getCourseForEnrollment(enr.courseId);
                if (!course) return null;
                const isCompleted = enr.status === 'completed';
                
                return (
                  <div key={enr.id} className={`p-6 rounded-xl border ${isCompleted ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                        <Award className="w-8 h-8" />
                      </div>
                      {isCompleted ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">Earned</span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">Locked</span>
                      )}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-6">Certificate of Completion</p>
                    
                    {isCompleted ? (
                      <button onClick={() => {
                        const win = window.open('', '_blank');
                        if(win) {
                          win.document.write(`
                            <html><body style="font-family:sans-serif; text-align:center; padding:50px; background:#f9fafb;">
                              <div style="max-w:800px; margin:0 auto; padding:50px; background:white; border:20px solid #eff6ff; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                                <h1 style="color:#1e3a8a; font-size:48px; margin-bottom:10px;">Certificate of Completion</h1>
                                <p style="font-size:24px; color:#6b7280; margin-bottom:40px;">This certifies that</p>
                                <h2 style="font-size:40px; margin-bottom:40px; border-bottom:2px solid #e5e7eb; display:inline-block; padding-bottom:10px;">${user?.name}</h2>
                                <p style="font-size:24px; color:#6b7280; margin-bottom:40px;">has successfully completed the course</p>
                                <h3 style="font-size:32px; color:#1f2937; margin-bottom:60px;">${course.title}</h3>
                                <div style="display:flex; justify-content:space-between; margin-top:80px; text-align:center;">
                                  <div style="border-top:1px solid #9ca3af; padding-top:10px; width:200px; margin:0 auto;">Date: ${new Date().toLocaleDateString()}</div>
                                  <div style="border-top:1px solid #9ca3af; padding-top:10px; width:200px; margin:0 auto;">Capacity Connect</div>
                                </div>
                              </div>
                            </body></html>
                          `);
                          win.document.close();
                        }
                      }} className="w-full py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center">
                        <Download className="w-4 h-4 mr-2" /> Download HTML Certificate
                      </button>
                    ) : (
                      <div className="w-full py-2 bg-gray-200 text-gray-500 font-medium rounded-lg text-center cursor-not-allowed">
                        Complete course to unlock
                      </div>
                    )}
                  </div>
                );
              })}
              {myEnrollments.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Enroll and complete courses to earn certificates.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {view === 'feedback' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Course Feedback</h2>
              <p className="text-gray-500">Help us improve by providing feedback on your completed courses.</p>
            </div>

            {completedCourses.length > 0 ? (
              <div className="space-y-6">
                {completedCourses.map(enr => {
                  const course = getCourseForEnrollment(enr.courseId);
                  if (!course) return null;
                  return (
                    <div key={enr.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h3 className="font-bold text-lg mb-4">Feedback for: {course.title}</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const comment = (form.elements.namedItem('comment') as HTMLInputElement).value;
                        const rating = parseInt((form.elements.namedItem('rating') as HTMLSelectElement).value);
                        storage.saveFeedback({
                          id: `fb_${Date.now()}`,
                          courseId: course.id,
                          traineeId: user?.id || '',
                          rating,
                          comment,
                          submittedAt: new Date().toISOString()
                        });
                        alert('Thank you! Your feedback has been submitted.');
                        form.reset();
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                          <select name="rating" className="block w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" required defaultValue="5">
                            <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                            <option value="4">⭐⭐⭐⭐ - Good</option>
                            <option value="3">⭐⭐⭐ - Average</option>
                            <option value="2">⭐⭐ - Poor</option>
                            <option value="1">⭐ - Terrible</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                          <textarea name="comment" required rows={4} className="block w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="What did you like about this course? What could be improved?"></textarea>
                        </div>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition">Submit Feedback</button>
                      </form>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">You need to complete a course before you can submit feedback.</p>
              </div>
            )}
          </div>
        )}

        {/* Trainer Profile Modal */}
        {selectedTrainer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
              {/* Header/Cover */}
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              
              {/* Close Button */}
              <button 
                onClick={closeTrainerModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black/20 hover:bg-black/40 rounded-full p-1 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              {/* Profile Content */}
              <div className="px-6 pb-6 text-center">
                {/* Avatar */}
                <div className="relative mx-auto -mt-12 mb-4 w-24 h-24 bg-white rounded-full p-1 shadow-md">
                  <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <UserIcon className="w-12 h-12" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">{selectedTrainer.name}</h3>
                <p className="text-indigo-600 font-medium mt-1 mb-4">{selectedTrainer.profile?.qualifications || 'Professional Trainer'}</p>
                
                <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About & Experience</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedTrainer.profile?.workExperience || 'No bio provided.'}
                  </p>
                  
                  {selectedTrainer.profile?.skills && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrainer.profile.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};
