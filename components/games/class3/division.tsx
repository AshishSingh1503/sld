import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  ViewStyle,
} from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TypeScript Types ---

// Type for individual quiz questions.
type Question = {
  questionText: string;
  options: number[];
  correctAnswer: number;
};

// Game state
type GameState = 'home' | 'practice' | 'quiz' | 'score';

// Game data
type GameData = {
  divisor?: number;
  score?: number;
  total?: number;
};


// --- Color Palette ---
const COLORS = {
  primary: '#8E44AD', // Wisteria Purple
  secondary: '#F1C40F', // Sunflower Yellow
  background: '#ECF0F1', // Clouds White
  card: '#FFFFFF',
  text: '#2C3E50', // Midnight Blue
  lightText: '#FFFFFF',
  correct: '#2ECC71', // Emerald Green
  incorrect: '#E74C3C', // Alizarin Red
  white: '#FFFFFF',
  gray: '#BDC3C7', // Silver
};

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.2,
  shadowRadius: 4.65,
  elevation: 6,
};

// --- Helper Functions ---

/**
 * Shuffles an array in place.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
// FIX: Added a trailing comma inside the generic to disambiguate from JSX
const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Generates quiz questions for a given divisor.
 * @param divisor The number to divide by.
 * @returns An array of shuffled question objects.
 */
const generateQuestions = (divisor: number): Question[] => {
  const questions: Question[] = [];
  for (let i = 1; i <= 10; i++) {
    const dividend = divisor * i;
    const correctAnswer = i;
    const options = new Set<number>([correctAnswer]);
    
    // Generate 3 unique incorrect options
    while (options.size < 4) {
      const randomOffset = Math.floor(Math.random() * 5) + 1;
      const incorrectOption = correctAnswer + (Math.random() > 0.5 ? randomOffset : -randomOffset);
      if (incorrectOption > 0 && incorrectOption !== correctAnswer) {
        options.add(incorrectOption);
      }
    }
    
    questions.push({
      questionText: `${dividend} ÷ ${divisor}`,
      options: shuffleArray(Array.from(options)),
      correctAnswer,
    });
  }
  return shuffleArray(questions);
};


// --- Components ---

/**
 * HomeScreen: The main screen where users select a divisor.
 */
