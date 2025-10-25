import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  PanResponder,
} from 'react-native';
import { DigitalInkCanvas } from '../features/DigitalInkCanvas';
import { RecognitionCandidate } from '../../modules/digital-ink-recognition/src/DigitalInkRecognition';
import { Toolbar, ToolKey } from '../features/Toolbar';
import { Ionicons } from '@expo/vector-icons';
import type { InsertedShape } from '../features/DigitalInkCanvas';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'text' | 'handwritten';
}

interface NotesPracticeScreenProps {
  initialNotes?: Note[];
  onBack?: () => void;
  onNoteChange?: (note: string) => void;
  onRecognitionResult?: (candidates: RecognitionCandidate[]) => void;
  practiceText?: string;
}

const NotesPracticeScreen = forwardRef<{ clear: () => void }, NotesPracticeScreenProps>(({ initialNotes = [], onBack, onNoteChange, onRecognitionResult, practiceText }, ref) => {
  const [activeTool, setActiveTool] = useState<ToolKey | undefined>(undefined);
  const [recognitionResults, setRecognitionResults] = useState<RecognitionCandidate[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [recognitionEnabled, setRecognitionEnabled] = useState(false);
  const [recognitionMode, setRecognitionMode] = useState<'alphabet' | 'words'>('words');
  const [pageLayout, setPageLayout] = useState<{ layout: 'blank' | 'ruled' | 'grid' | 'dot', density: number, lineWidth: number }>({ layout: 'blank', density: 40, lineWidth: 1 });
  const undoRef = useRef<(() => void) | undefined>(undefined);
  const redoRef = useRef<(() => void) | undefined>(undefined);
  const clearRef = useRef<(() => void) | undefined>(undefined);
  const [insertedShape, setInsertedShape] = useState<InsertedShape | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [showPageNumber, setShowPageNumber] = useState(false);
  const pageNumberTimeout = useRef<NodeJS.Timeout | null>(null);
  const [autoAlignText, setAutoAlignText] = useState(false);
  const [wordGapMs, setWordGapMs] = useState(1200);
  const [pendingText, setPendingText] = useState('');
  const lastRecognizedRef = useRef('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [practiceType, setPracticeType] = useState<'word' | 'sentence'>('word');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [penColor, setPenColor] = useState('#222');
  const [penWidth, setPenWidth] = useState(3);

  // Multi-page state: initialize from initialNotes if possible
  let initialPages: Array<{ strokes: any[] }> = [{ strokes: [] }];
  if (initialNotes.length > 0 && initialNotes[0].content) {
    try {
      const parsed = JSON.parse(initialNotes[0].content);
      if (Array.isArray(parsed)) {
        initialPages = parsed.map(strokes => ({ strokes: Array.isArray(strokes) ? strokes : [] }));
      }
    } catch (e) {
      // fallback to blank page
    }
  }
  const [pages, setPages] = useState<Array<{ strokes: any[] }>>(initialPages);
  const [currentPage, setCurrentPage] = useState(0);

  // PanResponder for swipe navigation
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -40 && currentPage < pages.length - 1) {
          setCurrentPage(currentPage + 1);
          setShowPageNumber(true);
          if (pageNumberTimeout.current) clearTimeout(pageNumberTimeout.current);
          pageNumberTimeout.current = setTimeout(() => setShowPageNumber(false), 1000);
        } else if (gestureState.dx > 40 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
          setShowPageNumber(true);
          if (pageNumberTimeout.current) clearTimeout(pageNumberTimeout.current);
          pageNumberTimeout.current = setTimeout(() => setShowPageNumber(false), 1000);
        }
      },
    })
  ).current;

  // Handler for updating strokes of the current page
  const handleSetStrokes = (strokes: any[]) => {
    setPages(prevPages => prevPages.map((page, idx) => idx === currentPage ? { ...page, strokes } : page));
  };

  // Navigation handlers
  const goToPrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };
  const addPage = () => {
    setPages(prev => [...prev, { strokes: [] }]);
    setCurrentPage(pages.length);
  };

  const handleToolSelect = (tool: ToolKey) => {
    setActiveTool(tool);
    // If shapes tool is selected, ensure pen is off (activeTool is 'shapes')
    // No extra logic needed, as DigitalInkCanvas uses activeTool to determine pen/shape mode
  };

  const handleUndo = () => {
    if (undoRef.current) undoRef.current();
  };

  const handleRedo = () => {
    if (redoRef.current) redoRef.current();
  };

  const handleClear = () => {
    if (clearRef.current) clearRef.current();
    setInsertedShape(null);
  };

  const handleRecognitionResult = (candidates: RecognitionCandidate[]) => {
    setRecognitionResults(candidates);
  };

  const handleShapeInsert = (shape: InsertedShape['type']) => {
    setInsertedShape({ type: shape, x: 100, y: 100, width: 120, height: 120 });
  };

  const handleContentChange = (content: string) => {
    setNoteContent(content);
    if (onNoteChange) onNoteChange(content);
  };

  // Add a handler to insert a space in alphabet mode
  const handleInsertSpace = () => {
    setPendingText(prev => prev + ' ');
  };

  // When recognition result comes in, append only the new character(s) to pendingText in alphabet mode
  useEffect(() => {
    if (recognitionMode === 'alphabet' && recognitionResults.length > 0) {
      const newText = recognitionResults[0].text;
      const lastText = lastRecognizedRef.current;
      if (newText && newText.length > lastText.length) {
        const diff = newText.slice(lastText.length);
        setPendingText(prev => prev + diff);
      }
      lastRecognizedRef.current = newText;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognitionResults]);

  // Reset pendingText and lastRecognizedRef when switching modes or clearing
  useEffect(() => {
    setPendingText('');
    lastRecognizedRef.current = '';
  }, [recognitionMode, clearRef]);

  useEffect(() => {
    if (activeTool !== 'pen') {
      setInsertedShape(null);
    }
  }, [activeTool]);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('digitalInkApp:recognitionSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          if (typeof settings.recognitionEnabled === 'boolean') setRecognitionEnabled(settings.recognitionEnabled);
          if (typeof settings.recognitionMode === 'string') setRecognitionMode(settings.recognitionMode);
          if (typeof settings.wordGapMs === 'number') setWordGapMs(settings.wordGapMs);
          if (typeof settings.autoAlignText === 'boolean') setAutoAlignText(settings.autoAlignText);
        }
      } catch (e) { console.warn('Failed to load recognition settings', e); }
    })();
  }, []);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const settings = {
      recognitionEnabled,
      recognitionMode,
      wordGapMs,
      autoAlignText,
    };
    AsyncStorage.setItem('digitalInkApp:recognitionSettings', JSON.stringify(settings)).catch(() => {});
  }, [recognitionEnabled, recognitionMode, wordGapMs, autoAlignText]);

  const canvasInnerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      canvasInnerRef.current?.clear();
    },
  }));

  return (
    <View style={styles.container}>
      <Toolbar
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onShapeInsert={handleShapeInsert}
        onPageLayoutChange={setPageLayout}
        onOpenSettings={() => setSettingsVisible(true)}
        onBack={onBack}
        hiddenTools={["shapes", "table", "highlighter", "lasso", "text"]}
        {...(practiceText ? { onOpenTypeLevelModal: () => setShowTypeModal(true) } : {})}
        penColor={penColor}
        onPenColorChange={setPenColor}
        penWidth={penWidth}
        onPenWidthChange={setPenWidth}
      />
      <View>
        {practiceText && (
          <View style={styles.practiceWordContainer}>
            <Text style={styles.practiceWordLabel}>Write this:</Text>
            <Text style={styles.practiceWord}>{practiceText}</Text>
          </View>
        )}
      </View>
      
      
      {/* Page number overlay */}
      {showPageNumber && (
        <View style={styles.pageNumberOverlay} pointerEvents="none">
          <Text style={styles.pageNumberText}>Page {currentPage + 1} / {pages.length}</Text>
        </View>
      )}
      {/* Main Content: Digital Ink Canvas with gesture navigation */}
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <DigitalInkCanvas
          languageTag="en-US"
          onRecognitionResult={(candidates) => {
            setRecognitionResults(candidates);
            if (onRecognitionResult) onRecognitionResult(candidates);
          }}
          undoRef={undoRef}
          redoRef={redoRef}
          clearRef={clearRef}
          eraserActive={activeTool === 'eraser'}
          recognitionEnabled={recognitionEnabled}
          recognitionMode={recognitionMode}
          wordGapMs={wordGapMs}
          insertedShape={insertedShape}
          setInsertedShape={setInsertedShape}
          activeTool={activeTool}
          pageLayout={pageLayout}
          strokes={pages[currentPage].strokes}
          setStrokes={handleSetStrokes}
          autoAlignText={autoAlignText}
          ref={canvasInnerRef}
          penColor={penColor}
          penWidth={penWidth}
        />
      </View>
      {/* Settings Modal */}
      {settingsVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Recognition</Text>
              <TouchableOpacity
                style={[styles.switchPill, recognitionEnabled && styles.switchPillActive]}
                onPress={() => setRecognitionEnabled(v => !v)}
                activeOpacity={0.8}
              >
                <Text style={[styles.switchPillText, recognitionEnabled && styles.switchPillTextActive]}>
                  {recognitionEnabled ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* Modal for selecting type and level */}
      {showTypeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <Text style={styles.settingsTitle}>Select Practice Type</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
              <TouchableOpacity
                style={[styles.modeButton, practiceType === 'word' && styles.modeButtonActive]}
                onPress={() => setPracticeType('word')}
              >
                <Text style={[styles.modeButtonText, practiceType === 'word' && styles.modeButtonTextActive]}>Word</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, practiceType === 'sentence' && styles.modeButtonActive]}
                onPress={() => setPracticeType('sentence')}
              >
                <Text style={[styles.modeButtonText, practiceType === 'sentence' && styles.modeButtonTextActive]}>Sentence</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.settingsTitle}>Select Level</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
              {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.modeButton, level === lvl && styles.modeButtonActive]}
                  onPress={() => setLevel(lvl)}
                >
                  <Text style={[styles.modeButtonText, level === lvl && styles.modeButtonTextActive]}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowTypeModal(false)} style={{ marginTop: 12 }}>
              <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

