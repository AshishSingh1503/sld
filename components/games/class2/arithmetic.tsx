import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Svg, Rect } from 'react-native-svg';

// --- Local navigation props ---
type ArithmeticHubProps = {
  onStartPictureProblems: () => void;
  onStartEstimationStation: () => void;
  onStartCommutativeProperty: () => void;
};

type ScreenProps = {
    onBack?: () => void;
};

// --- Types ---
type ProblemTemplate = {
  op: '+' | '-';
  emoji: string;
  template: (n1: number, n2: number) => { text: string; correctAnswer: number };
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
  estimationColor: '#9B59B6', // Purple for estimation
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


// --- Arithmetic Module Screens ---

// 1. Arithmetic Hub Screen
const ArithmeticHubScreen: React.FC<ArithmeticHubProps> = ({ onStartPictureProblems, onStartEstimationStation, onStartCommutativeProperty }) => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Addition & Subtraction ➕➖</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <ModuleCard title="Picture Math" icon="🖼️" description="Solve math problems with pictures and stories." onPress={onStartPictureProblems} />
          <ModuleCard title="Estimation Station" icon="🎯" description="Guess the answer before you solve." onPress={onStartEstimationStation} />
          <ModuleCard title="Flip Flop Add" icon="🔄" description="Does 5 + 3 = 3 + 5? Let's see!" onPress={onStartCommutativeProperty} />
      </ScrollView>
    </SafeAreaView>
);

