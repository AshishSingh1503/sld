import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
// This module avoids nesting a NavigationContainer. It uses local state to switch screens.
import { Svg, Circle, Path } from 'react-native-svg';

// --- Local navigation props ---
type NumbersHubProps = {
  onStartLearn: () => void;
  onStartTest: () => void;
  onStartCollection: () => void;
  onStartLearnAddition: () => void;
  onStartTestAddition: () => void;
  onStartLearnSubtraction: () => void;
  onStartTestSubtraction: () => void;
};

type ScreenProps = {
    onBack?: () => void;
};


// --- Constants ---
const COLORS = {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  background: '#F5FCFF',
  card: '#FFFFFF',
  text: '#333333',
  lightText: '#777777',
  correct: '#7ED321',
  incorrect: '#D0021B',
  white: '#FFFFFF',
  appleRed: '#ff4757',
  appleStem: '#8B4513',
  selectedTint: 'rgba(74, 144, 226, 0.3)',
};

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

// --- SVG Components ---
const AppleIcon: React.FC<{isCrossedOut?: boolean}> = ({ isCrossedOut = false }) => (
    <Svg height="60" width="60" viewBox="0 0 100 100">
        <Path d="M85,40 C85,65 70,85 50,85 C30,85 15,65 15,40 C15,20 30,15 50,15 C70,15 85,20 85,40 Z" fill={COLORS.appleRed} opacity={isCrossedOut ? 0.3 : 1} />
        <Path d="M50,15 C55,5 70,5 70,15" stroke={COLORS.appleStem} strokeWidth="5" fill="none" opacity={isCrossedOut ? 0.3 : 1} />
        {isCrossedOut && <Path d="M25 25 L75 75" stroke={COLORS.incorrect} strokeWidth="8" strokeLinecap="round" />}
    </Svg>
);


// --- Numbers Module Screens ---

// 1. Numbers Hub Screen
const NumbersScreen: React.FC<NumbersHubProps> = ({ onStartLearn, onStartTest, onStartCollection, onStartLearnAddition, onStartTestAddition, onStartLearnSubtraction, onStartTestSubtraction }) => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Numbers 🔢</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <ModuleCard title="Learn Numbers" icon="📖" description="See numbers with objects 1–9." onPress={onStartLearn} />
          <ModuleCard title="Test: Count Objects" icon="🧪" description="How many objects do you see?" onPress={onStartTest} />
          <ModuleCard title="Make a Collection" icon="🧺" description="Select the correct number of objects." onPress={onStartCollection} />
          <ModuleCard title="Learn Addition" icon="➕" description="Learn how to add two numbers." onPress={onStartLearnAddition} />
          <ModuleCard title="Test Addition" icon="✏️" description="Solve addition problems." onPress={onStartTestAddition} />
          <ModuleCard title="Learn Subtraction" icon="➖" description="Learn how to subtract numbers." onPress={onStartLearnSubtraction} />
          <ModuleCard title="Test Subtraction" icon="🤔" description="Solve subtraction problems." onPress={onStartTestSubtraction} />
      </ScrollView>
    </SafeAreaView>
);

// 2. Learn Numbers Screen
const NumbersLearnScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [index, setIndex] = useState(0); // 0..8 -> number = index+1
  const currentNumber = index + 1;

  const next = () => setIndex(prev => (prev + 1) % 9);
  const prev = () => setIndex(prev => (prev - 1 + 9) % 9);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.instructionText, { color: '#16a085' }]}>This is {currentNumber}</Text>
      </View>

      <View style={styles.countingCanvas}>
        {Array.from({ length: currentNumber }).map((_, i) => (
          <View key={i} style={styles.objectWrapper}><AppleIcon /></View>
        ))}
      </View>

      <View style={styles.optionsFooter}>
        <AppButton title="⬅️ Prev" onPress={prev} />
        <View>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: COLORS.primary }}>{currentNumber}</Text>
        </View>
        <AppButton title="Next ➡️" onPress={next} />
      </View>
    </SafeAreaView>
  );
};

