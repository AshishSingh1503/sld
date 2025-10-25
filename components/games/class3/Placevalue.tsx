import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  ViewStyle,
} from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

// --- Configuration ---

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TypeScript Types ---

type QuestionType = 'placeValue' | 'faceValue';

type Question = {
  questionText: string;
  number: number;
  digitIndex: number; // The index of the digit in question (from the right, starting at 0)
  correctAnswer: number;
  options: number[];
};

type GameState = 'home' | 'practice' | 'quiz' | 'score';

type GameData = {
  score?: number;
  total?: number;
};

// --- Color Palette ---
const COLORS = {
  primary: '#3498DB', // Peter River Blue
  secondary: '#E67E22', // Carrot Orange
  background: '#ECF0F1', // Clouds White
  card: '#FFFFFF',
  text: '#2C3E50', // Midnight Blue
  lightText: '#FFFFFF',
  correct: '#2ECC71', // Emerald Green
  incorrect: '#E74C3C', // Alizarin Red
  highlight: '#F1C40F', // Sunflower Yellow
  thousands: '#D35400',
  hundreds: '#2980B9',
  tens: '#27AE60',
  ones: '#8E44AD',
};

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 8,
};

// --- Helper Functions ---

const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getPlaceName = (index: number): string => {
    if (index === 0) return 'Ones';
    if (index === 1) return 'Tens';
    if (index === 2) return 'Hundreds';
    if (index === 3) return 'Thousands';
    return '';
}

const generateQuestions = (): Question[] => {
  const questions: Question[] = [];
  
  for (let i = 0; i < 5; i++) {
    const number = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
    const numString = number.toString();
    const digitIndex = Math.floor(Math.random() * numString.length);
    const digit = parseInt(numString[numString.length - 1 - digitIndex]);
    
    const placeValue = digit * Math.pow(10, digitIndex);
    questions.push({
        questionText: `What's the place value of the underlined digit?`,
        number,
        digitIndex,
        correctAnswer: placeValue,
        options: shuffleArray([placeValue, digit, placeValue / 10, placeValue * 10].filter(v => v >= 0))
    });

    const faceValue = digit;
    questions.push({
        questionText: `What's the face value of the underlined digit?`,
        number,
        digitIndex,
        correctAnswer: faceValue,
        options: shuffleArray([faceValue, placeValue, faceValue * 10, 0])
    });
  }
  return shuffleArray(questions);
};


// --- Dynamic UI Components ---

