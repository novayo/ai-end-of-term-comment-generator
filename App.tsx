import React, { useState, useCallback, useEffect } from 'react';
import StudentManager from './components/StudentManager';
import TraitSelector from './components/TraitSelector';
import ControlPanel from './components/ControlPanel';
import UsageGuide from './components/UsageGuide';
import { generateCommentAI, constructPrompt } from './services/geminiService';
import { CircleHelp } from 'lucide-react';

// Define the shape of the state we want to save per student
interface StudentState {
  traits: string[];
  styles: string[];
  wordLimit: number;
}

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  // UI State (Current View)
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(new Set());
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [wordLimit, setWordLimit] = useState(150);
  
  // Data State
  // Map of StudentString -> Comment
  const [comments, setComments] = useState<Record<string, string>>({});
  // Map of StudentString -> Settings (Traits, Styles, Limit)
  const [studentStates, setStudentStates] = useState<Record<string, StudentState>>({});
  
  // Temporary state to show the prompt preview instead of the actual comment
  const [tempPrompt, setTempPrompt] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal State
  const [isUsageOpen, setIsUsageOpen] = useState(false);

  // Load API Key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Handle API Key changes and persistence
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    if (key.trim()) {
      localStorage.setItem('geminiApiKey', key.trim());
    } else {
      localStorage.removeItem('geminiApiKey');
    }
  };

  // Helper to update the master record for the current student
  const updateStudentState = useCallback((student: string, traits: Set<string>, styles: Set<string>, limit: number) => {
    setStudentStates(prev => ({
      ...prev,
      [student]: {
        traits: Array.from(traits),
        styles: Array.from(styles),
        wordLimit: limit
      }
    }));
  }, []);

  const handleStudentSelect = useCallback((student: string | null) => {
    setSelectedStudent(student);
    setTempPrompt(null); // Clear any prompt preview when switching students
    
    if (student) {
      const savedState = studentStates[student];
      if (savedState) {
        // Restore saved state for this student
        setSelectedTraits(new Set(savedState.traits));
        setSelectedStyles(new Set(savedState.styles));
        setWordLimit(savedState.wordLimit);
      } else {
        // New student (or first time visiting): 
        // We CLEAR traits to start fresh, but we KEEP current styles/wordLimit 
        // to act as a "template" for the next student, improving workflow speed.
        setSelectedTraits(new Set());
        
        // Optionally, we could immediately initialize the state, but waiting for user input is fine.
      }
    } else {
      // Deselected
      setSelectedTraits(new Set());
    }
  }, [studentStates]);

  const handleToggleTrait = (trait: string) => {
    const newTraits = new Set(selectedTraits);
    if (newTraits.has(trait)) {
      newTraits.delete(trait);
    } else {
      newTraits.add(trait);
    }
    setSelectedTraits(newTraits);
    setTempPrompt(null); // Clear prompt if user changes settings
    
    // Persist immediately if a student is selected
    if (selectedStudent) {
      updateStudentState(selectedStudent, newTraits, selectedStyles, wordLimit);
    }
  };

  const handleDeleteTraitGlobal = (trait: string) => {
    // 1. Remove from current UI if selected
    if (selectedTraits.has(trait)) {
      const newTraits = new Set(selectedTraits);
      newTraits.delete(trait);
      setSelectedTraits(newTraits);
    }

    // 2. Clean up from all student records (database)
    setStudentStates(prev => {
      const nextStates: Record<string, StudentState> = {};
      let changed = false;
      
      Object.entries(prev).forEach(([studentId, val]) => {
        // Explicitly cast to StudentState to avoid 'unknown' type errors
        const state = val as StudentState;
        if (state.traits.includes(trait)) {
          nextStates[studentId] = {
            ...state,
            traits: state.traits.filter(t => t !== trait)
          };
          changed = true;
        } else {
          nextStates[studentId] = state;
        }
      });
      
      return changed ? nextStates : prev;
    });
  };

  const handleClearTraits = () => {
    const newTraits = new Set<string>();
    setSelectedTraits(newTraits);
    setTempPrompt(null);
    if (selectedStudent) {
      updateStudentState(selectedStudent, newTraits, selectedStyles, wordLimit);
    }
  };

  const handleToggleStyle = (style: string) => {
    const newStyles = new Set(selectedStyles);
    if (newStyles.has(style)) {
      newStyles.delete(style);
    } else {
      newStyles.add(style);
    }
    setSelectedStyles(newStyles);
    setTempPrompt(null);
    
    if (selectedStudent) {
      updateStudentState(selectedStudent, selectedTraits, newStyles, wordLimit);
    }
  };

  const handleSetWordLimit = (limit: number) => {
    setWordLimit(limit);
    setTempPrompt(null);
    if (selectedStudent) {
      updateStudentState(selectedStudent, selectedTraits, selectedStyles, limit);
    }
  };

  const validateInputs = () => {
    if (!selectedStudent) {
      alert('請先選擇學生！');
      return false;
    }
    if (selectedTraits.size === 0) {
      alert('請先選擇學生特質！');
      return false;
    }
    return true;
  };

  const handleShowPrompt = () => {
    if (!validateInputs()) return;
    
    const prompt = constructPrompt({
      studentName: selectedStudent!,
      traits: Array.from(selectedTraits),
      styles: Array.from(selectedStyles),
      wordLimit
    });
    setTempPrompt(prompt);
  };

  // Handle manual edits to the text area
  const handleTextChange = (newText: string) => {
    if (tempPrompt !== null) {
      // If viewing prompt, update prompt state
      setTempPrompt(newText);
    } else if (selectedStudent) {
      // If viewing comment, update comment state
      setComments(prev => ({
        ...prev,
        [selectedStudent]: newText
      }));
    }
  };

  const handleGenerate = async () => {
    if (!validateInputs()) return;
    if (!apiKey) {
      alert('請輸入 API Key！');
      return;
    }

    setIsGenerating(true);
    setTempPrompt(null); // Clear prompt preview to show loading/result
    
    try {
      const comment = await generateCommentAI({
        apiKey,
        studentName: selectedStudent!,
        traits: Array.from(selectedTraits),
        styles: Array.from(selectedStyles),
        wordLimit
      });
      
      setComments(prev => ({
        ...prev,
        [selectedStudent!]: comment
      }));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine what to show in the preview box: 
  // 1. The temp prompt if user asked for it
  // 2. The saved comment for the student
  // 3. Empty string
  const previewContent = tempPrompt !== null 
    ? tempPrompt 
    : (selectedStudent ? (comments[selectedStudent] || '') : '');

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans text-text-dark relative">
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-primary tracking-wide">AI 學生期末評語產生器</h1>
          <button 
            onClick={() => setIsUsageOpen(true)}
            className="text-stone-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-stone-100"
            title="使用說明"
          >
            <CircleHelp size={24} />
          </button>
        </div>
        <p className="text-gray-500 font-light">讓評語更有溫度，看見每個孩子的獨特光芒</p>
      </header>

      {/* Usage Guide Modal */}
      <UsageGuide isOpen={isUsageOpen} onClose={() => setIsUsageOpen(false)} />

      {/* Removed separate ApiKeyInput component */}

      <StudentManager 
        onSelectStudent={handleStudentSelect} 
        selectedStudent={selectedStudent}
        comments={comments}
      />

      <TraitSelector 
        selectedTraits={selectedTraits}
        onToggleTrait={handleToggleTrait}
        onClearTraits={handleClearTraits}
        onDeleteTrait={handleDeleteTraitGlobal}
        disabled={!selectedStudent}
      />

      <ControlPanel 
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        selectedStyles={selectedStyles}
        onToggleStyle={handleToggleStyle}
        wordLimit={wordLimit}
        onSetWordLimit={handleSetWordLimit}
        onGenerate={handleGenerate}
        onShowPrompt={handleShowPrompt}
        isGenerating={isGenerating}
        previewText={previewContent}
        onTextChange={handleTextChange}
        studentName={selectedStudent}
        isShowingPrompt={tempPrompt !== null}
      />
    </div>
  );
};

export default App;
