
export enum UserRole {
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
}

export enum CourseType {
  CORE = 'รายวิชาพื้นฐาน',
  ADDITIONAL = 'รายวิชาเพิ่มเติม',
}

export enum CourseStatus {
  DRAFT = 'บันทึกชั่วคราว',
  SUBMITTED = 'ส่งแล้ว',
}

export interface Course {
  id: string;
  grade: string;
  courseCode: string;
  courseName: string;
  courseType: CourseType;
  description: string;
  standards: string;
  outcomes: string;
  teacherId: number;
  status: CourseStatus;
  lastSaved: string;
}

export interface Teacher {
  id: number;
  name: string;
}