const NumberBlock: React.FC<{ number: number; highlightedIndex?: number; onDigitPress?: (index: number, digit: number) => void }> = ({ number, highlightedIndex, onDigitPress }) => {
    const numString = number.toString();
    return (
        <View style={styles.numberBlockContainer}>
            {numString.split('').map((digit, i) => {
                const digitIndexFromRight = numString.length - 1 - i;
                return (
                    <TouchableOpacity 
                        key={i} 
                        style={[styles.digitBox, SHADOW, highlightedIndex === digitIndexFromRight && { backgroundColor: COLORS.highlight, transform: [{scale: 1.1}] }]}
                        onPress={() => onDigitPress?.(digitIndexFromRight, parseInt(digit))}
                        disabled={!onDigitPress}
                    >
                        <Text style={styles.digitText}>{digit}</Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const ExpandedFormVisual: React.FC<{ number: number }> = ({ number }) => {
    const numString = number.toString();
    const digits = numString.split('').map(d => parseInt(d));
    const width = 320; // Increased width for more space
    const digitBoxWidth = 60;
    const spacing = (width - digits.length * digitBoxWidth) / (digits.length + 1);

    const placeColors = [COLORS.ones, COLORS.tens, COLORS.hundreds, COLORS.thousands];

    return (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
            {/* Display the number */}
            <View style={{ flexDirection: 'row' }}>
                {digits.map((digit, i) => (
                    <View key={i} style={[styles.expandedDigitBox, { backgroundColor: placeColors[digits.length - 1 - i] || COLORS.card }]}>
                        <Text style={styles.expandedDigitText}>{digit}</Text>
                    </View>
                ))}
            </View>
            
            {/* SVG for connecting lines and labels */}
            <Svg height="180" width={width}>
                {digits.map((digit, i) => {
                    const indexFromRight = digits.length - 1 - i;
                    const startX = spacing * (i + 1) + digitBoxWidth * i + digitBoxWidth / 2;
                    const startY = 0;
                    const endY = 40 + (indexFromRight * 30); // Increased vertical spacing
                    const path = `M ${startX} ${startY} L ${startX} ${endY}`;
                    const placeName = getPlaceName(indexFromRight);
                    const placeValue = digit * Math.pow(10, indexFromRight);

                    return (
                        <React.Fragment key={i}>
                            <Path d={path} stroke={placeColors[indexFromRight]} strokeWidth="2.5" />
                            <SvgText x={startX + 5} y={endY + 5} fill={placeColors[indexFromRight]} fontSize="16" fontWeight="bold">
                                {`${digit} ${placeName} (${placeValue})`}
                            </SvgText>
                        </React.Fragment>
                    )
                })}
            </Svg>
        </View>
    );
};


// --- Screen Components ---

const HomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <SafeAreaView style={[styles.container, styles.centerContent]}>
    <Text style={styles.title}>Place Value Party! 🥳</Text>
    <NumberBlock number={5468} />
    <Text style={styles.subtitle}>Learn Face Value and Place Value.</Text>
    <TouchableOpacity style={[styles.ctaButton, SHADOW]} onPress={onStart}>
      <Text style={styles.ctaButtonText}>Start Learning</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const PracticeScreen: React.FC<{ onStartQuiz: () => void }> = ({ onStartQuiz }) => {
    const [number, setNumber] = useState(Math.floor(Math.random() * 9000) + 1000);

    const handleNext = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setNumber(Math.floor(Math.random() * 9000) + 1000);
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Practice Mode</Text>
            <Text style={styles.subtitle}>See how numbers are built!</Text>
            
            <ExpandedFormVisual number={number} />

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.ctaButton, SHADOW, { flex: 1, marginRight: 10 }]} onPress={handleNext}>
                    <Text style={styles.ctaButtonText}>Next Number</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, SHADOW, { flex: 1 }]} onPress={onStartQuiz}>
                    <Text style={styles.secondaryButtonText}>Quiz Me!</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const QuizScreen: React.FC<{ onQuizComplete: (score: number, total: number) => void }> = ({ onQuizComplete }) => {
  const [questions] = useState(() => generateQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleOptionPress = (option: number) => {
    if (selectedOption !== null) return;
    const correct = option === questions[currentIndex].correctAnswer;
    setSelectedOption(option);
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        onQuizComplete(score + (correct ? 1 : 0), questions.length);
      }
    }, 1500);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{currentQuestion.questionText}</Text>
      <NumberBlock number={currentQuestion.number} highlightedIndex={currentQuestion.digitIndex} />
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const buttonStyle: (ViewStyle | object)[] = [styles.optionButton, SHADOW];
          if (isSelected) buttonStyle.push(isCorrect ? styles.correctOption : styles.incorrectOption);
          else if (selectedOption !== null && option === currentQuestion.correctAnswer) buttonStyle.push(styles.correctOption);
          return (
            <TouchableOpacity key={index} style={buttonStyle} onPress={() => handleOptionPress(option)} disabled={!!selectedOption}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const ScoreScreen: React.FC<{ score: number; total: number; onTryAgain: () => void; onBackToHome: () => void }> = ({ score, total, onTryAgain, onBackToHome }) => {
    const percentage = (score / total) * 100;
    const message = percentage === 100 ? 'Genius!' : percentage >= 70 ? 'Awesome!' : 'Good Effort!';
    const emoji = percentage === 100 ? '🏆' : percentage >= 70 ? '🎉' : '�';
  
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.scoreEmoji}>{emoji}</Text>
        <Text style={styles.title}>{message}</Text>
        <Text style={styles.scoreText}>You scored</Text>
        <Text style={styles.scoreValue}>{score} / {total}</Text>
        <TouchableOpacity style={[styles.ctaButton, SHADOW]} onPress={onTryAgain}>
          <Text style={styles.ctaButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { marginTop: 15 }]} onPress={onBackToHome}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
};


// --- Main Game Component ---
const PlaceValueGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('home');
  const [gameData, setGameData] = useState<GameData>({});

  const renderState = () => {
    switch (gameState) {
      case 'home':
        return <HomeScreen onStart={() => setGameState('practice')} />;
      case 'practice':
        return <PracticeScreen onStartQuiz={() => setGameState('quiz')} />;
      case 'quiz':
        return <QuizScreen onQuizComplete={(score, total) => {
          setGameData({ score, total });
          setGameState('score');
        }} />;
      case 'score':
        return <ScoreScreen 
          score={gameData.score!} 
          total={gameData.total!} 
          onTryAgain={() => setGameState('quiz')}
          onBackToHome={() => setGameState('home')}
        />;
      default:
        return <HomeScreen onStart={() => setGameState('practice')} />;
    }
  };

  return <View style={{flex: 1}}>{renderState()}</View>;
};

export default PlaceValueGame;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginVertical: 20 },
  subtitle: { fontSize: 18, color: COLORS.text, textAlign: 'center', marginVertical: 20 },
  ctaButton: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 30, marginTop: 30 },
  ctaButtonText: { color: COLORS.lightText, fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: COLORS.card, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, borderWidth: 2, borderColor: COLORS.primary },
  secondaryButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20, position: 'absolute', bottom: 20, left: 20, right: 20 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 40 },
  optionButton: { backgroundColor: COLORS.card, width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, minHeight: 80, justifyContent: 'center' },
  optionText: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  correctOption: { backgroundColor: COLORS.correct },
  incorrectOption: { backgroundColor: COLORS.incorrect },
  scoreEmoji: { fontSize: 80, marginBottom: 20 },
  scoreText: { fontSize: 24, color: COLORS.text, marginTop: 20 },
  scoreValue: { fontSize: 58, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 40 },
  // Number Block Styles
  numberBlockContainer: { flexDirection: 'row', marginVertical: 20 },
  digitBox: { width: 70, height: 90, backgroundColor: COLORS.card, marginHorizontal: 5, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  digitText: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary },
  // Expanded Form Styles
  expandedDigitBox: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  expandedDigitText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.lightText,
  },
});