const HomeScreen: React.FC<{ onSelectDivisor: (divisor: number) => void }> = ({ onSelectDivisor }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  const titleStyle = {
    opacity: animatedValue,
    transform: [{
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0],
      }),
    }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Animated.Text style={[styles.title, titleStyle]}>
        Division Dash! ➗
      </Animated.Text>
      <Text style={styles.subtitle}>Pick a number to divide by</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {[...Array(9)].map((_, i) => {
          const divisor = i + 2; // Tables from 2 to 10
          return (
            <TouchableOpacity
              key={divisor}
              style={[styles.gridButton, SHADOW]}
              onPress={() => onSelectDivisor(divisor)}
            >
              <Text style={styles.gridButtonText}>{divisor}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * PracticeScreen: Displays division examples for the selected divisor.
 */
const PracticeScreen: React.FC<{ divisor: number; onStartQuiz: () => void }> = ({ divisor, onStartQuiz }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <Text style={styles.title}>Dividing by {divisor}</Text>
        <ScrollView contentContainerStyle={styles.tableContainer}>
          {[...Array(10)].map((_, i) => (
            <View key={i} style={[styles.tableRow, SHADOW]}>
              <Text style={styles.tableText}>
                {divisor * (i + 1)} ÷ {divisor} = {i + 1}
              </Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[styles.ctaButton, SHADOW]}
          onPress={onStartQuiz}
        >
          <Text style={styles.ctaButtonText}>Start Quiz! 🚀</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

/**
 * QuizScreen: The interactive quiz component.
 */
const QuizScreen: React.FC<{ divisor: number; onQuizComplete: (score: number, total: number) => void }> = ({ divisor, onQuizComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    setQuestions(generateQuestions(divisor));
  }, [divisor]);
  
  useEffect(() => {
    // Reset animation for each new question
    scaleAnim.setValue(0.5);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, scaleAnim]);

  const handleOptionPress = (option: number) => {
    if (selectedOption !== null) return; // Prevent multiple selections

    const currentQuestion = questions[currentIndex];
    const correct = option === currentQuestion.correctAnswer;
    
    setSelectedOption(option);
    setIsCorrect(correct);
    if (correct) {
      setScore(prevScore => prevScore + 1);
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

    // Use a timeout to show feedback before moving to the next question
    setTimeout(() => {
      const isLastQuestion = currentIndex === questions.length - 1;
      if (isLastQuestion) {
        // FIX: Calculate final score directly to avoid stale state issue
        const finalScore = score + (correct ? 1 : 0);
        onQuizComplete(finalScore, questions.length);
      } else {
        setCurrentIndex(prevIndex => prevIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      }
    }, 1200);
  };

  if (questions.length === 0) {
    return <View style={styles.container}><Text>Loading Quiz...</Text></View>;
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.quizProgressText}>{`Question ${currentIndex + 1} of ${questions.length}`}</Text>
      
      <Animated.View style={[styles.quizCard, SHADOW, {transform: [{scale: scaleAnim}]}]}>
        <Text style={styles.quizQuestionText}>{currentQuestion.questionText} = ?</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const buttonStyle: (ViewStyle | object)[] = [styles.optionButton, SHADOW];
          if (isSelected) {
            buttonStyle.push(isCorrect ? styles.correctOption : styles.incorrectOption);
          } else if (selectedOption !== null && option === currentQuestion.correctAnswer) {
            // Show correct answer after selection
            buttonStyle.push(styles.correctOption);
          }
          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => handleOptionPress(option)}
              disabled={selectedOption !== null}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

/**
 * ScoreScreen: Displays the final score.
 */
const ScoreScreen: React.FC<{ score: number; total: number; divisor: number; onTryAgain: () => void; onBackToHome: () => void }> = ({ score, total, divisor, onTryAgain, onBackToHome }) => {
  const percentage = (score / total) * 100;

  let message = '';
  let emoji = '';

  if (percentage === 100) {
    message = 'Perfect Score!';
    emoji = '🏆';
  } else if (percentage >= 70) {
    message = 'Great Job!';
    emoji = '🎉';
  } else if (percentage >= 50) {
    message = 'Good Effort!';
    emoji = '👍';
  } else {
    message = 'Keep Practicing!';
    emoji = '💪';
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoreContent}>
        <Text style={styles.scoreEmoji}>{emoji}</Text>
        <Text style={styles.title}>{message}</Text>
        <Text style={styles.scoreText}>You scored</Text>
        <Text style={styles.scoreValue}>{score} / {total}</Text>
        
        <TouchableOpacity
          style={[styles.ctaButton, SHADOW]}
          onPress={onTryAgain}
        >
          <Text style={styles.ctaButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, {marginTop: 15}]}
          onPress={onBackToHome}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Main Division Game Component ---
const DivisionGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('home');
  const [gameData, setGameData] = useState<GameData>({});

  const handleSelectDivisor = (divisor: number) => {
    setGameData({ divisor });
    setGameState('practice');
  };

  const handleStartQuiz = () => {
    setGameState('quiz');
  };

  const handleQuizComplete = (score: number, total: number) => {
    setGameData(prev => ({ ...prev, score, total }));
    setGameState('score');
  };

  const handleTryAgain = () => {
    setGameState('quiz');
  };

  const handleBackToHome = () => {
    setGameState('home');
    setGameData({});
  };

  switch (gameState) {
    case 'home':
      return <HomeScreen onSelectDivisor={handleSelectDivisor} />;
    case 'practice':
      return <PracticeScreen divisor={gameData.divisor!} onStartQuiz={handleStartQuiz} />;
    case 'quiz':
      return <QuizScreen divisor={gameData.divisor!} onQuizComplete={handleQuizComplete} />;
    case 'score':
      return (
        <ScoreScreen 
          score={gameData.score!} 
          total={gameData.total!} 
          divisor={gameData.divisor!}
          onTryAgain={handleTryAgain}
          onBackToHome={handleBackToHome}
        />
      );
    default:
      return <HomeScreen onSelectDivisor={handleSelectDivisor} />;
  }
};

export default DivisionGame;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gridButton: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.card,
    borderRadius: 50, // Make it circular
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  gridButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tableContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  tableRow: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    width: '85%',
    alignItems: 'center',
  },
  tableText: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 12,
    width: '100%',
    backgroundColor: COLORS.gray,
    borderRadius: 6,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
  },
  quizProgressText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  quizCard: {
    backgroundColor: COLORS.card,
    padding: 40,
    borderRadius: 25,
    marginVertical: 30,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  quizQuestionText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  optionButton: {
    backgroundColor: COLORS.card,
    width: '45%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.gray,
  },
  optionText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  correctOption: {
    backgroundColor: COLORS.correct,
    borderColor: COLORS.correct,
  },
  incorrectOption: {
    backgroundColor: COLORS.incorrect,
    borderColor: COLORS.incorrect,
  },
  scoreContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 24,
    color: COLORS.text,
    marginTop: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 40,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