// 2. Picture Math Problems Screen
const PictureProblemScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [problem, setProblem] = useState({ 
        text: '', 
        correctAnswer: 0, 
        num1: 0, 
        num2: 0, 
        op: '+', 
        emoji: '❓' 
    });
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const problemTemplates: ProblemTemplate[] = [
        { op: '+', emoji: '🍎', template: (n1, n2) => ({ text: `You have ${n1} apples. You get ${n2} more. How many do you have now?`, correctAnswer: n1 + n2 }) },
        { op: '+', emoji: '🎈', template: (n1, n2) => ({ text: `There are ${n1} red balloons and ${n2} blue balloons. How many in total?`, correctAnswer: n1 + n2 }) },
        { op: '+', emoji: '⭐', template: (n1, n2) => ({ text: `You earned ${n1} stars on Monday and ${n2} stars on Tuesday. How many stars did you earn?`, correctAnswer: n1 + n2 }) },
        { op: '-', emoji: '🍪', template: (n1, n2) => ({ text: `There were ${n1} cookies. You ate ${n2}. How many are left?`, correctAnswer: n1 - n2 }) },
        { op: '-', emoji: '🐸', template: (n1, n2) => ({ text: `${n1} frogs were on a log. ${n2} jumped off. How many are still on the log?`, correctAnswer: n1 - n2 }) },
        { op: '-', emoji: '🚗', template: (n1, n2) => ({ text: `A parking lot had ${n1} cars. ${n2} cars drove away. How many cars are left?`, correctAnswer: n1 - n2 }) },
    ];

    const generateNewQuestion = () => {
        const templateInfo = problemTemplates[Math.floor(Math.random() * problemTemplates.length)];
        
        let num1 = Math.floor(Math.random() * 10) + 5;
        let num2 = Math.floor(Math.random() * 5) + 2;

        if (templateInfo.op === '-' && num1 < num2) {
            [num1, num2] = [num2, num1]; // Ensure n1 is bigger for subtraction
        }

        const newProblem = templateInfo.template(num1, num2);
        setProblem({ ...newProblem, num1, num2, op: templateInfo.op, emoji: templateInfo.emoji });

        const otherOptions: number[] = [];
        while (otherOptions.length < 2) {
            const randomOffset = Math.floor(Math.random() * 6) - 3;
            const randomOption = Math.max(0, newProblem.correctAnswer + randomOffset);
            if (randomOption !== newProblem.correctAnswer && !otherOptions.includes(randomOption)) {
                otherOptions.push(randomOption);
            }
        }
        setOptions([newProblem.correctAnswer, ...otherOptions].sort(() => Math.random() - 0.5));
    };

    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedNumber: number) => {
        if (selectedNumber === problem.correctAnswer) {
            setFeedback({ type: 'correct', message: 'Excellent!' });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Let\'s try that again!' });
            setTimeout(() => { setFeedback(null); }, 1500);
        }
    };

    const renderPictures = () => {
        if (problem.op === '+') {
            return (
                <View style={styles.pictureRow}>
                    <View style={styles.pictureGroup}>
                        {Array.from({ length: problem.num1 }).map((_, i) => <Text key={`p1-${i}`} style={styles.emojiStyle}>{problem.emoji}</Text>)}
                    </View>
                    <Text style={styles.operatorText}>+</Text>
                    <View style={styles.pictureGroup}>
                        {Array.from({ length: problem.num2 }).map((_, i) => <Text key={`p2-${i}`} style={styles.emojiStyle}>{problem.emoji}</Text>)}
                    </View>
                </View>
            );
        } else { // Subtraction
            return (
                <View style={styles.pictureRow}>
                    <View style={styles.pictureGroup}>
                        {Array.from({ length: problem.num1 }).map((_, i) => (
                            <Text key={`p1-${i}`} style={[styles.emojiStyle, i >= problem.correctAnswer && styles.fadedEmoji]}>{problem.emoji}</Text>
                        ))}
                    </View>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>Picture Math</Text>
            </View>
            <View style={styles.storyContainer}>
                <Text style={styles.storyText}>{problem.text}</Text>
            </View>
            <View style={styles.pictureCanvas}>
                {renderPictures()}
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


// 3. Estimation Station Screen
const EstimationStationScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [problem, setProblem] = useState({ num1: 0, num2: 0 });
    const [options, setOptions] = useState<number[]>([]);
    const [correctEst, setCorrectEst] = useState(0);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const generateNewQuestion = () => {
        const num1 = Math.floor(Math.random() * 40) + 10; // 10-49
        const num2 = Math.floor(Math.random() * 40) + 10; // 10-49
        setProblem({ num1, num2 });

        const actualAnswer = num1 + num2;
        const est1 = Math.round(actualAnswer / 10) * 10;
        let est2 = est1 + 10;
        if (Math.random() > 0.5) est2 = Math.max(0, est1 - 10);
        
        setOptions([est1, est2].sort((a,b) => a-b));
        setCorrectEst(Math.abs(actualAnswer - est1) < Math.abs(actualAnswer - est2) ? est1 : est2);
    };
    
    useEffect(generateNewQuestion, []);

    const handleAnswer = (selectedEst: number) => {
        if (selectedEst === correctEst) {
            setFeedback({ type: 'correct', message: `Yes! The answer is ${problem.num1 + problem.num2}.` });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 2000);
        } else {
            setFeedback({ type: 'incorrect', message: `Close! The answer is ${problem.num1 + problem.num2}.` });
            setTimeout(() => { setFeedback(null); generateNewQuestion(); }, 2000);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={[styles.instructionText, {color: COLORS.estimationColor}]}>Which number is the answer CLOSEST to?</Text>
            </View>
            <View style={styles.equationContainer}>
                <Text style={[styles.equationText, {fontSize: 60}]}>{problem.num1} + {problem.num2}</Text>
            </View>
            <View style={{flex: 1}} />
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsFooter}>
                {options.map((option) => (
                    <TouchableOpacity key={option} style={[styles.numberButton, {backgroundColor: COLORS.estimationColor}]} onPress={() => handleAnswer(option)} disabled={!!feedback}>
                        <Text style={styles.numberButtonText}>~{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

// 4. Commutative Property Screen
const CommutativePropertyScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [problem, setProblem] = useState({ num1: 0, num2: 0 });
    const [isFlipped, setIsFlipped] = useState(false);

    const generateNewProblem = () => {
        setIsFlipped(false);
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        setProblem({ num1, num2 });
    };

    useEffect(generateNewProblem, []);
    
    const { num1, num2 } = problem;
    const sum = num1 + num2;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={styles.instructionText}>Notice a pattern?</Text>
            </View>
            <View style={styles.commutativeContainer}>
                <Text style={styles.equationText}>{isFlipped ? num2 : num1} + {isFlipped ? num1 : num2} = {sum}</Text>
            </View>
            <View style={styles.checkFooter}>
                <AppButton title="Flip it! 🔄" onPress={() => setIsFlipped(!isFlipped)} style={{marginBottom: 20}} />
                <AppButton title="New Problem" onPress={generateNewProblem} />
            </View>
        </SafeAreaView>
    );
};


// --- Module Root ---
const ArithmeticModule: React.FC = () => {
  const [screen, setScreen] = useState<'main' | 'picture' | 'estimation' | 'commutative'>('main');

  if (screen === 'picture') return <PictureProblemScreen onBack={() => setScreen('main')} />;
  if (screen === 'estimation') return <EstimationStationScreen onBack={() => setScreen('main')} />;
  if (screen === 'commutative') return <CommutativePropertyScreen onBack={() => setScreen('main')} />;

  return (
    <ArithmeticHubScreen
      onStartPictureProblems={() => setScreen('picture')}
      onStartEstimationStation={() => setScreen('estimation')}
      onStartCommutativeProperty={() => setScreen('commutative')}
    />
  );
};

export default ArithmeticModule;

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
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(74, 144, 226, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  cardIcon: { fontSize: 30 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  cardDescription: { fontSize: 14, color: COLORS.lightText, marginTop: 4 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  disabledButton: { backgroundColor: '#B0C4DE' },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  instructionText: { flex: 1, fontSize: 22, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  feedbackContainer: { position: 'absolute', bottom: 120, left: 20, right: 20, padding: 20, borderRadius: 15, alignItems: 'center', zIndex: 10 },
  feedbackText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  optionsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 20,
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
      alignItems: 'center',
  },
  numberButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 6,
      margin: 5,
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
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  operatorText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginHorizontal: 15,
    alignSelf: 'center',
  },
  storyContainer: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  storyText: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 32,
    color: COLORS.text,
    fontWeight: '500',
  },
  commutativeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pictureCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  pictureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pictureGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '80%',
  },
  emojiStyle: {
    fontSize: 40,
    margin: 2,
  },
  fadedEmoji: {
    opacity: 0.3,
  }
});