export default NotesPracticeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mainContent: {
    flexDirection: 'row',
    flex: 1,
  },
  notesPanel: {
    width: screenWidth * 0.3, // Narrower for landscape
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    backgroundColor: 'white',
  },
  panelHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notesList: {
    padding: 10,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedNoteCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteType: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
  },
  detailPanel: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  noteDetail: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 12,
    marginBottom: 15,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailType: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  detailDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailContent: {
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  editButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  editButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noSelection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noSelectionIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noSelectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noSelectionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  noteContentContainer: {
    flex: 1,
    padding: 25,
  },
  handwrittenContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  recognitionPreview: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  recognitionPreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recognitionPreviewText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  settingsModal: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#333',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#333',
  },
  switchPill: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  switchPillActive: {
    backgroundColor: '#4CAF50',
  },
  switchPillText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  switchPillTextActive: {
    color: '#fff',
  },
  modeButton: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 8,
    marginHorizontal: 0,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#388e3c',
  },
  modeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    marginLeft: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
  pageNumberOverlay: {
    position: 'absolute',
    left: 24,
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    zIndex: 200,
  },
  pageNumberText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  practiceWordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 74,
    backgroundColor: '#fffbe6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: 'auto',
  },
  practiceWordLabel: {
    fontSize: 25,
    color: '#FF9500',
    fontWeight: 'bold',
    marginRight: 10,
  },
  practiceWord: {
    fontSize: 32,
    color: '#333',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  optionsButton: {
    marginLeft: 8,
    padding: 6,
    alignSelf: 'center',
  },
}); 