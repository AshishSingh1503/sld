import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Svg, Circle, Rect, Path, Ellipse, Line } from 'react-native-svg';

// --- Constants ---
const COLORS = {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  background: '#F5FCFF',
  card: '#FFFFFF',
  text: '#333333',
  lightText: '#777777',
  white: '#FFFFFF',
  correct: '#7ED321',
  incorrect: '#D0021B',
  elephant: '#8D99AE',
  feather: '#EAEAEA',
  sun: '#FDB813',
  giraffe: '#F0C27B',
  mouse: '#A4A4A4',
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: { 
    padding: 20 
  },
  header: { 
    paddingVertical: 20, 
    paddingHorizontal: 20, 
    marginBottom: 10 
  },
  headerTitle: { 
    fontSize: 34, 
    fontWeight: 'bold', 
    color: COLORS.text, 
    textAlign: 'center' 
  },
  card: { 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5 
  },
  cardIconContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(74, 144, 226, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 20 
  },
  cardIcon: { 
    fontSize: 30 
  },
  cardTextContainer: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
  cardDescription: { 
    fontSize: 14, 
    color: COLORS.lightText, 
    marginTop: 4 
  },
  button: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    elevation: 3 
  },
  disabledButton: { 
    backgroundColor: '#B0C4DE' 
  },
  buttonText: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  activityHeader: { 
    padding: 20, 
    backgroundColor: COLORS.card, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  instructionText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    textAlign: 'center' 
  },
  feedbackContainer: { 
    position: 'absolute', 
    bottom: 40, 
    left: 20, 
    right: 20, 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    zIndex: 10 
  },
  feedbackText: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  learnFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingBottom: 30 
  },
  measurementCanvas: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  measurementItem: {
    padding: 10,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 150,
    minHeight: 180,
    justifyContent: 'center',
  },
  measurementItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 10,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  }
});

const MEASUREMENT_CONCEPTS = [
  {
    concept: 'Heavy vs Light',
    items: [
      { id: 'elephant', name: 'Elephant', label: 'Heavy', Component: () => <Path d="M45,60 C40,80 20,85 15,75 C10,65 15,50 20,45 C25,40 30,20 50,25 C70,30 75,45 70,60 L90,75 L85,85 L65,70 C60,75 50,70 45,60 Z" fill={COLORS.elephant} />, scale: 1.2 },
      { id: 'feather', name: 'Feather', label: 'Light', Component: () => <Path d="M50,10 C20,40 30,70 50,90 C70,70 80,40 50,10 Z" fill={COLORS.feather} stroke="#ccc" strokeWidth="1" />, scale: 1.0 }
    ]
  },
  {
    concept: 'Big vs Small',
    items: [
      { id: 'sun', name: 'Sun', label: 'Big', Component: () => <Circle cx="50" cy="50" r="40" fill={COLORS.sun} />, scale: 1.5 },
      { id: 'apple', name: 'Apple', label: 'Small', Component: () => <Path d="M50,20 C65,20 70,35 70,50 C70,70 50,80 50,80 C50,80 30,70 30,50 C30,35 35,20 50,20 Z" fill="#ff4757" />, scale: 0.8 }
    ]
  },
  {
    concept: 'Tall vs Short',
    items: [
      { id: 'giraffe', name: 'Giraffe', label: 'Tall', Component: () => <Rect x="40" y="10" width="20" height="80" fill={COLORS.giraffe} />, scale: 1.2 },
      { id: 'mouse', name: 'Mouse', label: 'Short', Component: () => <Ellipse cx="50" cy="70" rx="20" ry="15" fill={COLORS.mouse} />, scale: 1.0 }
    ]
  },
];

const MEASUREMENT_QUESTIONS = [
  { question: 'Which is HEAVY?', items: MEASUREMENT_CONCEPTS[0].items.map(i => ({...i, isCorrect: i.label === 'Heavy'})) },
  { question: 'Which is LIGHT?', items: MEASUREMENT_CONCEPTS[0].items.map(i => ({...i, isCorrect: i.label === 'Light'})) },
  { question: 'Which is BIG?', items: MEASUREMENT_CONCEPTS[1].items.map(i => ({...i, isCorrect: i.label === 'Big'})) },
  { question: 'Which is SMALL?', items: MEASUREMENT_CONCEPTS[1].items.map(i => ({...i, isCorrect: i.label === 'Small'})) },
  { question: 'Which is TALL?', items: MEASUREMENT_CONCEPTS[2].items.map(i => ({...i, isCorrect: i.label === 'Tall'})) },
  { question: 'Which is SHORT?', items: MEASUREMENT_CONCEPTS[2].items.map(i => ({...i, isCorrect: i.label === 'Short'})) },
];

