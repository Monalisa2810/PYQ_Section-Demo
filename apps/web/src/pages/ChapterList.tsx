import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, 
  SearchOutlined, 
  RightOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';

interface Chapter {
  id: number;
  title: string;
  status: 'completed' | 'in-progress' | 'not-started';
  progress: number; // 0-100
}

const chaptersData: Chapter[] = [
  { id: 1, title: 'The Living World', status: 'completed', progress: 100 },
  { id: 2, title: 'Biological Classification', status: 'in-progress', progress: 90 },
  { id: 3, title: 'Plant Kingdom', status: 'not-started', progress: 0 },
  { id: 4, title: 'Animal Kingdom', status: 'not-started', progress: 0 },
  { id: 5, title: 'Morphology of Flowering Plants', status: 'not-started', progress: 0 },
  { id: 6, title: 'Anatomy of Flowering Plants', status: 'not-started', progress: 0 },
  { id: 7, title: 'Structural Organisation in Animals', status: 'not-started', progress: 0 },
  { id: 8, title: 'Cell: The Unit of Life', status: 'not-started', progress: 0 },
  { id: 9, title: 'Biomolecules', status: 'not-started', progress: 0 },
  { id: 10, title: 'Cell Cycle and Cell Division', status: 'not-started', progress: 0 },
];

const tabs = ['Chapters', 'NCERT', 'Notes', 'PYQs', 'Tests'];

export default function ChapterList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Chapters');

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans max-w-md mx-auto shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="text-gray-800 p-2 -ml-2" aria-label="Go back">
          <ArrowLeftOutlined className="text-lg" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1 text-center">Biology</h1>
        <button className="text-gray-800 p-2 -mr-2" aria-label="Search">
          <SearchOutlined className="text-xl" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky z-10" style={{ top: '60px' }}>
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 whitespace-nowrap text-sm font-semibold transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-[#00A859] border-b-2 border-[#00A859]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto bg-white pb-24">
        {chaptersData.map((chapter) => (
          <div 
            key={chapter.id} 
            className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Number Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              chapter.status === 'completed' 
                ? 'bg-[#E5F6EE] text-[#00A859]' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {chapter.id}
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <h2 className={`text-[15px] font-semibold ${chapter.status === 'completed' ? 'text-gray-900' : 'text-gray-700'}`}>
                {chapter.title}
              </h2>
              <div className="flex items-center mt-1">
                <span className={`text-xs ${
                  chapter.status === 'completed' ? 'text-[#00A859]' :
                  chapter.status === 'in-progress' ? 'text-gray-500' :
                  'text-gray-400'
                }`}>
                  {chapter.status === 'completed' ? '100% Completed' :
                   chapter.status === 'in-progress' ? `${chapter.progress}% Completed` :
                   'Not Started'}
                </span>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center ml-2 shrink-0 text-gray-400">
              {chapter.status === 'completed' && (
                <CheckCircleFilled className="text-[#00A859] text-base mr-3" />
              )}
              <RightOutlined className="text-xs" />
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-4 pointer-events-none">
        <button className="w-full bg-[#00A859] hover:bg-[#00904a] text-white font-semibold py-3.5 rounded-full shadow-lg shadow-green-200 transition-all active:scale-95 pointer-events-auto">
          Continue Learning
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
