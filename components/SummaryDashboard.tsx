import React from 'react';
import { Course, CourseStatus } from '../types';
import { TEACHERS } from '../constants';

interface SummaryDashboardProps {
  courses: Course[];
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ courses }) => {
  const totalCourses = courses.length;
  const submittedCount = courses.filter(c => c.status === CourseStatus.SUBMITTED).length;
  const draftCount = courses.filter(c => c.status === CourseStatus.DRAFT).length;

  const teacherCourseCounts: { [key: number]: number } = {};
  courses.forEach(course => {
    teacherCourseCounts[course.teacherId] = (teacherCourseCounts[course.teacherId] || 0) + 1;
  });

  const getTeacherName = (id: number) => TEACHERS.find(t => t.id === id)?.name || 'ไม่พบชื่อ';

  const mostActiveTeacherId = Object.keys(teacherCourseCounts).length > 0
    ? Object.keys(teacherCourseCounts).reduce((a, b) => teacherCourseCounts[parseInt(a)] > teacherCourseCounts[parseInt(b)] ? a : b)
    : null;

  const mostActiveTeacher = mostActiveTeacherId ? {
      name: getTeacherName(parseInt(mostActiveTeacherId)),
      count: teacherCourseCounts[parseInt(mostActiveTeacherId)]
  } : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">รายวิชาทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-800">{totalCourses}</p>
        </div>
        <div className="bg-blue-100 text-[#0B3D91] p-3 rounded-full">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">ส่งแล้ว</p>
          <p className="text-3xl font-bold text-green-600">{submittedCount}</p>
        </div>
         <div className="bg-green-100 text-green-600 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">ฉบับร่าง</p>
          <p className="text-3xl font-bold text-yellow-500">{draftCount}</p>
        </div>
        <div className="bg-yellow-100 text-yellow-500 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">ครูผู้สอนที่มีรายวิชามากที่สุด</p>
           {mostActiveTeacher ? (
             <p className="text-xl font-bold text-gray-800">{mostActiveTeacher.name} ({mostActiveTeacher.count} วิชา)</p>
           ) : (
             <p className="text-xl font-bold text-gray-800">-</p>
           )}
        </div>
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
