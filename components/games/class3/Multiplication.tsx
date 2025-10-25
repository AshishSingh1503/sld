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
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Color Palette ---
const COLORS = {
  primary: '#4A90E2', // Bright Blue
  secondary: '#50E3C2', // Aqua Green
  background: '#F9F9F9', // Light Gray
  card: '#FFFFFF',
  text: '#333333',
  lightText: '#FFFFFF',
  correct: '#7ED321', // Green
  incorrect: '#D0021B', // Red
  white: '#FFFFFF',
  gray: '#E0E0E0',
};

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.15,
  shadowRadius: 3.84,
  elevation: 5,
};

// --- Types ---
interface QuizQuestion {
  question: string;
  options: number[];
  correctAnswer: number;
}

// --- Helper Functions ---
/**
 * Shuffles an array in place.
 * @param {Array} array The array to shuffle.
 * @returns {Array} The shuffled array.
 */
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Generates quiz questions for a given multiplication table.
 * @param {number} tableNum The number for the multiplication table.
 * @returns {Array} An array of shuffled question objects.
 */
const generateQuestions = (tableNum: number) => {
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    const correctAnswer = tableNum * i;
    const options = new Set([correctAnswer]);
    // Generate 3 unique incorrect options
    while (options.size < 4) {
      const randomFactor = Math.floor(Math.random() * 10) + 1;
      const incorrectAnswer = tableNum * randomFactor;
      if (incorrectAnswer !== correctAnswer) {
        options.add(incorrectAnswer);
      }
      // Add more randomness to avoid simple multiples
      if (options.size < 4) {
          options.add(correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1));
      }
    }
    questions.push({
      question: `${tableNum} × ${i}`,
      options: shuffleArray(Array.from(options)),
      correctAnswer,
    });
  }
  return shuffleArray(questions);
};


// --- Components ---

/**
 * HomeScreen: The main screen where users select a table.
 */
const HomeScreen = ({ navigation }: { navigation: any }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const titleStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.Text style={[styles.title, titleStyle]}>
        Multiplication Fun! 🎉
      </Animated.Text>
      <Text style={styles.subtitle}>Choose a table to practice</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {[...Array(10)].map((_, i) => {
          const tableNum = i + 1;
          return (
            <TouchableOpacity
              key={tableNum}
              style={[styles.gridButton, SHADOW]}
              onPress={() => navigation.navigate('Table', { tableNum })}
            >
              <Text style={styles.gridButtonText}>{tableNum}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * TableScreen: Displays the selected multiplication table.
 */
const TableScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { tableNum } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <Text style={styles.title}>Table of {tableNum}</Text>
        <ScrollView contentContainerStyle={styles.tableContainer}>
          {[...Array(10)].map((_, i) => (
            <View key={i} style={[styles.tableRow, SHADOW]}>
              <Text style={styles.tableText}>
                {tableNum} × {i + 1} = {tableNum * (i + 1)}
              </Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[styles.ctaButton, SHADOW]}
          onPress={() => navigation.navigate('Quiz', { tableNum })}
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
const QuizScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { tableNum } = route.params;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    setQuestions(generateQuestions(tableNum));
  }, [tableNum]);
  
  useEffect(() => {
      scaleAnim.setValue(0.5);
      Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
      }).start();
  }, [currentIndex]);


  const handleOptionPress = (option: any) => {
    if (selectedOption !== null) return; // Prevent multiple selections

    const currentQuestion = questions[currentIndex];
    const correct = option === currentQuestion.correctAnswer;
    
    setSelectedOption(option);
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        navigation.replace('Score', {
          score: correct ? score + 1 : score,
          total: questions.length,
          tableNum: tableNum,
        });
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
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.quizProgressText}>{`Question ${currentIndex + 1} of ${questions.length}`}</Text>
      
      <Animated.View style={[styles.quizCard, SHADOW, {transform: [{scale: scaleAnim}]}]}>
        <Text style={styles.quizQuestionText}>{currentQuestion.question} = ?</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;
          let buttonStyle: any = [styles.optionButton, SHADOW];
          if (isSelected) {
            buttonStyle = [styles.optionButton, SHADOW, isCorrect ? styles.correctOption : styles.incorrectOption];
          } else if (selectedOption !== null && option === currentQuestion.correctAnswer) {
            buttonStyle = [styles.optionButton, SHADOW, styles.correctOption];
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
const ScoreScreen = ({ route, navigation }: { route: any, navigation: any }) => {
  const { score, total, tableNum } = route.params;
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
    emoji = '�';
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
          onPress={() => navigation.replace('Quiz', { tableNum })}
        >
          <Text style={styles.ctaButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, {marginTop: 15}]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- App Navigation ---
const Stack = createNativeStackNavigator();

const MultiplicationApp = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Table" component={TableScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Score" component={ScoreScreen} />
    </Stack.Navigator>
  );
};

export default MultiplicationApp;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 32,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  gridButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.secondary,
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
    width: '80%',
    alignItems: 'center',
  },
  tableText: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    padding: 20,
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
    height: 10,
    width: '100%',
    backgroundColor: COLORS.gray,
    borderRadius: 5,
    marginTop: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
  },
  quizProgressText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  quizCard: {
    backgroundColor: COLORS.card,
    padding: 40,
    borderRadius: 25,
    marginVertical: 30,
    alignItems: 'center',
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
  },
  optionText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  correctOption: {
    backgroundColor: COLORS.correct,
  },
  incorrectOption: {
    backgroundColor: COLORS.incorrect,
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
    padding: 15,
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
