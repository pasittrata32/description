import React, { useState, useEffect } from 'react';
import { Course, CourseType, CourseStatus } from '../types';
import { GRADES, SUBJECTS, TEACHERS } from '../constants';
import { SaveIcon, SendIcon, CancelIcon } from './Icons';

// Make Swal available from the window object
declare const Swal: any;

interface CourseFormProps {
  courseToEdit: Course | null;
  onSave: (course: Course, status: CourseStatus) => void;
  onCancel: () => void;
  currentUserId: number;
}

const CourseForm: React.FC<CourseFormProps> = ({ courseToEdit, onSave, onCancel, currentUserId }) => {
  const [formData, setFormData] = useState<Omit<Course, 'id' | 'lastSaved'>>({
    grade: courseToEdit?.grade || '',
    courseCode: courseToEdit?.courseCode || '',
    courseName: courseToEdit?.courseName || '',
    courseType: courseToEdit?.courseType || CourseType.CORE,
    description: courseToEdit?.description || '',
    standards: courseToEdit?.standards || '',
    outcomes: courseToEdit?.outcomes || '',
    teacherId: courseToEdit?.teacherId || 10, // Default to placeholder ID '10'
    status: courseToEdit?.status || CourseStatus.DRAFT,
  });

  const [availableSubjects, setAvailableSubjects] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    if (formData.grade && SUBJECTS[formData.grade]) {
      setAvailableSubjects(SUBJECTS[formData.grade]);
    } else {
      setAvailableSubjects([]);
    }
  }, [formData.grade]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const grade = e.target.value;
    // Reset dependent fields when grade changes
    setFormData({
      ...formData,
      grade,
      courseCode: '',
      courseName: '',
      courseType: CourseType.CORE, // Default back
    });
  };
  
  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const subject = availableSubjects.find(s => s.code === selectedCode);
    
    if (subject) {
      // Infer course type from the 4th character of the code ('1' for CORE, '2' for ADDITIONAL)
      const inferredType = selectedCode.charAt(3) === '1' ? CourseType.CORE : CourseType.ADDITIONAL;
      setFormData({ 
        ...formData, 
        courseCode: selectedCode, 
        courseName: subject.name,
        courseType: inferredType,
      });
    } else {
      // If user selects the placeholder, clear the info
      setFormData({
        ...formData,
        courseCode: '',
        courseName: '',
        courseType: CourseType.CORE,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Ensure teacherId is stored as a number
    if (name === 'teacherId') {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = (status: CourseStatus) => {
    // Validation checks
    if (!formData.grade || !formData.courseCode || !formData.courseName) {
        Swal.fire({
            title: 'ข้อมูลไม่ครบถ้วน',
            text: 'กรุณากรอกข้อมูลระดับชั้นและรหัสวิชาให้ครบถ้วน',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#0B3D91'
        });
        return;
    }
    if (formData.teacherId === 10) { // ID 10 is for the placeholder "เลือกรายชื่อครู"
        Swal.fire({
            title: 'ข้อมูลไม่ครบถ้วน',
            text: 'กรุณาเลือกครูผู้สอน',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#0B3D91'
        });
        return;
    }

    const finalCourse: Course = {
      ...formData,
      id: courseToEdit?.id || `c${Date.now()}`,
      status,
      lastSaved: new Date().toISOString(),
    };
    onSave(finalCourse, status);
  };
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-5xl mx-auto my-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{courseToEdit ? 'แก้ไข' : 'เพิ่ม'}ข้อมูลคำอธิบายรายวิชา</h2>
        <p className="text-gray-500 mb-8">กรุณากรอกข้อมูลให้ครบถ้วน</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label className="block text-gray-700 font-semibold mb-2">ระดับชั้น</label>
                <select name="grade" value={formData.grade} onChange={handleGradeChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition">
                    <option value="">-- เลือกระดับชั้น --</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 font-semibold mb-2">รหัสวิชา</label>
                <select name="courseCode" value={formData.courseCode} onChange={handleCourseCodeChange} disabled={!formData.grade} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition disabled:bg-gray-100">
                    <option value="">-- เลือกวิชา --</option>
                    {availableSubjects.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 font-semibold mb-2">ชื่อวิชา</label>
                <input type="text" value={formData.courseName} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"/>
            </div>
            <div>
                <label className="block text-gray-700 font-semibold mb-2">ประเภทวิชา</label>
                 <input type="text" value={formData.courseType} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"/>
            </div>
             <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">ครูผู้สอน</label>
                <select name="teacherId" value={formData.teacherId} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition">
                    {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
        </div>

        <div className="mb-6 p-4 border-2 border-dashed rounded-lg bg-gray-50">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">เนื้อหา</h3>
            <div className="bg-white p-6 shadow-inner" style={{ minHeight: '29.7cm' }}>
                 <label className="block text-gray-700 font-semibold mb-2">คำอธิบายรายวิชา</label>
                 <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={15}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition"
                    placeholder="คัดลอกหรือพิมพ์คำอธิบายรายวิชาที่นี่..."
                />
                
                {formData.courseType === CourseType.CORE ? (
                    <div className="mt-4">
                        <label className="block text-gray-700 font-semibold mb-2">มาตรฐานการเรียนรู้ / ตัวชี้วัด</label>
                        <textarea
                            name="standards"
                            value={formData.standards}
                            onChange={handleChange}
                            rows={8}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition"
                            placeholder="ระบุรหัสมาตรฐานและตัวชี้วัด (เช่น ต1.1, ต1.2)"
                        />
                    </div>
                ) : (
                    <div className="mt-4">
                         <label className="block text-gray-700 font-semibold mb-2">ผลการเรียนรู้</label>
                         <textarea
                            name="outcomes"
                            value={formData.outcomes}
                            onChange={handleChange}
                            rows={8}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition"
                            placeholder="กรอกผลการเรียนรู้ที่คาดหวัง"
                        />
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex justify-end space-x-4">
            <button onClick={onCancel} className="flex items-center bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition duration-300 shadow-md">
                <CancelIcon />
                ยกเลิก
            </button>
            <button onClick={() => handleSubmit(CourseStatus.DRAFT)} className="flex items-center bg-yellow-500 text-white py-2 px-6 rounded-lg hover:bg-yellow-600 transition duration-300 shadow-md">
                <SaveIcon />
                บันทึกชั่วคราว
            </button>
            <button onClick={() => handleSubmit(CourseStatus.SUBMITTED)} className="flex items-center bg-[#0B3D91] text-white py-2 px-6 rounded-lg hover:bg-[#09317a] transition duration-300 shadow-md">
                <SendIcon />
                ส่งข้อมูล
            </button>
        </div>
    </div>
  );
};

export default CourseForm;