// 3. Test Numbers Screen (Count what you see)
const NumbersTestScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [correctNumber, setCorrectNumber] = useState(0);
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

    const generateNewQuestion = () => {
        const newCorrectNumber = Math.floor(Math.random() * 9) + 1;
        setCorrectNumber(newCorrectNumber);
        const otherOptions: number[] = [];
        while (otherOptions.length < 2) {
            const randomOption = Math.floor(Math.random() * 9) + 1;
            if (randomOption !== newCorrectNumber && !otherOptions.includes(randomOption)) {
                otherOptions.push(randomOption);
            }
        }
        setOptions(shuffleArray([newCorrectNumber, ...otherOptions]));
    };

    useEffect(() => {
        generateNewQuestion();
    }, []);

    const handleAnswer = (selectedNumber: number) => {
        if (feedback) return;
        if (selectedNumber === correctNumber) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Try Again!' });
            setTimeout(() => { setFeedback(null); }, 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              {onBack && (
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.instructionText, { color: '#2980b9' }]}>How many apples do you see?</Text>
            </View>
            <View style={styles.countingCanvas}>
                {Array.from({ length: correctNumber }).map((_, index) => (
                    <View key={index} style={styles.objectWrapper}><AppleIcon /></View>
                ))}
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map((option) => (
                    <TouchableOpacity key={option} style={styles.numberButton} onPress={() => handleAnswer(option)} disabled={!!feedback}>
                        <Text style={styles.numberButtonText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

// 4. Make a Collection Screen
const MakeCollectionScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [targetNumber, setTargetNumber] = useState(0);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const generateNewQuestion = () => {
        setSelectedIndices([]);
        setTargetNumber(Math.floor(Math.random() * 9) + 1);
    };

    useEffect(() => {
        generateNewQuestion();
    }, []);

    const handleSelectObject = (index: number) => {
        if (feedback) return;
        setSelectedIndices(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const checkCollection = () => {
        if (selectedIndices.length === targetNumber) {
            setFeedback({ type: 'correct', message: 'Perfect!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: `That's ${selectedIndices.length}. We need ${targetNumber}.` });
            setTimeout(() => { setFeedback(null); }, 2000);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && (
                  <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                  </TouchableOpacity>
                )}
                <Text style={[styles.instructionText, { color: '#27ae60' }]}>Tap to select {targetNumber} apples</Text>
            </View>
            <View style={styles.countingCanvas}>
                {Array.from({ length: 9 }).map((_, index) => (
                    <TouchableOpacity key={index} onPress={() => handleSelectObject(index)}>
                        <View style={[styles.objectWrapper, selectedIndices.includes(index) && styles.selectedObject]}>
                            <AppleIcon />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.checkFooter}>
                <AppButton title="Check My Answer" onPress={checkCollection} disabled={!!feedback} />
            </View>
        </SafeAreaView>
    );
};

// 5. Learn Addition Screen
const AdditionLearnScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [problem, setProblem] = useState({ num1: 0, num2: 0 });
    const { num1, num2 } = problem;
    const sum = num1 + num2;

    const generateNewProblem = () => {
        const newNum1 = Math.floor(Math.random() * 5) + 1;
        const newNum2 = Math.floor(Math.random() * (9 - newNum1)) + 1;
        setProblem({ num1: newNum1, num2: newNum2 });
    };

    useEffect(generateNewProblem, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={[styles.instructionText, { color: '#8e44ad' }]}>Learn Addition</Text>
            </View>
            <View style={styles.equationContainer}>
                <Text style={styles.equationText}>{num1} + {num2} = {sum}</Text>
            </View>
            <View style={styles.countingCanvas}>
                {Array.from({ length: num1 }).map((_, i) => <View key={`n1-${i}`} style={styles.objectWrapper}><AppleIcon /></View>)}
                <Text style={styles.operatorText}>+</Text>
                {Array.from({ length: num2 }).map((_, i) => <View key={`n2-${i}`} style={styles.objectWrapper}><AppleIcon /></View>)}
            </View>
            <View style={styles.checkFooter}>
                <AppButton title="Next Problem ➡️" onPress={generateNewProblem} />
            </View>
        </SafeAreaView>
    );
};

// 6. Test Addition Screen
const AdditionTestScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [problem, setProblem] = useState({ num1: 0, num2: 0 });
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);
    const correctAnswer = problem.num1 + problem.num2;

    const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

    const generateNewQuestion = () => {
        const newNum1 = Math.floor(Math.random() * 5) + 1;
        const newNum2 = Math.floor(Math.random() * 5) + 1;
        const correct = newNum1 + newNum2;
        setProblem({ num1: newNum1, num2: newNum2 });

        const otherOptions: number[] = [];
        while (otherOptions.length < 2) {
            const randomOption = Math.floor(Math.random() * 10) + 1;
            if (randomOption !== correct && !otherOptions.includes(randomOption)) {
                otherOptions.push(randomOption);
            }
        }
        setOptions(shuffleArray([correct, ...otherOptions]));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedNumber: number) => {
        if (feedback) return;
        if (selectedNumber === correctAnswer) {
            setFeedback({ type: 'correct', message: 'Great job!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Not quite, try again!' });
            setTimeout(() => { setFeedback(null); }, 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={[styles.instructionText, { color: '#c0392b' }]}>What is {problem.num1} + {problem.num2}?</Text>
            </View>
            <View style={styles.countingCanvas}>
                {Array.from({ length: problem.num1 }).map((_, i) => <View key={`n1-${i}`} style={styles.objectWrapper}><AppleIcon /></View>)}
                <Text style={styles.operatorText}>+</Text>
                {Array.from({ length: problem.num2 }).map((_, i) => <View key={`n2-${i}`} style={styles.objectWrapper}><AppleIcon /></View>)}
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map((option) => (
                    <TouchableOpacity key={option} style={styles.numberButton} onPress={() => handleAnswer(option)} disabled={!!feedback}>
                        <Text style={styles.numberButtonText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

// 7. Learn Subtraction Screen
const SubtractionLearnScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [problem, setProblem] = useState({ num1: 1, num2: 1 });
    const { num1, num2 } = problem;
    const difference = num1 - num2;

    const generateNewProblem = () => {
        const newNum1 = Math.floor(Math.random() * 5) + 4; // 4-8
        const newNum2 = Math.floor(Math.random() * (newNum1 - 1)) + 1;
        setProblem({ num1: newNum1, num2: newNum2 });
    };

    useEffect(generateNewProblem, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={[styles.instructionText, { color: '#8e44ad' }]}>Learn Subtraction</Text>
            </View>
            <View style={styles.equationContainer}>
                <Text style={styles.equationText}>{num1} - {num2} = {difference}</Text>
            </View>
            <View style={styles.countingCanvas}>
                {Array.from({ length: num1 }).map((_, i) => <View key={`n1-${i}`} style={styles.objectWrapper}><AppleIcon isCrossedOut={i >= difference} /></View>)}
            </View>
            <View style={styles.checkFooter}>
                <AppButton title="Next Problem ➡️" onPress={generateNewProblem} />
            </View>
        </SafeAreaView>
    );
};

// 8. Test Subtraction Screen
const SubtractionTestScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [problem, setProblem] = useState({ num1: 1, num2: 1 });
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);
    const correctAnswer = problem.num1 - problem.num2;

    const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

    const generateNewQuestion = () => {
        const newNum1 = Math.floor(Math.random() * 5) + 4; // 4-8
        const newNum2 = Math.floor(Math.random() * (newNum1 - 1)) + 1;
        const correct = newNum1 - newNum2;
        setProblem({ num1: newNum1, num2: newNum2 });

        const otherOptions: number[] = [];
        while (otherOptions.length < 2) {
            const randomOption = Math.floor(Math.random() * 9) + 1;
            if (randomOption !== correct && !otherOptions.includes(randomOption)) {
                otherOptions.push(randomOption);
            }
        }
        setOptions(shuffleArray([correct, ...otherOptions]));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedNumber: number) => {
        if (feedback) return;
        if (selectedNumber === correctAnswer) {
            setFeedback({ type: 'correct', message: 'You got it!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Try again!' });
            setTimeout(() => { setFeedback(null); }, 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={[styles.instructionText, { color: '#c0392b' }]}>What is {problem.num1} - {problem.num2}?</Text>
            </View>
            <View style={styles.countingCanvas}>
                 {Array.from({ length: problem.num1 }).map((_, i) => <View key={`n1-${i}`} style={styles.objectWrapper}><AppleIcon isCrossedOut={i >= correctAnswer} /></View>)}
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map((option) => (
                    <TouchableOpacity key={option} style={styles.numberButton} onPress={() => handleAnswer(option)} disabled={!!feedback}>
                        <Text style={styles.numberButtonText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};


// --- Module Root ---
const NumbersModule: React.FC = () => {
  const [screen, setScreen] = useState<'main' | 'learn' | 'test' | 'collection' | 'addLearn' | 'addTest' | 'subLearn' | 'subTest'>('main');

  if (screen === 'learn') return <NumbersLearnScreen onBack={() => setScreen('main')} />;
  if (screen === 'test') return <NumbersTestScreen onBack={() => setScreen('main')} />;
  if (screen === 'collection') return <MakeCollectionScreen onBack={() => setScreen('main')} />;
  if (screen === 'addLearn') return <AdditionLearnScreen onBack={() => setScreen('main')} />;
  if (screen === 'addTest') return <AdditionTestScreen onBack={() => setScreen('main')} />;
  if (screen === 'subLearn') return <SubtractionLearnScreen onBack={() => setScreen('main')} />;
  if (screen === 'subTest') return <SubtractionTestScreen onBack={() => setScreen('main')} />;

  return (
    <NumbersScreen
      onStartLearn={() => setScreen('learn')}
      onStartTest={() => setScreen('test')}
      onStartCollection={() => setScreen('collection')}
      onStartLearnAddition={() => setScreen('addLearn')}
      onStartTestAddition={() => setScreen('addTest')}
      onStartLearnSubtraction={() => setScreen('subLearn')}
      onStartTestSubtraction={() => setScreen('subTest')}
    />
  );
};

export default NumbersModule;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  header: { 
      paddingVertical: 20, 
      paddingHorizontal: 20, 
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  headerTitle: { fontSize: 34, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(74, 144, 226, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  cardIcon: { fontSize: 30 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  cardDescription: { fontSize: 14, color: COLORS.lightText, marginTop: 4 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  disabledButton: { backgroundColor: '#B0C4DE' },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  activityHeader: { padding: 20, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: '#eee' },
  instructionText: { flex: 1, fontSize: 22, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  feedbackContainer: { position: 'absolute', bottom: 120, left: 20, right: 20, padding: 20, borderRadius: 15, alignItems: 'center', zIndex: 10 },
  feedbackText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  countingCanvas: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 10,
  },
  objectWrapper: {
      padding: 5,
      borderRadius: 15,
  },
  selectedObject: {
      backgroundColor: COLORS.selectedTint,
  },
  optionsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 40,
      backgroundColor: COLORS.card,
      borderTopWidth: 1,
      borderColor: '#eee',
  },
  checkFooter: {
      padding: 20,
      paddingBottom: 40,
      backgroundColor: COLORS.card,
      borderTopWidth: 1,
      borderColor: '#eee',
  },
  numberButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 6,
  },
  numberButtonText: {
      color: COLORS.white,
      fontSize: 30,
      fontWeight: 'bold',
  },
  backButton: {
      position: 'absolute',
      left: 20,
      top: 20,
      padding: 8,
      zIndex: 1,
  },
  backButtonText: {
      color: COLORS.primary,
      fontWeight: '600',
      fontSize: 16,
  },
  equationContainer: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  equationText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  operatorText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 10,
  }
});
