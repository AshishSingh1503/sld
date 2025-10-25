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

// --- Pre-computation & Configuration ---

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TypeScript Types ---

// Represents a single fraction
type Fraction = {
  numerator: number;
  denominator: number;
};

// Represents a single quiz question
type Question = {
  correctAnswer: Fraction;
  options: Fraction[];
};

// Defines the different screens or states of the app
type GameState = 'home' | 'practice' | 'quiz' | 'score';

// Holds data that needs to be passed between states
type GameData = {
  score?: number;
  total?: number;
};

// --- Constants ---
const FRACTION_ICONS = ['🍕', '🍪', '🍫', '🍰', '🍉', '🍩', '🍊'];

// --- Color Palette ---
const COLORS = {
  primary: '#E67E22', // Carrot Orange
  secondary: '#3498DB', // Peter River Blue
  background: '#FDFEFE', // Almost White
  card: '#FFFFFF',
  text: '#34495E', // Wet Asphalt
  lightText: '#FFFFFF',
  correct: '#2ECC71', // Emerald Green
  incorrect: '#E74C3C', // Alizarin Red
};

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 8,
};

// --- Helper Functions ---

/**
 * Shuffles an array in place.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Generates a list of simple fractions for practice and quizzes.
 */
const generateSimpleFractions = (): Fraction[] => {
  const fractions: Fraction[] = [];
  // Halves, Thirds, Quarters, Fifths
  for (let d = 2; d <= 5; d++) {
    for (let n = 1; n < d; n++) {
      fractions.push({ numerator: n, denominator: d });
    }
  }
  return shuffleArray(fractions);
};

/**
 * Generates a set of quiz questions.
 */
const generateQuestions = (): Question[] => {
  const allFractions = generateSimpleFractions();
  return allFractions.map(correctAnswer => {
    const options = new Set<string>([`${correctAnswer.numerator}/${correctAnswer.denominator}`]);
    
    // Generate 3 unique incorrect options
    while (options.size < 4) {
      const randomFraction = allFractions[Math.floor(Math.random() * allFractions.length)];
      options.add(`${randomFraction.numerator}/${randomFraction.denominator}`);
    }
    
    const parsedOptions = Array.from(options).map(s => {
      const [n, d] = s.split('/');
      return { numerator: parseInt(n), denominator: parseInt(d) };
    });

    return {
      correctAnswer,
      options: shuffleArray(parsedOptions),
    };
  });
};

// --- Reusable Components ---

/**
 * A component to visually represent a fraction using icons.
 */
const FractionIconVisual: React.FC<{ fraction: Fraction; icon: string; size: number }> = ({ fraction, icon, size }) => {
  const { numerator, denominator } = fraction;
  return (
    <View style={styles.iconVisualContainer}>
      {[...Array(denominator)].map((_, i) => (
        <Text key={i} style={[styles.iconVisual, { fontSize: size, opacity: i < numerator ? 1 : 0.3 }]}>
          {icon}
        </Text>
      ))}
    </View>
  );
};

/**
 * A component to display a fraction numerically with a division bar.
 */
const FractionText: React.FC<{ fraction: Fraction; style?: object }> = ({ fraction, style }) => (
  <View style={styles.fractionTextContainer}>
    <Text style={[styles.fractionNumerator, style]}>{fraction.numerator}</Text>
    <View style={[styles.fractionLine, { backgroundColor: (style as any)?.color || COLORS.text }]} />
    <Text style={[styles.fractionDenominator, style]}>{fraction.denominator}</Text>
  </View>
);


// --- Screen Components ---

const HomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [icon] = useState(() => FRACTION_ICONS[Math.floor(Math.random() * FRACTION_ICONS.length)]);
  
  return (
    <SafeAreaView style={[styles.container, styles.centerContent]}>
      <Text style={styles.title}>Fractions Fun! {icon}</Text>
      <Text style={styles.subtitle}>Let's learn about parts of a whole.</Text>
      <FractionIconVisual fraction={{ numerator: 2, denominator: 5 }} icon={icon} size={40} />
      <TouchableOpacity style={[styles.ctaButton, SHADOW]} onPress={onStart}>
        <Text style={styles.ctaButtonText}>Start Learning</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const PracticeScreen: React.FC<{ onStartQuiz: () => void }> = ({ onStartQuiz }) => {
  const [fractions] = useState(() => generateSimpleFractions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [icon, setIcon] = useState(() => FRACTION_ICONS[Math.floor(Math.random() * FRACTION_ICONS.length)]);
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % fractions.length);
    setIcon(FRACTION_ICONS[Math.floor(Math.random() * FRACTION_ICONS.length)]);
  };

  const currentFraction = fractions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Practice Mode</Text>
      <View style={[styles.quizCard, SHADOW, { flex: 1, justifyContent: 'center' }]}>
        <FractionIconVisual fraction={currentFraction} icon={icon} size={50} />
        <FractionText fraction={currentFraction} style={{ fontSize: 72, marginTop: 30 }} />
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.ctaButton, SHADOW, { flex: 1, marginRight: 10 }]} onPress={handleNext}>
          <Text style={styles.ctaButtonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, SHADOW, { flex: 1 }]} onPress={onStartQuiz}>
          <Text style={styles.secondaryButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const QuizScreen: React.FC<{ onQuizComplete: (score: number, total: number) => void }> = ({ onQuizComplete }) => {
  const [questions] = useState(() => generateQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Fraction | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [icon, setIcon] = useState(() => FRACTION_ICONS[Math.floor(Math.random() * FRACTION_ICONS.length)]);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    scaleAnim.setValue(0.5);
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    setIcon(FRACTION_ICONS[Math.floor(Math.random() * FRACTION_ICONS.length)]);
  }, [currentIndex, scaleAnim]);

  const handleOptionPress = (option: Fraction) => {
    if (selectedOption) return;

    const currentQuestion = questions[currentIndex];
    const correct = option.numerator === currentQuestion.correctAnswer.numerator && option.denominator === currentQuestion.correctAnswer.denominator;
    
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
  const progress = (currentIndex + 1) / questions.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.quizProgressText}>{`Question ${currentIndex + 1} of ${questions.length}`}</Text>
      
      <Animated.View style={[styles.quizCard, SHADOW, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.subtitle}>Which fraction is this?</Text>
        <FractionIconVisual fraction={currentQuestion.correctAnswer} icon={icon} size={50} />
      </Animated.View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption && option.numerator === selectedOption.numerator && option.denominator === selectedOption.denominator;
          const isTheCorrectAnswer = option.numerator === currentQuestion.correctAnswer.numerator && option.denominator === currentQuestion.correctAnswer.denominator;
          
          const buttonStyle: (ViewStyle | object)[] = [styles.optionButton, SHADOW];
          if (isSelected) {
            buttonStyle.push(isCorrect ? styles.correctOption : styles.incorrectOption);
          } else if (selectedOption && isTheCorrectAnswer) {
            buttonStyle.push(styles.correctOption);
          }

          return (
            <TouchableOpacity key={index} style={buttonStyle} onPress={() => handleOptionPress(option)} disabled={!!selectedOption}>
              <FractionText fraction={option} style={{ fontSize: 28, color: (selectedOption && !isTheCorrectAnswer) ? COLORS.lightText : COLORS.text }} />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const ScoreScreen: React.FC<{ score: number; total: number; onTryAgain: () => void; onBackToHome: () => void }> = ({ score, total, onTryAgain, onBackToHome }) => {
  const percentage = (score / total) * 100;
  const message = percentage === 100 ? 'Perfect!' : percentage >= 70 ? 'Great Job!' : 'Good Try!';
  const emoji = percentage === 100 ? '🏆' : percentage >= 70 ? '🎉' : '👍';

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
const FractionsGame: React.FC = () => {
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

export default FractionsGame;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
  },
  ctaButtonText: {
    color: COLORS.lightText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.lightText,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  quizCard: {
    backgroundColor: COLORS.card,
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 12,
    width: '100%',
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  quizProgressText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    backgroundColor: COLORS.card,
    width: '48%',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  correctOption: { backgroundColor: COLORS.correct },
  incorrectOption: { backgroundColor: COLORS.incorrect },
  scoreEmoji: { fontSize: 80, marginBottom: 20 },
  scoreText: { fontSize: 24, color: COLORS.text, marginTop: 20 },
  scoreValue: { fontSize: 48, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 40 },
  // Fraction Visual Styles
  iconVisualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  iconVisual: {
    marginHorizontal: 2,
  },
  // Fraction Text Styles
  fractionTextContainer: { 
    alignItems: 'center', 
    marginHorizontal: 10 
  },
  fractionNumerator: { 
    fontWeight: 'bold' 
  },
  fractionLine: { 
    height: 3, 
    width: '100%', 
    marginVertical: 2,
    minWidth: 30,
  },
  fractionDenominator: { 
    fontWeight: 'bold' 
  },
});