// --- Reusable Components ---
interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({ title, onPress, style, textStyle, disabled }) => (
  <TouchableOpacity style={[styles.button, style, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

interface ModuleCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  description: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, icon, onPress, description }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardIconContainer}>
      <Text style={styles.cardIcon}>{icon}</Text>
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

interface FeedbackIndicatorProps {
  message: string;
  type: 'correct' | 'incorrect';
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({ message, type }) => (
  <Animated.View style={[styles.feedbackContainer, { backgroundColor: type === 'correct' ? COLORS.correct : COLORS.incorrect }]}>
    <Text style={styles.feedbackText}>{message}</Text>
  </Animated.View>
);

// --- Learn Screen ---
const MeasurementLearnScreen: React.FC<{onBack?: () => void}> = ({ onBack }) => {
  const [conceptIndex, setConceptIndex] = useState(0);
  const currentConcept = MEASUREMENT_CONCEPTS[conceptIndex];

  const handleNext = () => setConceptIndex(prev => (prev + 1) % MEASUREMENT_CONCEPTS.length);
  const handlePrev = () => setConceptIndex(prev => (prev - 1 + MEASUREMENT_CONCEPTS.length) % MEASUREMENT_CONCEPTS.length);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.instructionText, { color: '#e67e22' }]}>{currentConcept.concept}</Text>
      </View>
      <View style={styles.measurementCanvas}>
        {currentConcept.items.map((item) => (
          <View key={item.id} style={styles.measurementItem}>
            <Svg height="120" width="120" viewBox="0 0 100 100">
              <item.Component />
            </Svg>
            <Text style={styles.measurementItemName}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.learnFooter}>
        <AppButton title="⬅️ Previous" onPress={handlePrev} />
        <AppButton title="Next ➡️" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
};

// --- Test Screen ---
const MeasurementTestScreen: React.FC<{onBack?: () => void}> = ({ onBack }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);
  const [shuffledItems, setShuffledItems] = useState(MEASUREMENT_QUESTIONS[0].items);

  const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  React.useEffect(() => {
    setShuffledItems(shuffleArray(MEASUREMENT_QUESTIONS[questionIndex].items));
  }, [questionIndex]);
  
  const handleNextQuestion = () => {
    setFeedback(null);
    setQuestionIndex(prev => (prev + 1) % MEASUREMENT_QUESTIONS.length);
  };

  const checkAnswer = (item: any) => {
    if (feedback) return;

    if (item.isCorrect) {
      setFeedback({ type: 'correct', message: 'Awesome!' });
      setTimeout(handleNextQuestion, 1500);
    } else {
      setFeedback({ type: 'incorrect', message: 'Let\'s try another one!' });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const currentQuestion = MEASUREMENT_QUESTIONS[questionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.instructionText, { color: '#e67e22' }]}>{currentQuestion.question}</Text>
      </View>
      <View style={styles.measurementCanvas}>
        {shuffledItems.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => checkAnswer(item)} disabled={!!feedback}>
            <View style={[styles.measurementItem, { transform: [{ scale: item.scale }] }]}>
              <Svg height="120" width="120" viewBox="0 0 100 100">
                <item.Component />
              </Svg>
              <Text style={styles.measurementItemName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
    </SafeAreaView>
  );
};

// --- Main Screen ---
const MeasurementScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'learn' | 'test'>('main');

  if (currentScreen === 'learn') {
    return <MeasurementLearnScreen onBack={() => setCurrentScreen('main')} />;
  }

  if (currentScreen === 'test') {
    return <MeasurementTestScreen onBack={() => setCurrentScreen('main')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Measurement 📏</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ModuleCard 
          title="Learn Measurement" 
          icon="📖" 
          description="Big, Small, Heavy, Light..." 
          onPress={() => setCurrentScreen('learn')} 
        />
        <ModuleCard 
          title="Test Your Knowledge" 
          icon="🧠" 
          description="Which one is bigger or smaller?" 
          onPress={() => setCurrentScreen('test')} 
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MeasurementScreen;