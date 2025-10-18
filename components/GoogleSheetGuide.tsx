import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface GoogleSheetGuideProps {
  onClose: () => void;
  onSave: (url: string) => void;
  currentUrl: string | null;
}

const appsScriptCode = `
const SHEET_NAME = "CourseData";
const HEADERS = ["id", "grade", "courseCode", "courseName", "courseType", "description", "standards", "outcomes", "teacherId", "status", "lastSaved"];

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function initializeSheet() {
  const sheet = getSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange("A1:K1").setFontWeight("bold");
  }
}

function doGet(e) {
  initializeSheet();
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  
  const result = data.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    initializeSheet();
    const sheet = getSheet();
    const requestData = JSON.parse(e.postData.contents);
    const { action, payload } = requestData;

    if (action === 'save') {
      const data = sheet.getDataRange().getValues();
      const rowIndex = data.findIndex(row => row[0] === payload.id); // Assuming ID is in the first column

      const newRow = HEADERS.map(header => payload[header]);

      if (rowIndex > -1) {
        // Update existing row
        sheet.getRange(rowIndex + 1, 1, 1, newRow.length).setValues([newRow]);
      } else {
        // Add new row
        sheet.appendRow(newRow);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved', id: payload.id }))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'delete') {
      const data = sheet.getDataRange().getValues();
      const rowIndex = data.findIndex(row => row[0] === payload.id);

      if (rowIndex > -1) {
        sheet.deleteRow(rowIndex + 1);
        return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Row deleted' }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
         return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Row not found' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

const GoogleSheetGuide: React.FC<GoogleSheetGuideProps> = ({ onClose, onSave, currentUrl }) => {
  const [url, setUrl] = useState(currentUrl || '');
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onSave(url);
    onClose();
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                เชื่อมต่อฐานข้อมูล Google Sheet
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <CloseIcon />
            </button>
        </div>
        <p className="text-gray-600 mb-6">
          ทำตามขั้นตอนง่ายๆ นี้เพื่อใช้ Google Sheet เป็นฐานข้อมูลสดสำหรับแอปพลิเคชัน
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ขั้นตอนที่ 1: สร้าง Google Sheet และ Apps Script</h3>
            <ol className="list-decimal list-inside text-gray-600 ml-4 space-y-1">
                <li>ไปที่ <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sheets.new</a> เพื่อสร้างชีตใหม่</li>
                <li>ไปที่ <code className="bg-gray-200 p-1 rounded">ส่วนขยาย (Extensions) &gt; Apps Script</code></li>
                <li>ลบโค้ดที่มีอยู่ทั้งหมดในไฟล์ <code className="bg-gray-200 p-1 rounded">Code.gs</code></li>
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ขั้นตอนที่ 2: คัดลอกและวางสคริปต์</h3>
            <p className="text-gray-600 mb-2">คัดลอกโค้ดด้านล่างและวางลงในตัวแก้ไข Apps Script</p>
            <div className="relative">
                <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{appsScriptCode}</code>
                </pre>
                <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm">
                    {copied ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}
                </button>
            </div>
             <p className="text-xs text-gray-500 mt-2">สคริปต์นี้จะสร้างชีตชื่อ "CourseData" และสร้างหัวตารางให้โดยอัตโนมัติหากยังไม่มี</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ขั้นตอนที่ 3: Deploy สคริปต์เป็น Web App</h3>
             <ol className="list-decimal list-inside text-gray-600 ml-4 space-y-1">
                <li>คลิกที่ปุ่ม <code className="bg-gray-200 p-1 rounded">Deploy</code> (สีฟ้า) &gt; <code className="bg-gray-200 p-1 rounded">New deployment</code></li>
                <li>คลิกที่ไอคอนรูปเฟือง (⚙️) และเลือก <code className="bg-gray-200 p-1 rounded">Web app</code></li>
                <li>ในช่อง <code className="bg-gray-200 p-1 rounded">Execute as</code>, เลือก <code className="bg-gray-200 p-1 rounded">Me</code></li>
                <li>ในช่อง <code className="bg-gray-200 p-1 rounded">Who has access</code>, เลือก <code className="bg-gray-200 p-1 rounded">Anyone</code> (สำคัญมาก!)</li>
                <li>คลิก <code className="bg-gray-200 p-1 rounded">Deploy</code>. ระบบจะขออนุญาต ให้คลิก <code className="bg-gray-200 p-1 rounded">Authorize access</code>, เลือกบัญชี Google ของคุณ, คลิก <code className="bg-gray-200 p-1 rounded">Advanced</code>, และ <code className="bg-gray-200 p-1 rounded">Go to ... (unsafe)</code> แล้วกด <code className="bg-gray-200 p-1 rounded">Allow</code></li>
                <li>คัดลอก <code className="bg-gray-200 p-1 rounded">Web app URL</code> ที่ได้</li>
            </ol>
          </div>

           <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ขั้นตอนที่ 4: เชื่อมต่อแอปพลิเคชัน</h3>
            <p className="text-gray-600 mb-2">วาง Web app URL ที่คัดลอกมาลงในช่องด้านล่างแล้วกดบันทึก</p>
            <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="วาง Web app URL ที่นี่..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D91] focus:border-[#0B3D91] transition"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
            <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition">
                ยกเลิก
            </button>
            <button onClick={handleSave} className="bg-[#0B3D91] text-white py-2 px-6 rounded-lg hover:bg-[#09317a] transition">
                บันทึกและเชื่อมต่อ
            </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetGuide;
