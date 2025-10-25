// WritingPracticeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';
import NotesPracticeScreen from './NotesPracticeScreen';
import { contentService } from '../../services/contentService';
import { userService } from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

// Import JSON files directly
import class1Data from '../../assets/class1.json';
import class2Data from '../../assets/class2.json';
import class3Data from '../../assets/class3.json';
import class4Data from '../../assets/class4.json';
import class5Data from '../../assets/class5.json';

type DigitalInkCanvasRef = {
  getRecognitionResult?: () => string;
  clear: () => void;
};

interface WritingPracticeScreenProps {
  onBack?: () => void;
}

const WritingPracticeScreen: React.FC<WritingPracticeScreenProps> = ({ onBack }) => {
  const [practiceType, setPracticeType] = useState<'word' | 'sentence'>('word');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [recognitionOn, setRecognitionOn] = useState(true);
  const [userClass, setUserClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<DigitalInkCanvasRef>(null);
  const [recognitionResult, setRecognitionResult] = useState<string>('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tryAgainVisible, setTryAgainVisible] = useState(false);
  const [tryAgainMessage, setTryAgainMessage] = useState('');

  useEffect(() => {
    loadUserClassAndContent();
  }, []);

  const loadUserClassAndContent = async () => {
    try {
      setLoading(true);
      const classNumber = await userService.getUserClass();
      setUserClass(classNumber);

      // Load class-specific content
      let classWords: string[] = [];
      let classSentences: string[] = [];

      if (classNumber && classNumber >= 1 && classNumber <= 5) {
        switch (classNumber) {
          case 1:
            classWords = (class1Data as any).words || [];
            classSentences = (class1Data as any).sentences || [];
            break;
          case 2:
            classWords = (class2Data as any).words || [];
            classSentences = (class2Data as any).sentences || [];
            break;
          case 3:
            classWords = (class3Data as any).words || [];
            classSentences = (class3Data as any).sentences || [];
            break;
          case 4:
            classWords = (class4Data as any).words || [];
            classSentences = (class4Data as any).sentences || [];
            break;
          case 5:
            classWords = (class5Data as any).words || [];
            classSentences = (class5Data as any).sentences || [];
            break;
        }
      }

      setWords(contentService.getRandomItems(classWords, 20)); // Get 20 random words
      setSentences(contentService.getRandomItems(classSentences, 20)); // Get 20 random sentences
    } catch (error) {
      console.error('Error loading class content:', error);
      Alert.alert('Error', 'Failed to load content for your class.');
    } finally {
      setLoading(false);
    }
  };

  const currentPractice = practiceType === 'word' ? (words[currentWordIndex] || '') : (sentences[currentWordIndex] || '');

  const handleRecognitionResult = (candidates: any[]) => {
    setRecognitionResult(candidates[0]?.text || '');
  };

  function normalize(str: string) {
    return str
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') // remove punctuation
      .replace(/\s{2,}/g, ' ') // collapse multiple spaces
      .trim()
      .toLowerCase();
  }

  const handleCheck = async () => {
    if (!recognitionResult) {
      setTryAgainMessage('Recognition is turned off or no result found.');
      setTryAgainVisible(true);
      return;
    }

    if (normalize(recognitionResult) === normalize(currentPractice)) {
      setSuccessMessage(`You wrote "${currentPractice}" correctly.`);
      setSuccessVisible(true);
      goToNext();
    } else {
      setTryAgainMessage(`Recognized: ${recognitionResult}\nExpected: ${currentPractice}`);
      setTryAgainVisible(true);
    }
  };

  const goToNext = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setCurrentWordIndex(prev => (prev + 1) % (practiceType === 'word' ? words.length : sentences.length));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your class content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, padding: 8 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
      )}
      
      {/* Class Info */}
      {userClass && (
        <View style={styles.classInfoContainer}>
          <Text style={styles.classInfoText}>Class {userClass} - {practiceType === 'word' ? 'Words' : 'Sentences'}</Text>
        </View>
      )}
      
      {/* Icon button for type/level selection */}
      <TouchableOpacity onPress={() => setShowTypeModal(true)} style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 8 }}>
        <Ionicons name="options-outline" size={28} color="#007AFF" />
      </TouchableOpacity>
      
      <NotesPracticeScreen
        ref={canvasRef}
        onBack={onBack}
        onRecognitionResult={handleRecognitionResult}
        practiceText={currentPractice}
      />

      <View style={styles.buttonRow}>
  <TouchableOpacity 
    style={styles.orangeButton} 
    onPress={handleCheck}
  >
    <Text style={styles.buttonText}>Check</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={styles.orangeButton} 
    onPress={() => canvasRef.current?.clear()}
  >
    <Text style={styles.buttonText}>Clear</Text>
  </TouchableOpacity>
</View>

      {/* Modal for selecting type and level */}
      {showTypeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.typeModal}>
            <Text style={styles.modalTitle}>Select Practice Type</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
              <TouchableOpacity
                style={[styles.typeButton, practiceType === 'word' && styles.typeButtonSelected]}
                onPress={() => setPracticeType('word')}
              >
                <Text style={[styles.typeButtonText, practiceType === 'word' && styles.typeButtonTextSelected]}>Word</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, practiceType === 'sentence' && styles.typeButtonSelected]}
                onPress={() => setPracticeType('sentence')}
              >
                <Text style={[styles.typeButtonText, practiceType === 'sentence' && styles.typeButtonTextSelected]}>Sentence</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowTypeModal(false)} style={{ marginTop: 12 }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {successVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setSuccessVisible(false)}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {tryAgainVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.tryAgainModal}>
            <Text style={styles.tryAgainTitle}>Try Again</Text>
            <Text style={styles.tryAgainText}>{tryAgainMessage}</Text>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => setTryAgainVisible(false)}
            >
              <Text style={styles.tryAgainButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default WritingPracticeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: 24,
    color: '#9a3412',
    textAlign: 'center',
  },
  classInfoContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  classInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center'
  },
  levelSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  levelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  levelButtonSelected: {
    backgroundColor: '#007AFF'
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold'
  },
   
  buttonRow: {
    position: 'absolute',
    right: 20,
    top: '40%',
    flexDirection: 'column',
    gap: 16, // increased gap between buttons
  },
  orangeButton: {
    backgroundColor: '#FF9500', // orange color
    paddingVertical: 12, // increased height
    paddingHorizontal: 24, // increased width
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18, // increased font size
    fontWeight: 'bold',
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
  typeModal: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeButton: {
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
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#005BBB',
  },
  typeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  successModal: {
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
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  successButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  successButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tryAgainModal: {
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
  tryAgainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 12,
  },
  tryAgainText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
