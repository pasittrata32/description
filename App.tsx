import React, { useState, useEffect, useCallback } from 'react';
import { Course, User, UserRole, CourseStatus } from './types';
import { USERS, GUEST_TEACHER, INITIAL_COURSES } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CourseForm from './components/CourseForm';
import GoogleSheetGuide from './components/GoogleSheetGuide';
import { GoogleSheetIcon } from './components/Icons';

declare const Swal: any;
type View = 'dashboard' | 'login' | 'form';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(GUEST_TEACHER);
  const [view, setView] = useState<View>('dashboard');
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  
  const [sheetUrl, setSheetUrl] = useState<string | null>(() => localStorage.getItem('googleSheetUrl'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const fetchCoursesFromSheet = useCallback(async () => {
    if (!sheetUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้ กรุณาตรวจสอบ URL และการตั้งค่าสิทธิ์');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    if (sheetUrl) {
      fetchCoursesFromSheet();
    } else {
      try {
        const savedCourses = localStorage.getItem('courses');
        setCourses(savedCourses ? JSON.parse(savedCourses) : INITIAL_COURSES);
      } catch (error) {
        console.error("Failed to parse courses from localStorage", error);
        setCourses(INITIAL_COURSES);
      }
      setIsLoading(false);
    }
  }, [sheetUrl, fetchCoursesFromSheet]);

  useEffect(() => {
    if (!sheetUrl) {
      localStorage.setItem('courses', JSON.stringify(courses));
    }
  }, [courses, sheetUrl]);
  
  const handleLogin = (username: string, password: string): boolean => {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(GUEST_TEACHER);
    setView('dashboard');
  };

  const handleShowLogin = () => setView('login');
  const handleCancelLogin = () => setView('dashboard');
  const handleAddCourse = () => { setCourseToEdit(null); setView('form'); };
  const handleEditCourse = (course: Course) => { setCourseToEdit(course); setView('form'); };

  const handleDeleteCourse = async (courseId: string) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      if (sheetUrl) {
        try {
          const response = await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors', // Use no-cors for requests to Google Scripts to avoid CORS issues
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', payload: { id: courseId } })
          });
          // With 'no-cors', we can't read the response, so we optimistically refetch
          await fetchCoursesFromSheet(); 
          Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบจาก Google Sheet เรียบร้อยแล้ว', 'success');
        } catch (err) {
          setError('เกิดข้อผิดพลาดในการลบข้อมูล');
        } finally {
          setIsLoading(false);
        }
      } else {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setIsLoading(false);
        Swal.fire('ลบแล้ว!', 'ข้อมูลรายวิชาถูกลบเรียบร้อยแล้ว', 'success');
      }
    }
  };

  const handleSaveCourse = async (course: Course) => {
    setIsLoading(true);
    if (sheetUrl) {
      try {
        const response = await fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors', // Use no-cors for requests to Google Scripts to avoid CORS issues
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', payload: course })
        });
        await fetchCoursesFromSheet(); // Refetch to get the latest state
        Swal.fire('สำเร็จ!', 'ข้อมูลถูกบันทึกไปยัง Google Sheet เรียบร้อยแล้ว', 'success');
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        Swal.fire('ผิดพลาด!', 'ไม่สามารถบันทึกข้อมูลไปยัง Google Sheet ได้', 'error');
      } finally {
        setIsLoading(false);
        setView('dashboard');
      }
    } else {
      setCourses(prevCourses => {
        const isNew = !prevCourses.some(c => c.id === course.id);
        if (isNew) return [...prevCourses, course];
        return prevCourses.map(c => c.id === course.id ? course : c);
      });
      setIsLoading(false);
      Swal.fire('สำเร็จ!', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
      setView('dashboard');
    }
    setCourseToEdit(null);
  };
  
  const handleSaveSheetUrl = (url: string) => {
    localStorage.setItem('googleSheetUrl', url);
    setSheetUrl(url);
  };

  const handleCancelForm = () => { setView('dashboard'); setCourseToEdit(null); };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0B3D91]"></div>
        </div>
      );
    }

    if (error) {
        return <div className="text-center p-8 text-red-600 bg-red-100 m-8 rounded-lg">{error}</div>;
    }

    switch (view) {
      case 'login': return <Login onLogin={handleLogin} onCancel={handleCancelLogin} />;
      case 'form': return <CourseForm courseToEdit={courseToEdit} onSave={(course) => handleSaveCourse(course)} onCancel={handleCancelForm} currentUserId={currentUser.id} />;
      case 'dashboard':
      default: return <Dashboard user={currentUser} courses={courses} onAddCourse={handleAddCourse} onEditCourse={handleEditCourse} onDeleteCourse={handleDeleteCourse} />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {showGuide && <GoogleSheetGuide onClose={() => setShowGuide(false)} onSave={handleSaveSheetUrl} currentUrl={sheetUrl} />}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="text-xl md:text-2xl font-bold text-[#0B3D91] whitespace-nowrap">
            <h1 className="text-lg sm:text-xl font-bold">โรงเรียนสาธิตอุดมศึกษา</h1>
            <h2 className="text-sm sm:text-base font-normal text-gray-600">ระบบจัดการคำอธิบายรายวิชา</h2>
          </div>
          <div>
            {currentUser.role === UserRole.TEACHER ? (
              <button onClick={handleShowLogin} className="bg-[#0B3D91] text-white py-2 px-4 rounded-lg hover:bg-[#09317a] transition text-sm sm:text-base">
                Admin Login
              </button>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-gray-700 hidden sm:inline">สวัสดี, {currentUser.name}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition text-sm sm:text-base">
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {currentUser.role === UserRole.ADMIN && (
        <div className="bg-blue-50 border-t border-b border-blue-200">
          <div className="container mx-auto px-6 py-3 flex flex-col sm:flex-row justify-between items-center text-sm">
            <div className="flex items-center text-gray-700 mb-2 sm:mb-0">
              <span className="font-semibold mr-2">สถานะฐานข้อมูล:</span>
              <span className={sheetUrl ? 'text-green-600' : 'text-yellow-600'}>
                {sheetUrl ? 'เชื่อมต่อกับ Google Sheet แล้ว' : 'ใช้ Local Storage (ข้อมูลในเครื่อง)'}
              </span>
            </div>
            <button onClick={() => setShowGuide(true)} className="flex items-center bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition shadow-sm">
                <GoogleSheetIcon />
                {sheetUrl ? 'เปลี่ยน Google Sheet URL' : 'เชื่อมต่อ Google Sheet'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {renderContent()}
      </main>

      <footer className="bg-white shadow-inner mt-8 py-4">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>โรงเรียนสาธิตอุดมศึกษา ต.หนองปรือ อ.บางละมุง จ.ชลบุรี</p>
        </div>
      </footer>
    </div>
  );
};

export default App;