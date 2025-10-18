import React, { useState } from 'react';
import { BookIcon } from './Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(username, password)) {
      setError('');
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B3D91] to-[#062a68] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in-up">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <span className="p-3 bg-blue-100 text-[#0B3D91] rounded-full">
                <BookIcon />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบผู้ดูแลระบบ</h1>
          <p className="text-gray-500">สำหรับจัดการข้อมูลในระบบ</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91]"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91]"
              placeholder="Password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0B3D91] hover:bg-[#09317a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3D91] transition-transform transform hover:scale-105"
            >
              เข้าสู่ระบบ
            </button>
             <button
              type="button"
              onClick={onCancel}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              กลับ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;