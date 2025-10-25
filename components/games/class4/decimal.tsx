import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Helper Functions ---
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

// --- Main App Component ---
const DecimalGame = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [animation] = useState(new Animated.Value(1));
  const [userOrder, setUserOrder] = useState<number[]>([]);

  const [mode, setMode] = useState<'menu' | 'learn' | 'test'>('menu');
  const [learnTopic, setLearnTopic] = useState<string | null>(null);

  const ALL_TOPICS = [
    { key: 'compare', name: 'Compare Numbers' },
    { key: 'order', name: 'Order Decimals' },
    { key: 'round', name: 'Rounding' },
    { key: 'place_value', name: 'Place Value' },
    { key: 'add', name: 'Addition' },
    { key: 'subtract', name: 'Subtraction' },
    { key: 'multiply', name: 'Multiplication' },
    { key: 'divide', name: 'Division' },
    { key: 'fractionToDecimal', name: 'Fraction to Decimal' },
    { key: 'decimalToFraction', name: 'Decimal to Fraction' },
  ];

  useEffect(() => {
    if (currentQuestion?.type === 'order' && userOrder.length === currentQuestion.numbers.length) {
      handleAnswer(userOrder);
    }
  }, [userOrder]);

  const generateDecimal = (decimalPlaces: number, maxWhole = 9) => {
    const wholeNumber = Math.floor(Math.random() * (maxWhole + 1));
    const decimal = Math.floor(Math.random() * Math.pow(10, decimalPlaces));
    return parseFloat(`${wholeNumber}.${decimal.toString().padStart(decimalPlaces, '0')}`);
  };

  const generateQuestion = () => {
    setUserOrder([]);
    let questionType = '';

    if (mode === 'learn' && learnTopic) {
      questionType = learnTopic;
    } else {
      const types = ALL_TOPICS.map(t => t.key);
      questionType = types[Math.floor(Math.random() * types.length)];
    }
    
    let question;

    const generateNumericOptions = (correct: number) => {
        const options = new Set<number>([correct]);
        while (options.size < 4) {
            const wrongAdjustment = (Math.random() - 0.5) * 2;
            let wrongAnswer = parseFloat((correct + wrongAdjustment).toFixed(2));
            if(wrongAnswer < 0) wrongAnswer = Math.abs(wrongAnswer);
            if (!options.has(wrongAnswer)) {
                options.add(wrongAnswer);
            }
        }
        return shuffleArray(Array.from(options));
    };

    switch (questionType) {
      case 'fractionToDecimal': {
        const denominators = [2, 4, 5, 10, 20];
        const den = denominators[Math.floor(Math.random() * denominators.length)];
        const num = Math.floor(Math.random() * (den - 1)) + 1;
        const correctAnswer = parseFloat((num / den).toFixed(2));
        question = { type: 'fractionToDecimal', text: `What is ${num}/${den} as a decimal?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      case 'decimalToFraction': {
        const decimals = [0.5, 0.25, 0.75, 0.2, 0.4, 0.6, 0.8, 0.1];
        const dec = decimals[Math.floor(Math.random() * decimals.length)];
        const len = dec.toString().length - 2;
        let numerator = dec * Math.pow(10, len);
        let denominator = Math.pow(10, len);
        const divisor = gcd(numerator, denominator);
        const correctAnswer = `${numerator / divisor}/${denominator / divisor}`;
        
        const options = new Set<string>([correctAnswer]);
        while(options.size < 4) {
            const wrongNum = Math.floor(Math.random() * 9) + 1;
            const wrongDen = Math.floor(Math.random() * 9) + 2;
            const wrongDivisor = gcd(wrongNum, wrongDen);
            options.add(`${wrongNum/wrongDivisor}/${wrongDen/wrongDivisor}`);
        }
        question = { type: 'decimalToFraction', text: `What is ${dec} as a fraction?`, correctAnswer, options: shuffleArray(Array.from(options)) };
        break;
      }
      // ... other cases remain the same
      case 'compare': {
        const num1 = generateDecimal(2); let num2 = generateDecimal(2);
        while (num1 === num2) { num2 = generateDecimal(2); }
        question = { type: 'compare', numbers: [num1, num2], text: 'Which number is greater?', correctAnswer: Math.max(num1, num2) };
        break;
      }
      case 'order': {
        const numbers = Array.from({length: 4}, () => generateDecimal(1));
        const correctAnswer = [...numbers].sort((a, b) => a - b);
        question = { type: 'order', numbers: shuffleArray(numbers), text: 'Tap the numbers in ascending order', correctAnswer };
        break;
      }
      case 'round': {
        const numToRound = generateDecimal(2);
        const correctAnswer = Math.round(numToRound);
        question = { type: 'round', text: `Round ${numToRound} to the nearest whole number`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      case 'place_value': {
        const decimal = generateDecimal(2);
        const places = ['ones', 'tenths', 'hundredths'];
        const selectedPlace = places[Math.floor(Math.random() * places.length)];
        const decimalStr = decimal.toFixed(2);
        const placeIndex = selectedPlace === 'ones' ? 0 : selectedPlace === 'tenths' ? 2 : 3;
        const correctAnswer = parseInt(decimalStr[placeIndex], 10);
        question = { type: 'place_value', text: `What digit is in the ${selectedPlace} place of ${decimal}?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      case 'add': {
        const num1 = generateDecimal(2, 20); const num2 = generateDecimal(2, 20);
        const correctAnswer = parseFloat((num1 + num2).toFixed(2));
        question = { type: 'add', text: `What is ${num1} + ${num2}?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      case 'subtract': {
        const num1 = generateDecimal(2, 20); const num2 = generateDecimal(2, 20);
        const larger = Math.max(num1, num2); const smaller = Math.min(num1, num2);
        const correctAnswer = parseFloat((larger - smaller).toFixed(2));
        question = { type: 'subtract', text: `What is ${larger} - ${smaller}?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      case 'multiply': {
        const num1 = generateDecimal(1, 9); const num2 = Math.floor(Math.random() * 9) + 2;
        const correctAnswer = parseFloat((num1 * num2).toFixed(2));
        question = { type: 'multiply', text: `What is ${num1} × ${num2}?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      case 'divide': {
        const divisor = Math.floor(Math.random() * 8) + 2;
        const quotient = generateDecimal(1, 5);
        const dividend = parseFloat((divisor * quotient).toFixed(2));
        question = { type: 'divide', text: `What is ${dividend} ÷ ${divisor}?`, correctAnswer: quotient, options: generateNumericOptions(quotient) };
        break;
      }
      default: {
        const nums = [generateDecimal(2), generateDecimal(2)];
        question = { type: 'compare', numbers: nums, text: 'Which number is greater?', correctAnswer: Math.max(...nums) };
        break;
      }
    }
    setCurrentQuestion(question);
  };

  const handleAnswer = (answer: any) => {
    const isCorrect = JSON.stringify(answer) === JSON.stringify(currentQuestion.correctAnswer);
    
    if (isCorrect) {
      if (mode === 'test') {
        setScore(prev => prev + (10 + streak * 2));
        if (score + 10 + streak * 2 >= level * 50) {
          setLevel(prev => prev + 1); setScore(0); setStreak(0);
        }
      }
      setStreak(prev => prev + 1);
      setFeedback('Correct! 🎉');
      Animated.sequence([
        Animated.timing(animation, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(animation, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      setStreak(0);
      setFeedback('Try again! 💪');
      Animated.sequence([
        Animated.timing(animation, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        Animated.timing(animation, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      generateQuestion();
      setFeedback('');
    }, 1500);
  };

  const startLearning = (topicKey: string) => {
    setLearnTopic(topicKey);
    setMode('learn');
    setStreak(0);
    generateQuestion();
  };

  const startTest = () => {
    setMode('test');
    setScore(0);
    setLevel(1);
    setStreak(0);
    generateQuestion();
  };

  const backToMenu = () => {
    setMode('menu');
    setCurrentQuestion(null);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;
    const { type, options, numbers } = currentQuestion;

    if (['round', 'place_value', 'add', 'subtract', 'multiply', 'divide', 'fractionToDecimal', 'decimalToFraction'].includes(type)) {
        return (
            <View style={styles.multipleChoiceContainer}>
                {options.map((option: number | string, index: number) => (
                    <TouchableOpacity key={index} style={styles.numberButton} onPress={() => handleAnswer(option)}>
                        <Text style={styles.numberText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }

    if (type === 'compare') {
        return (
            <View style={styles.compareContainer}>
                {numbers.map((num: number, index: number) => (
                    <TouchableOpacity key={index} style={styles.numberButton} onPress={() => handleAnswer(num)}>
                        <Text style={styles.numberText}>{num}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }

    if (type === 'order') {
        return (
            <View style={styles.orderContainer}>
                <View style={styles.orderDropZone}>
                    {userOrder.map((num, i) => <Text key={i} style={styles.orderText}>{num}</Text>)}
                </View>
                <View style={styles.orderButtonContainer}>
                    {numbers.map((num: number, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.numberButton, userOrder.includes(num) && styles.disabledButton]}
                            onPress={() => setUserOrder(prev => [...prev, num])}
                            disabled={userOrder.includes(num)}>
                            <Text style={styles.numberText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }
    return null;
  };

  // --- RENDER METHODS ---
  if (mode === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcomeContainer}>
            <Text style={styles.title}>Decimal Challenge</Text>
            <Text style={styles.subtitle}>Choose your mode</Text>
            <TouchableOpacity style={styles.menuButton} onPress={() => setMode('learn')}>
                <Text style={styles.menuButtonText}>🧠 Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={startTest}>
                <Text style={styles.menuButtonText}>🏆 Test</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (mode === 'learn' && !learnTopic) {
      return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.menuContainer}>
                <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
                    <Text style={styles.backButtonText}>‹ Home</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Practice Topics</Text>
                {ALL_TOPICS.map(topic => (
                    <TouchableOpacity key={topic.key} style={styles.topicButton} onPress={() => startLearning(topic.key)}>
                        <Text style={styles.topicButtonText}>{topic.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
      )
  }

  // --- Render Learn or Test Screen ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        {mode === 'test' ? (
          <>
            <View style={styles.scoreContainer}><Text style={styles.scoreLabel}>Score</Text><Text style={styles.scoreValue}>{score}</Text></View>
            <View style={styles.levelContainer}><Text style={styles.levelLabel}>Level</Text><Text style={styles.levelValue}>{level}</Text></View>
            <View style={styles.streakContainer}><Text style={styles.streakLabel}>Streak</Text><Text style={styles.streakValue}>🔥 {streak}</Text></View>
          </>
        ) : (
          <View style={styles.learnHeader}>
            <Text style={styles.learnTitle}>
              Practice: {ALL_TOPICS.find(t => t.key === learnTopic)?.name}
            </Text>
            <Text style={styles.streakValue}>🔥 {streak}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={() => mode === 'learn' ? setLearnTopic(null) : backToMenu()}>
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.questionContainer, { transform: [{ scale: animation }] }]}>
        <Text style={styles.questionText}>{currentQuestion?.text}</Text>
        {renderQuestion()}
      </Animated.View>

      {feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {mode === 'test' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${(score / (level * 50)) * 100}%` }]} /></View>
          <Text style={styles.progressText}>{score} / {level * 50} to Level {level + 1}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A237E' },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuButton: {
    backgroundColor: '#3F51B5',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuContainer: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 20,
    color: '#BDBDBD',
    textAlign: 'center',
    marginBottom: 50,
  },
  topicButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topicButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 20 : 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  learnHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  learnTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreContainer: { alignItems: 'center' },
  scoreLabel: { color: '#BDBDBD', fontSize: 14 },
  scoreValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  levelContainer: { alignItems: 'center' },
  levelLabel: { color: '#BDBDBD', fontSize: 14 },
  levelValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  streakContainer: { alignItems: 'center' },
  streakLabel: { color: '#BDBDBD', fontSize: 14 },
  streakValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 15,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    color: '#BBDEFB',
    fontSize: 18,
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 36,
  },
  compareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  multipleChoiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  orderContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  orderDropZone: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    minHeight: 60,
    width: '90%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: '#1E88E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  orderButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  numberButton: {
    backgroundColor: '#3F51B5',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: { backgroundColor: '#546E7A', opacity: 0.6 },
  numberText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  feedbackContainer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  feedbackText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  progressContainer: { padding: 20 },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 6 },
  progressText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});

export default DecimalGame;
