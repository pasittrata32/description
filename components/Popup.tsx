
import React from 'react';

interface PopupProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const buttonColor = type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`relative ${bgColor} border-l-4 ${borderColor} ${textColor} p-8 rounded-lg shadow-xl w-full max-w-md mx-4`}>
        <div className="flex items-center">
            <i className={`fas ${icon} text-3xl mr-4`}></i>
            <div>
                <p className="font-bold text-lg">{type === 'success' ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด!'}</p>
                <p>{message}</p>
            </div>
        </div>
        <div className="text-right mt-6">
            <button onClick={onClose} className={`text-white font-bold py-2 px-6 rounded-lg transition duration-300 ${buttonColor}`}>
                ตกลง
            </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
