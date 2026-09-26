import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../lib/storage';
import { Course, Material, Assessment, Enrollment, User, Feedback, Evaluation, Question } from '../../types';
import { PlusCircle, Book, FileText, CheckSquare, Users as UsersIcon, User as UserIcon, Star, ClipboardList, Eye, CheckCircle, Upload, Trash2, Clock, Tag, Link } from 'lucide-react';
import { RealTimeClock } from '../common/RealTimeClock';

type ViewState = 'profile' | 'courses' | 'course_detail' | 'assessments' | 'monitor' | 'feedback';

export const TrainerDashboard: React.FC<{ currentView?: string }> = ({ currentView }) => {
  const { user, updateProfile } = useAuth();
  const [view, setView] = useState<ViewState>('courses');

  useEffect(() => {
    if (currentView && currentView !== 'home') {
      const mappedView = currentView === 'course_detail' ? 'course_detail' : currentView;
      setView(mappedView as ViewState);
    }
  }, [currentView]);

  const [myCourses, setMyCourses] = useState<Course[]>([]);
  
  // Specific course states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<Material[]>([]);
  const [courseAssessments, setCourseAssessments] = useState<Assessment[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<Enrollment[]>([]);
  const [courseFeedback, setCourseFeedback] = useState<Feedback[]>([]);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    qualifications: user?.profile?.qualifications || '',
    workExperience: user?.profile?.workExperience || '',
    skills: user?.profile?.skills || '',
  });

  // Create Course State
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Technology');
  const [newCourseDuration, setNewCourseDuration] = useState('4 Weeks');
  const [newCourseVideoUrl, setNewCourseVideoUrl] = useState('');
  const [newCourseVideoTitle, setNewCourseVideoTitle] = useState('');
  const [newCourseThumbnail, setNewCourseThumbnail] = useState('');

  // Assessment Builder State
  const [isBuildingQuiz, setIsBuildingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDeadline, setQuizDeadline] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  
  // Evaluate Trainee State
  const [evaluatingTrainee, setEvaluatingTrainee] = useState<{enr: Enrollment, user: User} | null>(null);
  const [evalScore, setEvalScore] = useState(5);
  const [evalRemarks, setEvalRemarks] = useState('');

  const loadCourses = () => {
    if (user) {
      const courses = storage.getCoursesByTrainer(user.id);
      setMyCourses(courses);
      if (courses.length > 0 && !targetCourseId) {
        setTargetCourseId(courses[0].id);
      }
    }
  };

  useEffect(() => {
    loadCourses();

    const handleDataChange = () => {
      loadCourses();
      if (selectedCourse) {
        setCourseAssessments(storage.getAssessmentsByCourse(selectedCourse.id));
        setCourseMaterials(storage.getMaterialsByCourse(selectedCourse.id));
      }
    };

    window.addEventListener('capacity_data_changed', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('capacity_data_changed', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, [view, user, selectedCourse]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateProfile({
      phone: profileData.phone,
      qualifications: profileData.qualifications,
      workExperience: profileData.workExperience,
      skills: profileData.skills,
    });
    const updatedUser: User = { ...user, name: profileData.name, email: profileData.email };
    storage.saveUser(updatedUser);
    alert('Trainer Profile updated successfully!');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const courseId = `course_${Date.now()}`;
    const defaultThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
    
    const newCourse: Course = {
      id: courseId,
      title: newCourseTitle,
      description: newCourseDesc,
      trainerId: user.id,
      status: 'published',
      createdAt: new Date().toISOString(),
      category: newCourseCategory,
      duration: newCourseDuration,
      thumbnail: newCourseThumbnail.trim() || defaultThumbnail,
    };
    
    storage.saveCourse(newCourse);

    // If video url is provided during course creation, save it as a material instantly
    if (newCourseVideoUrl.trim()) {
      storage.saveMaterial({
        id: `mat_${Date.now()}`,
        courseId: courseId,
        title: newCourseVideoTitle.trim() || 'Course Introduction & Overview Video',
        type: 'video',
        url: newCourseVideoUrl.trim()
      });
    }

    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseCategory('Technology');
    setNewCourseDuration('4 Weeks');
    setNewCourseVideoUrl('');
    setNewCourseVideoTitle('');
    setNewCourseThumbnail('');
    setIsCreatingCourse(false);
    loadCourses();
    alert('कोर्स सफलतापूर्वक सहेज लिया गया है!');
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("क्या आप वाकई इस कोर्स को डिलीट करना चाहते हैं? इसके साथ ही सभी मटेरियल्स और क्विज़ भी हट जाएंगे।")) {
      storage.deleteCourse(courseId);
      
      // Clean up materials
      const materials = storage.getMaterialsByCourse(courseId);
      materials.forEach(m => storage.deleteMaterial(m.id));
      
      // Clean up assessments
      const assessments = storage.getAssessmentsByCourse(courseId);
      assessments.forEach(a => storage.deleteAssessment(a.id));
      
      alert("कोर्स पूरी तरह से हटा दिया गया है।");
      loadCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setView('courses');
      }
    }
  };

  const openCourseDetail = (course: Course) => {
    setSelectedCourse(course);
    setCourseMaterials(storage.getMaterialsByCourse(course.id));
    setCourseAssessments(storage.getAssessmentsByCourse(course.id));
    setCourseEnrollments(storage.getEnrollmentsByCourse(course.id));
    setView('course_detail');
  };

  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const type = (form.elements.namedItem('type') as HTMLSelectElement).value as any;
    const url = (form.elements.namedItem('url') as HTMLInputElement).value || '#';
    
    storage.saveMaterial({
      id: `mat_${Date.now()}`,
      courseId: selectedCourse.id,
      title,
      type,
      url: url.trim()
    });
    form.reset();
    setCourseMaterials(storage.getMaterialsByCourse(selectedCourse.id));
    alert("Material saved with link.");
  };

  const handleAddQuestion = () => {
    const qId = `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const opt1Id = `opt_${Date.now()}_1`;
    const opt2Id = `opt_${Date.now()}_2`;
    setQuizQuestions([...quizQuestions, {
      id: qId,
      text: '',
      options: [
        { id: opt1Id, text: 'Option 1' },
        { id: opt2Id, text: 'Option 2' }
      ],
      correctOptionId: opt1Id
    }]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    const updated = [...quizQuestions];
    updated.splice(qIndex, 1);
    setQuizQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...quizQuestions];
    const newOptId = `opt_${Date.now()}_${updated[qIndex].options.length + 1}`;
    updated[qIndex].options.push({ id: newOptId, text: `Option ${updated[qIndex].options.length + 1}` });
    setQuizQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const updated = [...quizQuestions];
    if (updated[qIndex].options.length <= 2) {
      alert("A question must have at least 2 options.");
      return;
    }
    const removedOpt = updated[qIndex].options[oIndex];
    updated[qIndex].options.splice(oIndex, 1);
    if (updated[qIndex].correctOptionId === removedOpt.id) {
      updated[qIndex].correctOptionId = updated[qIndex].options[0].id;
    }
    setQuizQuestions(updated);
  };

  const handleSaveQuiz = (overrideCourseId?: string) => {
    const cId = overrideCourseId || selectedCourse?.id || targetCourseId;
    if (!cId) {
      alert("Please select a course for this quiz.");
      return;
    }
    if (!quizTitle.trim()) {
      alert("Please enter a Quiz Title.");
      return;
    }
    if (quizQuestions.length === 0) {
      alert("Please add at least one question to the quiz.");
      return;
    }

    // Validate questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.text.trim()) {
        alert(`Question #${i + 1} is missing text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          alert(`Question #${i + 1}, Option #${j + 1} cannot be empty.`);
          return;
        }
      }
    }

    const quiz: Assessment = {
      id: editingQuizId || `ass_${Date.now()}`,
      courseId: cId,
      title: quizTitle,
      deadline: quizDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      questions: quizQuestions
    };

    storage.saveAssessment(quiz);
    
    setIsBuildingQuiz(false);
    setEditingQuizId(null);
    setQuizTitle('');
    setQuizDeadline('');
    setQuizQuestions([]);
    if (selectedCourse) {
      setCourseAssessments(storage.getAssessmentsByCourse(selectedCourse.id));
    }
    loadCourses();
    alert("Quiz and questions saved successfully!");
  };

  const handleStartEditQuiz = (quiz: Assessment) => {
    setEditingQuizId(quiz.id);
    setTargetCourseId(quiz.courseId);
    setQuizTitle(quiz.title);
    setQuizDeadline(quiz.deadline ? new Date(quiz.deadline).toISOString().slice(0, 16) : '');
    setQuizQuestions(quiz.questions || []);
    setIsBuildingQuiz(true);
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      storage.deleteAssessment(quizId);
      if (selectedCourse) {
        setCourseAssessments(storage.getAssessmentsByCourse(selectedCourse.id));
      }
      loadCourses();
    }
  };

  const handleEvaluateTrainee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !evaluatingTrainee || !selectedCourse) return;
    
    storage.saveEvaluation({
      id: `eval_${Date.now()}`,
      traineeId: evaluatingTrainee.user.id,
      trainerId: user.id,
      courseId: selectedCourse.id,
      competencyScore: evalScore,
      remarks: evalRemarks,
      evaluatedAt: new Date().toISOString()
    });
    
    setEvaluatingTrainee(null);
    setEvalScore(5);
    setEvalRemarks('');
    alert("Evaluation submitted.");
  };

  const loadFeedback = () => {
    const fb: Feedback[] = [];
    myCourses.forEach(c => {
      fb.push(...storage.getFeedbackByCourse(c.id));
    });
    setCourseFeedback(fb);
  };

  useEffect(() => {
    if (view === 'feedback') loadFeedback();
  }, [view]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
        
        {/* Profile View */}
        {view === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Trainer Profile</h2>
            <form onSubmit={handleProfileUpdate} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Qualifications</label>
                  <textarea rows={3} value={profileData.qualifications} onChange={e => setProfileData({...profileData, qualifications: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm border p-2"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise (Skills)</label>
                  <textarea rows={2} value={profileData.skills} onChange={e => setProfileData({...profileData, skills: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm border p-2"></textarea>
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Update Profile</button>
            </form>
          </div>
        )}

        {/* Courses List */}
        {view === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                <RealTimeClock variant="nav" />
              </div>
              <button onClick={() => setIsCreatingCourse(!isCreatingCourse)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition">
                <PlusCircle className="w-4 h-4 mr-2" /> {isCreatingCourse ? 'Cancel' : 'Create New Course'}
              </button>
            </div>

            {isCreatingCourse && (
              <form onSubmit={handleCreateCourse} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">New Course Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                    <input 
                      required 
                      value={newCourseTitle} 
                      onChange={e=>setNewCourseTitle(e.target.value)} 
                      type="text" 
                      placeholder="E.g., Master Public Speaking" 
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        value={newCourseCategory} 
                        onChange={e=>setNewCourseCategory(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                      >
                        <option value="Technology">Technology</option>
                        <option value="Management">Management</option>
                        <option value="Finance">Finance</option>
                        <option value="Design">Design</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Soft Skills">Soft Skills</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <select 
                        value={newCourseDuration} 
                        onChange={e=>setNewCourseDuration(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                      >
                        <option value="2 Weeks">2 Weeks</option>
                        <option value="3 Weeks">3 Weeks</option>
                        <option value="4 Weeks">4 Weeks</option>
                        <option value="5 Weeks">5 Weeks</option>
                        <option value="6 Weeks">6 Weeks</option>
                        <option value="8 Weeks">8 Weeks</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description & Objectives</label>
                  <textarea 
                    required 
                    value={newCourseDesc} 
                    onChange={e=>setNewCourseDesc(e.target.value)} 
                    rows={3} 
                    placeholder="Provide a detailed description of what trainees will learn."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL (Optional)</label>
                  <input 
                    value={newCourseThumbnail} 
                    onChange={e=>setNewCourseThumbnail(e.target.value)} 
                    type="url" 
                    placeholder="https://images.unsplash.com/photo-..." 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white" 
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                  <h4 className="text-sm font-bold text-blue-900 flex items-center">
                    <Link className="w-4 h-4 mr-1.5" /> Initial Video Lecture or Material (Optional)
                  </h4>
                  <p className="text-xs text-blue-700 mb-2">You can add an introductory lecture/video right now. Trainees will see this immediately upon enrolling.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">Video / Material Title</label>
                      <input 
                        value={newCourseVideoTitle} 
                        onChange={e=>setNewCourseVideoTitle(e.target.value)} 
                        type="text" 
                        placeholder="E.g., Welcome Video Lecture" 
                        className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">Video / Material URL Link</label>
                      <input 
                        value={newCourseVideoUrl} 
                        onChange={e=>setNewCourseVideoUrl(e.target.value)} 
                        type="url" 
                        placeholder="E.g., https://www.youtube.com/watch?v=..." 
                        className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingCourse(false)} 
                    className="bg-gray-100 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-200 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium shadow-sm transition"
                  >
                    Save & Create Course
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    {course.thumbnail ? (
                      <div className="h-40 w-full overflow-hidden relative">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-blue-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-blue-100 shadow-xs">
                          {course.category || 'Course'}
                        </span>
                      </div>
                    ) : (
                      <div className="h-40 w-full bg-blue-600 flex items-center justify-center relative p-6">
                        <span className="text-white font-extrabold text-xl text-center line-clamp-2">{course.title}</span>
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-blue-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                          {course.category || 'Course'}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{course.title}</h3>
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0">
                          {course.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">{course.description}</p>
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4 pt-1">
                        {course.duration && (
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {course.duration}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Tag className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {course.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 pt-0 border-t border-gray-100 mt-4 flex items-center space-x-2">
                    <button 
                      onClick={() => openCourseDetail(course)} 
                      className="flex-1 text-center text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 px-3 rounded-lg font-bold text-xs sm:text-sm transition flex items-center justify-center"
                    >
                      <Book className="w-4 h-4 mr-1.5 shrink-0" /> Manage Course
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)} 
                      title="Delete Course"
                      className="text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 p-2 rounded-lg transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Detail (Materials & Assessments) */}
        {view === 'course_detail' && selectedCourse && (
          <div className="space-y-8">
            <button onClick={() => setView('courses')} className="text-sm font-medium text-gray-500 hover:text-gray-800">&larr; Back to Courses</button>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900">{selectedCourse.title}</h2>
              <p className="text-gray-600 mt-2">{selectedCourse.description}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Materials Uploader */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-6 flex items-center"><Upload className="mr-2 text-blue-500"/> Upload Materials</h3>
                <form onSubmit={handleUploadMaterial} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Material Title</label>
                    <input name="title" required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File Type</label>
                    <select name="type" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video Lecture</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Material / Video Link (URL)</label>
                    <input name="url" type="url" placeholder="E.g., https://www.youtube.com/watch?v=..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white text-sm" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">Upload Metadata</button>
                </form>
                
                <h4 className="font-semibold text-gray-700 mb-2">Current Materials</h4>
                <ul className="space-y-2">
                  {courseMaterials.map(m => (
                    <li key={m.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md">
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="font-medium text-sm text-gray-900 truncate">{m.title}</span>
                        {m.url && m.url !== '#' && (
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 break-all truncate">
                            {m.url}
                          </a>
                        )}
                      </div>
                      <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded text-gray-600 shrink-0">{m.type}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assessment Builder */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center"><CheckSquare className="mr-2 text-purple-500"/> Assessment Builder</h3>
                  <button 
                    onClick={() => {
                      if (!isBuildingQuiz) {
                        setEditingQuizId(null);
                        setQuizTitle('');
                        setQuizDeadline('');
                        setQuizQuestions([]);
                        setIsBuildingQuiz(true);
                      } else {
                        setIsBuildingQuiz(false);
                      }
                    }} 
                    className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded font-medium hover:bg-purple-200"
                  >
                    {isBuildingQuiz ? 'Cancel' : '+ New Quiz'}
                  </button>
                </div>

                {isBuildingQuiz ? (
                  <div className="space-y-4">
                    <input type="text" placeholder="Quiz Title" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm font-medium" />
                    <div>
                      <label className="block text-xs text-gray-500">Deadline</label>
                      <input type="datetime-local" value={quizDeadline} onChange={e=>setQuizDeadline(e.target.value)} className="w-full border border-gray-300 rounded p-2 mt-1 text-sm" />
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      {quizQuestions.map((q, qIndex) => (
                        <div key={q.id} className="p-4 border border-purple-200 bg-purple-50/50 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-purple-800">Question #{qIndex + 1}</span>
                            <button onClick={() => handleRemoveQuestion(qIndex)} className="text-xs text-red-500 hover:underline">Remove Q</button>
                          </div>
                          <input type="text" placeholder="Question Text" value={q.text} onChange={e => {
                            const newQs = [...quizQuestions];
                            newQs[qIndex].text = e.target.value;
                            setQuizQuestions(newQs);
                          }} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
                          
                          {q.options.map((opt, oIndex) => (
                            <div key={opt.id} className="flex items-center space-x-2">
                              <input type="radio" name={`correct_${q.id}`} checked={q.correctOptionId === opt.id} onChange={() => {
                                const newQs = [...quizQuestions];
                                newQs[qIndex].correctOptionId = opt.id;
                                setQuizQuestions(newQs);
                              }} />
                              <input type="text" placeholder={`Option ${oIndex + 1}`} value={opt.text} onChange={e => {
                                const newQs = [...quizQuestions];
                                newQs[qIndex].options[oIndex].text = e.target.value;
                                setQuizQuestions(newQs);
                              }} className="flex-1 border border-gray-300 rounded p-1 text-sm bg-white" />
                              {q.options.length > 2 && (
                                <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} className="text-xs text-gray-400 hover:text-red-500">×</button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => handleAddOption(qIndex)} className="text-xs text-purple-600 hover:underline">+ Add Option</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-4">
                      <button onClick={handleAddQuestion} className="text-sm font-medium text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50">+ Add Question</button>
                      <button onClick={() => handleSaveQuiz(selectedCourse.id)} className="text-sm font-medium bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
                        {editingQuizId ? 'Update Assessment' : 'Save Assessment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {courseAssessments.map(a => (
                      <li key={a.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-900">{a.title}</p>
                            <p className="text-xs text-gray-500">Deadline: {new Date(a.deadline).toLocaleDateString()} | {a.questions.length} Question(s)</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleStartEditQuiz(a)} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-medium hover:bg-blue-100 border border-blue-200">
                              Edit Qs
                            </button>
                            <button onClick={() => handleDeleteQuiz(a.id)} className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded font-medium hover:bg-red-100 border border-red-200">
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                    {courseAssessments.length === 0 && <p className="text-gray-500 text-sm">No assessments created.</p>}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assessments & Quizzes View */}
        {view === 'assessments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quizzes & Questions Management</h2>
                <p className="text-sm text-gray-500">Create, edit, and manage quiz questions for your trainees.</p>
              </div>
              {!isBuildingQuiz && (
                <button 
                  onClick={() => {
                    setEditingQuizId(null);
                    setQuizTitle('');
                    setQuizDeadline('');
                    setQuizQuestions([]);
                    setIsBuildingQuiz(true);
                  }} 
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-sm text-sm"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> + Create New Quiz
                </button>
              )}
            </div>

            {isBuildingQuiz ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2 text-purple-600" />
                    {editingQuizId ? 'Edit Quiz & Questions' : 'Create New Quiz & Questions'}
                  </h3>
                  <button 
                    onClick={() => { setIsBuildingQuiz(false); setEditingQuizId(null); setQuizQuestions([]); }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Select Course</label>
                    <select 
                      value={targetCourseId} 
                      onChange={e => setTargetCourseId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium bg-gray-50 focus:ring-2 focus:ring-purple-500"
                    >
                      {myCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Quiz Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Chapter 1 Knowledge Check" 
                      value={quizTitle} 
                      onChange={e => setQuizTitle(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Deadline / Time Limit</label>
                    <input 
                      type="datetime-local" 
                      value={quizDeadline} 
                      onChange={e => setQuizDeadline(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500" 
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-900 text-base">Questions ({quizQuestions.length})</h4>
                    <button 
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition flex items-center"
                    >
                      + Add Question
                    </button>
                  </div>

                  {quizQuestions.map((q, qIndex) => (
                    <div key={q.id} className="p-5 border border-purple-200 bg-purple-50/50 rounded-xl space-y-4 relative">
                      <div className="flex justify-between items-start gap-2">
                        <span className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            placeholder={`Enter Question #${qIndex + 1} text...`} 
                            value={q.text} 
                            onChange={e => {
                              const newQs = [...quizQuestions];
                              newQs[qIndex].text = e.target.value;
                              setQuizQuestions(newQs);
                            }} 
                            className="w-full border border-gray-300 bg-white rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-purple-500" 
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded text-xs font-semibold"
                        >
                          Delete Q#{qIndex + 1}
                        </button>
                      </div>

                      <div className="pl-9 space-y-2.5">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Options (Select radio for correct answer):</p>
                        {q.options.map((opt, oIndex) => (
                          <div key={opt.id} className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              name={`correct_${q.id}`} 
                              checked={q.correctOptionId === opt.id} 
                              onChange={() => {
                                const newQs = [...quizQuestions];
                                newQs[qIndex].correctOptionId = opt.id;
                                setQuizQuestions(newQs);
                              }}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300" 
                            />
                            <input 
                              type="text" 
                              placeholder={`Option ${oIndex + 1}`} 
                              value={opt.text} 
                              onChange={e => {
                                const newQs = [...quizQuestions];
                                newQs[qIndex].options[oIndex].text = e.target.value;
                                setQuizQuestions(newQs);
                              }} 
                              className={`flex-1 border rounded-lg p-2 text-sm bg-white ${q.correctOptionId === opt.id ? 'border-purple-500 ring-1 ring-purple-500 font-semibold text-purple-900' : 'border-gray-300'}`} 
                            />
                            {q.options.length > 2 && (
                              <button 
                                type="button"
                                onClick={() => handleRemoveOption(qIndex, oIndex)}
                                className="text-gray-400 hover:text-red-600 px-2 text-sm font-bold"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => handleAddOption(qIndex)} 
                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline pt-1 inline-block"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  ))}

                  {quizQuestions.length === 0 && (
                    <div className="text-center py-6 bg-white rounded-lg border border-dashed border-purple-200">
                      <p className="text-sm text-gray-500 mb-2">No questions added yet to this quiz.</p>
                      <button 
                        type="button"
                        onClick={handleAddQuestion}
                        className="text-xs font-bold text-purple-600 hover:underline"
                      >
                        Click here to add the first question
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button 
                    type="button"
                    onClick={() => { setIsBuildingQuiz(false); setEditingQuizId(null); setQuizQuestions([]); }} 
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSaveQuiz(targetCourseId)} 
                    className="px-6 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm"
                  >
                    {editingQuizId ? 'Update Quiz & Questions' : 'Save Quiz & Questions'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {myCourses.map(course => {
                  const assessments = storage.getAssessmentsByCourse(course.id);
                  return (
                    <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                          <p className="text-xs text-gray-500">{assessments.length} Quiz(zes) available</p>
                        </div>
                        <button 
                          onClick={() => {
                            setTargetCourseId(course.id);
                            setEditingQuizId(null);
                            setQuizTitle('');
                            setQuizDeadline('');
                            setQuizQuestions([]);
                            setIsBuildingQuiz(true);
                          }}
                          className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100"
                        >
                          + Add Quiz to Course
                        </button>
                      </div>

                      {assessments.length > 0 ? (
                        <div className="space-y-4">
                          {assessments.map(quiz => (
                            <div key={quiz.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-base">{quiz.title}</h4>
                                  <p className="text-xs text-gray-500">
                                    Deadline: {new Date(quiz.deadline).toLocaleDateString()} | Questions: {quiz.questions.length}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleStartEditQuiz(quiz)}
                                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 border border-blue-200"
                                  >
                                    Edit Quiz & Questions
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-200"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {/* Questions Details Accordion/Preview */}
                              {quiz.questions && quiz.questions.length > 0 && (
                                <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs space-y-2">
                                  <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Questions Preview:</p>
                                  {quiz.questions.map((q, idx) => (
                                    <div key={q.id} className="pl-2 border-l-2 border-purple-400 py-1">
                                      <p className="font-medium text-gray-900">{idx + 1}. {q.text || 'Untitled Question'}</p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {q.options.map(opt => (
                                          <span key={opt.id} className={`px-2 py-0.5 rounded text-[11px] ${opt.id === q.correctOptionId ? 'bg-green-100 text-green-800 font-bold border border-green-300' : 'bg-gray-100 text-gray-600'}`}>
                                            {opt.text} {opt.id === q.correctOptionId ? '✓' : ''}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-2">No quizzes created for this course yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Trainee Monitoring */}
        {view === 'monitor' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Trainee Monitoring</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trainee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myCourses.flatMap(course => {
                    const enrollments = storage.getEnrollmentsByCourse(course.id);
                    return enrollments.map(enr => {
                      const trainee = storage.getUserById(enr.traineeId);
                      return (
                        <tr key={enr.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{trainee?.name}</div>
                            <div className="text-sm text-gray-500">{trainee?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div className={`h-2 rounded-full ${enr.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${enr.progress}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block">{enr.progress}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button onClick={() => { setSelectedCourse(course); setEvaluatingTrainee({enr, user: trainee!}) }} className="text-blue-600 hover:text-blue-900 font-medium bg-blue-50 px-3 py-1 rounded">
                              Evaluate
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  })}
                </tbody>
              </table>
            </div>

            {/* Evaluation Modal/Form */}
            {evaluatingTrainee && selectedCourse && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                  <h3 className="text-xl font-bold mb-4 border-b pb-2">Evaluate Competency</h3>
                  <p className="font-medium text-gray-900 mb-1">Trainee: {evaluatingTrainee.user.name}</p>
                  <p className="text-sm text-gray-500 mb-6">Course: {selectedCourse.title}</p>
                  
                  <form onSubmit={handleEvaluateTrainee} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Competency Rating (1-5)</label>
                      <input type="range" min="1" max="5" value={evalScore} onChange={e=>setEvalScore(Number(e.target.value))} className="w-full" />
                      <div className="text-center font-bold text-xl text-blue-600">{evalScore} / 5</div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Trainer Remarks</label>
                      <textarea required value={evalRemarks} onChange={e=>setEvalRemarks(e.target.value)} rows={4} className="w-full border border-gray-300 rounded p-2"></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button type="button" onClick={() => setEvaluatingTrainee(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded font-medium">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium">Submit Evaluation</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Viewer */}
        {view === 'feedback' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Course Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseFeedback.map(fb => {
                const course = storage.getCourseById(fb.courseId);
                const trainee = storage.getUserById(fb.traineeId);
                return (
                  <div key={fb.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{course?.title}</h3>
                      <div className="flex text-yellow-400">
                        {Array.from({length: fb.rating}).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">From: {trainee?.name || 'Unknown'}</p>
                    <p className="text-gray-700 italic">"{fb.comment}"</p>
                  </div>
                )
              })}
              {courseFeedback.length === 0 && <p className="text-gray-500">No feedback received yet.</p>}
            </div>
          </div>
        )}

      </div>
  );
};
