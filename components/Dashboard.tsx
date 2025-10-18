import React, { useState, useMemo } from 'react';
import { Course, User, UserRole, CourseStatus } from '../types';
import { TEACHERS, GRADES } from '../constants';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, StatusIcon, UserIcon } from './Icons';
import SummaryDashboard from './SummaryDashboard';

interface DashboardProps {
  user: User;
  courses: Course[];
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, courses, onAddCourse, onEditCourse, onDeleteCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const isAdmin = user.role === UserRole.ADMIN;

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const teacher = TEACHERS.find(t => t.id === course.teacherId);
      const teacherName = teacher ? teacher.name.toLowerCase() : '';
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = course.courseName.toLowerCase().includes(searchLower) ||
                            course.courseCode.toLowerCase().includes(searchLower) ||
                            teacherName.includes(searchLower);
      
      const matchesGrade = selectedGrade ? course.grade === selectedGrade : true;
      const matchesTeacher = selectedTeacher ? course.teacherId === parseInt(selectedTeacher) : true;
      
      return matchesSearch && matchesGrade && matchesTeacher;
    });
  }, [courses, searchTerm, selectedGrade, selectedTeacher]);

  const getTeacherName = (id: number) => TEACHERS.find(t => t.id === id)?.name || 'N/A';
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      {isAdmin && <SummaryDashboard courses={courses} />}
      
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">รายการคำอธิบายรายวิชา</h2>
          <button
            onClick={onAddCourse}
            className="w-full md:w-auto flex items-center justify-center bg-[#0B3D91] text-white py-2 px-6 rounded-lg hover:bg-[#09317a] transition duration-300 shadow-md"
          >
            <AddIcon />
            เพิ่มข้อมูล
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหา (ชื่อวิชา, รหัสวิชา, ครู)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition"
          >
            <option value="">-- ทุกระดับชั้น --</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition"
          >
            <option value="">-- ครูผู้สอนทั้งหมด --</option>
            {TEACHERS.filter(t => t.id !== 10).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">ระดับชั้น</th>
                <th className="p-4">รหัสวิชา</th>
                <th className="p-4">ชื่อวิชา</th>
                <th className="p-4">ครูผู้สอน</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCourses.length > 0 ? filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{course.grade}</td>
                  <td className="p-4">{course.courseCode}</td>
                  <td className="p-4 font-semibold text-gray-800">{course.courseName}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                        <UserIcon />
                        <span className="ml-2">{getTeacherName(course.teacherId)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center justify-center p-2 rounded-full text-xs font-semibold ${course.status === CourseStatus.SUBMITTED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        <StatusIcon status={course.status} />
                        <span className="ml-2">{course.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <button 
                        onClick={() => onEditCourse(course)} 
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed" 
                        title="แก้ไข"
                        disabled={!isAdmin && course.status === CourseStatus.SUBMITTED}
                      >
                        <EditIcon />
                      </button>
                      {isAdmin && (
                        <button onClick={() => onDeleteCourse(course.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition" title="ลบ">
                          <DeleteIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                        ไม่พบข้อมูลรายวิชาที่ตรงกับการค้นหา
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;