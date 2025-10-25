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
 

// --- Local navigation props ---
type ArithmeticHubProps = {
  onStartPictureProblems: () => void;
  onStartMulDiv: () => void;
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
  estimationColor: '#9B59B6', // Purple for estimation
  mulDivColor: '#E67E22', // Orange for multiplication/division
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
const ArithmeticHubScreen: React.FC<ArithmeticHubProps> = ({ onStartPictureProblems, onStartMulDiv }) => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Arithmetic Fun 🧮</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <ModuleCard title="Picture Math" icon="🖼️" description="Solve addition & subtraction stories." onPress={onStartPictureProblems} />
          <ModuleCard title="Groups & Sharing" icon="➗" description="Learn multiplication and division." onPress={onStartMulDiv} />
          
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

    const problemTemplates = [
        { op: '+', emoji: '🍎', template: (n1: number, n2: number) => ({ text: `You have ${n1} apples. You get ${n2} more. How many do you have now?`, correctAnswer: n1 + n2 }) },
        { op: '+', emoji: '🎈', template: (n1: number, n2: number) => ({ text: `There are ${n1} red balloons and ${n2} blue balloons. How many in total?`, correctAnswer: n1 + n2 }) },
        { op: '+', emoji: '⭐', template: (n1: number, n2: number) => ({ text: `You earned ${n1} stars on Monday and ${n2} stars on Tuesday. How many stars did you earn?`, correctAnswer: n1 + n2 }) },
        { op: '-', emoji: '🍪', template: (n1: number, n2: number) => ({ text: `There were ${n1} cookies. You ate ${n2}. How many are left?`, correctAnswer: n1 - n2 }) },
        { op: '-', emoji: '🐸', template: (n1: number, n2: number) => ({ text: `${n1} frogs were on a log. ${n2} jumped off. How many are still on the log?`, correctAnswer: n1 - n2 }) },
        { op: '-', emoji: '🚗', template: (n1: number, n2: number) => ({ text: `A parking lot had ${n1} cars. ${n2} cars drove away. How many cars are left?`, correctAnswer: n1 - n2 }) },
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

// 3. Multiplication and Division Screen (REVISED)
const MultiplicationDivisionScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [mode, setMode] = useState<'multiplication' | 'division'>('multiplication');
    const [problem, setProblem] = useState({
        correctAnswer: 0,
        groups: 0,
        itemsInGroup: 0,
        total: 0,
        emoji: '❓'
    });
    const [options, setOptions] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{message: string; type: 'correct' | 'incorrect'} | null>(null);

    const generateNewQuestion = (currentMode: 'multiplication' | 'division') => {
        setFeedback(null);
        const emoji = ['🍓', '💎', '🚀', '🐠'][Math.floor(Math.random() * 4)];
        const groups = Math.floor(Math.random() * 4) + 2; // 2-5 groups
        const itemsInGroup = Math.floor(Math.random() * 4) + 2; // 2-5 items per group
        const total = groups * itemsInGroup;
        
        let correctAnswer = 0;
        if (currentMode === 'multiplication') {
            correctAnswer = total;
        } else { // division
            correctAnswer = itemsInGroup;
        }
        
        setProblem({ correctAnswer, groups, itemsInGroup, total, emoji });

        const otherOptions: number[] = [];
        while (otherOptions.length < 2) {
            const randomOffset = Math.floor(Math.random() * 5) - 2;
            const randomOption = Math.max(1, correctAnswer + randomOffset);
            if (randomOption !== correctAnswer && !otherOptions.includes(randomOption)) {
                otherOptions.push(randomOption);
            }
        }
        setOptions([correctAnswer, ...otherOptions].sort(() => Math.random() - 0.5));
    };
    
    // Generate question on mode change
    useEffect(() => {
        generateNewQuestion(mode);
    }, [mode]);

    const handleAnswer = (selectedNumber: number) => {
        if (selectedNumber === problem.correctAnswer) {
            setFeedback({ type: 'correct', message: 'Great job!' });
            setTimeout(() => generateNewQuestion(mode), 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Let\'s try that one more time!' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    const renderQuestionText = () => {
        if (mode === 'multiplication') {
            const repeatedAddition = Array(problem.groups).fill(problem.itemsInGroup).join(' + ');
            return (
                <View style={styles.storyContainer}>
                    <Text style={styles.storyText}>This shows {problem.groups} groups of {problem.itemsInGroup}.</Text>
                    <Text style={styles.equationTextSmall}>{problem.groups} x {problem.itemsInGroup} = ?</Text>
                    <Text style={styles.storyText}>({repeatedAddition})</Text>
                </View>
            );
        } else { // division
             return (
                <View style={styles.storyContainer}>
                    <Text style={styles.storyText}>Share {problem.total} {problem.emoji} into {problem.groups} equal groups.</Text>
                    <Text style={styles.equationTextSmall}>{problem.total} ÷ {problem.groups} = ?</Text>
                </View>
            );
        }
    };

    const renderPictures = () => {
        return Array.from({ length: problem.groups }).map((_, i) => (
            <View key={i} style={styles.itemGroup}>
                {Array.from({ length: problem.itemsInGroup }).map((_, j) => (
                    <Text key={j} style={styles.emojiStyle}>{problem.emoji}</Text>
                ))}
            </View>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back</Text></TouchableOpacity>}
                <Text style={[styles.instructionText, {color: COLORS.mulDivColor}]}>Groups and Sharing</Text>
            </View>

            <View style={styles.modeSelector}>
                <TouchableOpacity 
                    style={[styles.modeButton, mode === 'multiplication' && styles.modeButtonActive]} 
                    onPress={() => setMode('multiplication')}>
                    <Text style={[styles.modeButtonText, mode === 'multiplication' && styles.modeButtonTextActive]}>Multiplication</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.modeButton, mode === 'division' && styles.modeButtonActive]} 
                    onPress={() => setMode('division')}>
                    <Text style={[styles.modeButtonText, mode === 'division' && styles.modeButtonTextActive]}>Division</Text>
                </TouchableOpacity>
            </View>

            {renderQuestionText()}
            
            <View style={styles.pictureCanvas}>
                {renderPictures()}
            </View>

            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            
            <View style={styles.optionsFooter}>
                {options.map((option) => (
                    <TouchableOpacity key={option} style={[styles.numberButton, {backgroundColor: COLORS.mulDivColor}]} onPress={() => handleAnswer(option)} disabled={!!feedback}>
                        <Text style={styles.numberButtonText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};


// (Removed Estimation and Commutative screens)


// --- Module Root ---
const ArithmeticModule: React.FC = () => {
  const [screen, setScreen] = useState<'main' | 'picture' | 'mulDiv'>('main');

  if (screen === 'picture') return <PictureProblemScreen onBack={() => setScreen('main')} />;
  if (screen === 'mulDiv') return <MultiplicationDivisionScreen onBack={() => setScreen('main')} />;

  return (
    <ArithmeticHubScreen
      onStartPictureProblems={() => setScreen('picture')}
      onStartMulDiv={() => setScreen('mulDiv')}
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
  equationTextSmall: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    flexWrap: 'wrap',
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
    fontSize: 36,
    margin: 2,
  },
  fadedEmoji: {
    opacity: 0.3,
  },
  itemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    margin: 5,
    borderWidth: 2,
    borderColor: COLORS.mulDivColor,
    borderRadius: 10,
    minWidth: 60,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  modeButtonActive: {
    backgroundColor: COLORS.mulDivColor,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modeButtonTextActive: {
    color: COLORS.white,
  }
});
