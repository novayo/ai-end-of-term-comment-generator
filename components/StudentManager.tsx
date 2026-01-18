import React, { useState, useEffect, useRef } from 'react';
import { Users, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface StudentManagerProps {
  onSelectStudent: (student: string | null) => void;
  selectedStudent: string | null;
  comments: Record<string, string>;
}

const StudentManager: React.FC<StudentManagerProps> = ({ 
  onSelectStudent, 
  selectedStudent,
  comments 
}) => {
  const [inputText, setInputText] = useState('');
  const [students, setStudents] = useState<string[]>([]);
  
  // Sticky Header State
  const [isSticky, setIsSticky] = useState(false);
  const [isStickyExpanded, setIsStickyExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedList = localStorage.getItem('studentList');
    if (savedList) {
      setInputText(savedList);
      parseStudents(savedList);
    }

    // Intersection Observer to detect when the manager is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only when element is not intersecting AND we've scrolled past it (top is negative)
        setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        // Collapse the list when we scroll back up to the original view
        if (entry.isIntersecting) {
          setIsStickyExpanded(false);
        }
      },
      { threshold: 0.1 } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const parseStudents = (text: string) => {
    const list = text.split('\n')
      .filter(line => line.trim().length > 0)
      .map((line, index) => {
        const num = (index + 1).toString().padStart(2, '0');
        const cleanName = line.replace(/^[\d]+[.\s]*/, '').trim();
        return `${num}.${cleanName}`;
      });
    setStudents(list);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    
    // Real-time save and parse
    localStorage.setItem('studentList', newText);
    parseStudents(newText);
  };

  // Shared Button Renderer
  const renderStudentButton = (student: string, idx: number, isSmall: boolean = false) => {
    const isSelected = selectedStudent === student;
    const hasComment = !!comments[student];
    
    return (
      <button
        key={idx}
        onClick={() => {
          onSelectStudent(student);
          if (isSmall) setIsStickyExpanded(false); // Close dropdown on selection in sticky mode
        }}
        className={`
          relative rounded-lg transition-all font-medium border whitespace-nowrap
          ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          ${isSelected 
            ? 'bg-primary text-white border-primary shadow-md' 
            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-selected hover:text-primary hover:border-selected'
          }
          ${hasComment && !isSelected ? 'ring-2 ring-primary ring-opacity-30 bg-selected border-selected' : ''}
        `}
      >
        {student}
        {hasComment && (
          <span className={`absolute bg-white rounded-full ${isSmall ? '-top-1 -right-1' : '-top-1 -right-1'}`}>
            <CheckCircle className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} fill="currentColor" stroke="white" />
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Main Container */}
      <div ref={containerRef} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-6 relative">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
          <Users className="w-5 h-5" />
          學生清單
        </h3>
        
        <div className="mb-4">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full h-32 p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y bg-stone-50 text-text-dark text-sm placeholder-stone-400"
            placeholder={`一行一個學生姓名\n\n範例：\n學生1\n學生2\n學生3`}
          />
        </div>

        {students.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-stone-100">
            {students.map((student, idx) => renderStudentButton(student, idx))}
          </div>
        )}
      </div>

      {/* Sticky Top Bar */}
      {isSticky && students.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-fade-in-down shadow-md">
          {/* Header Bar */}
          <div className="bg-white/95 backdrop-blur-sm border-b border-stone-200 px-4 py-3 flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">
                目前學生
              </span>
              <span className={`text-base font-bold ${selectedStudent ? 'text-primary' : 'text-stone-400'}`}>
                {selectedStudent || '尚未選擇'}
              </span>
            </div>

            <button 
              onClick={() => setIsStickyExpanded(!isStickyExpanded)}
              className="flex items-center gap-1 text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <Users size={14} />
              {isStickyExpanded ? '收起清單' : '切換學生'}
              {isStickyExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Expanded List Dropdown */}
          {isStickyExpanded && (
            <div className="bg-white/95 backdrop-blur-sm border-b border-stone-200 max-h-[60vh] overflow-y-auto">
              <div className="max-w-6xl mx-auto p-4 flex flex-wrap gap-2 shadow-inner">
                {students.map((student, idx) => renderStudentButton(student, idx, true))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentManager;