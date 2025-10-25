import React, { useState, useEffect, useCallback } from 'react';
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

// --- Lesson Content Component ---
interface Topic {
  key: 'percentToFrac' | 'fracToPercent' | 'percentToDec' | 'decToPercent' | 'percentOfNum';
  name: string;
}

const LessonScreen = ({ topic, onBack }: { topic: Topic, onBack: () => void }) => {
  const [example, setExample] = useState({ q: '', a: '' });

  const generateExample = useCallback(() => {
    let newExample = { q: '', a: '' };
    switch (topic.key) {
      case 'percentToFrac': {
        const percents = [10, 20, 25, 30, 40, 50, 60, 75, 80, 90];
        const p = percents[Math.floor(Math.random() * percents.length)];
        const divisor = gcd(p, 100);
        newExample = { q: `${p}%`, a: `${p}/100  ➜  ${p/divisor}/${100/divisor}` };
        break;
      }
      case 'fracToPercent': {
        const fractions = [{n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4}, {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 10}];
        const f = fractions[Math.floor(Math.random() * fractions.length)];
        const result = (f.n / f.d) * 100;
        newExample = { q: `${f.n}/${f.d}`, a: `${f.n} ÷ ${f.d} = ${f.n/f.d}\n${f.n/f.d} × 100 = ${result}%` };
        break;
      }
      case 'percentToDec': {
        const p = Math.floor(Math.random() * 99) + 1;
        newExample = { q: `${p}%`, a: `${p} ÷ 100 = ${p/100}` };
        break;
      }
      case 'decToPercent': {
        const d = parseFloat((Math.random()).toFixed(2));
        newExample = { q: `${d}`, a: `${d} × 100 = ${d*100}%` };
        break;
      }
      case 'percentOfNum': {
        const percents = [10, 20, 25, 50, 75];
        const p = percents[Math.floor(Math.random() * percents.length)];
        const num = (Math.floor(Math.random() * 10) + 1) * 10;
        newExample = { q: `${p}% of ${num}`, a: `${p/100} × ${num} = ${(p/100)*num}` };
        break;
      }
    }
    setExample(newExample);
  }, [topic.key]);

  useEffect(() => {
    generateExample();
  }, [generateExample]);

  const explanation = {
      percentToFrac: 'To convert a percentage to a fraction, write the percentage as a fraction over 100, then simplify if possible.',
      fracToPercent: 'To convert a fraction to a percentage, divide the top number by the bottom number, then multiply the result by 100.',
      percentToDec: 'To convert a percentage to a decimal, divide the percentage by 100 (or move the decimal point two places to the left).',
      decToPercent: 'To convert a decimal to a percentage, multiply the decimal by 100 (or move the decimal point two places to the right).',
      percentOfNum: 'To find the percentage of a number, convert the percentage to a decimal, then multiply it by the number.'
  }[topic.key] || '';

  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>‹ Back to Topics</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.lessonContainer}>
            <Text style={styles.title}>{topic.name}</Text>
            <View style={styles.lessonBox}>
                <Text style={styles.lessonExplanation}>{explanation}</Text>
            </View>
            <Text style={styles.exampleTitle}>Example</Text>
            <View style={styles.exampleBox}>
                <Text style={styles.exampleQuestion}>{example.q}</Text>
                <Text style={styles.exampleAnswer}>{example.a}</Text>
            </View>
            <TouchableOpacity style={styles.exampleButton} onPress={generateExample}>
                <Text style={styles.exampleButtonText}>Show Another Example</Text>
            </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
};


// --- Main App Component ---
const PercentageGame = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [animation] = useState(new Animated.Value(1));

  const [mode, setMode] = useState<'menu' | 'learn' | 'test'>('menu');
  const [learnTopic, setLearnTopic] = useState<any>(null);

  const ALL_TOPICS = [
    { key: 'percentToFrac', name: 'Percentage to Fraction' },
    { key: 'fracToPercent', name: 'Fraction to Percentage' },
    { key: 'percentToDec', name: 'Percentage to Decimal' },
    { key: 'decToPercent', name: 'Decimal to Percentage' },
    { key: 'percentOfNum', name: 'Percentage of a Number' },
  ];

  const generateQuestion = () => {
    // This function is now only for Test mode
    const types = ALL_TOPICS.map(t => t.key);
    const questionType = types[Math.floor(Math.random() * types.length)];
    
    let question;

    const generateNumericOptions = (correct: number) => {
        const options = new Set<number>([correct]);
        while (options.size < 4) {
            const wrongAdjustment = (Math.random() - 0.5) * 20;
            let wrongAnswer = Math.round(correct + wrongAdjustment);
            if(wrongAnswer < 0) wrongAnswer = Math.abs(wrongAnswer);
            if (!options.has(wrongAnswer)) {
                options.add(wrongAnswer);
            }
        }
        return shuffleArray(Array.from(options));
    };

    switch (questionType) {
      case 'percentToFrac': {
        const percents = [10, 20, 25, 40, 50, 60, 75, 80];
        const p = percents[Math.floor(Math.random() * percents.length)];
        const divisor = gcd(p, 100);
        const correctAnswer = `${p/divisor}/${100/divisor}`;
        
        const options = new Set<string>([correctAnswer]);
        while(options.size < 4) {
            const wrongNum = Math.floor(Math.random() * 9) + 1;
            const wrongDen = Math.floor(Math.random() * 9) + 2;
            const wrongDivisor = gcd(wrongNum, wrongDen);
            options.add(`${wrongNum/wrongDivisor}/${wrongDen/wrongDivisor}`);
        }
        question = { type: 'percentToFrac', text: `What is ${p}% as a fraction?`, correctAnswer, options: shuffleArray(Array.from(options)) };
        break;
      }
      case 'fracToPercent': {
        const fractions = [{n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4}, {n: 1, d: 5}, {n: 2, d: 5}];
        const f = fractions[Math.floor(Math.random() * fractions.length)];
        const correctAnswer = (f.n / f.d) * 100;
        question = { type: 'fracToPercent', text: `What is ${f.n}/${f.d} as a percentage?`, correctAnswer: `${correctAnswer}%`, options: shuffleArray([`${correctAnswer}%`, `${correctAnswer/2}%`, `${correctAnswer*2}%`, `${Math.round(correctAnswer/3)}%`]) };
        break;
      }
      case 'percentToDec': {
        const p = Math.floor(Math.random() * 99) + 1;
        const correctAnswer = p / 100;
        question = { type: 'percentToDec', text: `What is ${p}% as a decimal?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      case 'decToPercent': {
        const d = parseFloat((Math.random()).toFixed(2));
        const correctAnswer = `${d * 100}%`;
        question = { type: 'decToPercent', text: `What is ${d} as a percentage?`, correctAnswer, options: shuffleArray([correctAnswer, `${d*10}%`, `${d/10}%`, `${d*1000}%`]) };
        break;
      }
      case 'percentOfNum': {
        const percents = [10, 20, 25, 50, 75];
        const p = percents[Math.floor(Math.random() * percents.length)];
        const num = (Math.floor(Math.random() * 10) + 1) * 10;
        const correctAnswer = (p / 100) * num;
        question = { type: 'percentOfNum', text: `What is ${p}% of ${num}?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
        break;
      }
      default: {
        const p = Math.floor(Math.random() * 99) + 1;
        const correctAnswer = p / 100;
        question = { type: 'percentToDec', text: `What is ${p}% as a decimal?`, correctAnswer, options: generateNumericOptions(correctAnswer) };
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

  const startLearning = (topic: any) => {
    setLearnTopic(topic);
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
    const { options } = currentQuestion;

    return (
        <View style={styles.multipleChoiceContainer}>
            {options.map((option: number | string, index: number) => (
                <TouchableOpacity key={index} style={styles.numberButton} onPress={() => handleAnswer(option)}>
                    <Text style={styles.numberText}>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
  };

  // --- RENDER METHODS ---
  if (mode === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcomeContainer}>
            <Text style={styles.title}>Percentage Power</Text>
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
  
  if (mode === 'learn') {
    if (learnTopic) {
        return <LessonScreen topic={learnTopic} onBack={() => setLearnTopic(null)} />;
    }
    return (
      <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <ScrollView contentContainerStyle={styles.menuContainer}>
              <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
                  <Text style={styles.backButtonText}>‹ Home</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Practice Topics</Text>
              {ALL_TOPICS.map(topic => (
                  <TouchableOpacity key={topic.key} style={styles.topicButton} onPress={() => startLearning(topic)}>
                      <Text style={styles.topicButtonText}>{topic.name}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </SafeAreaView>
    )
  }

  // --- Render Test Screen ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.scoreContainer}><Text style={styles.scoreLabel}>Score</Text><Text style={styles.scoreValue}>{score}</Text></View>
        <View style={styles.levelContainer}><Text style={styles.levelLabel}>Level</Text><Text style={styles.levelValue}>{level}</Text></View>
        <View style={styles.streakContainer}><Text style={styles.streakLabel}>Streak</Text><Text style={styles.streakValue}>🔥 {streak}</Text></View>
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
        <Text style={styles.backButtonText}>‹ Back to Menu</Text>
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

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${(score / (level * 50)) * 100}%` }]} /></View>
        <Text style={styles.progressText}>{score} / {level * 50} to Level {level + 1}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#004D40' }, // Dark Teal
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuButton: {
    backgroundColor: '#00796B', // Teal
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
    color: '#B2DFDB', // Light Teal
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  scoreContainer: { alignItems: 'center' },
  scoreLabel: { color: '#B2DFDB', fontSize: 14 },
  scoreValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  levelContainer: { alignItems: 'center' },
  levelLabel: { color: '#B2DFDB', fontSize: 14 },
  levelValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  streakContainer: { alignItems: 'center' },
  streakLabel: { color: '#B2DFDB', fontSize: 14 },
  streakValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 15,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    color: '#80CBC4', // Lighter Teal
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
  multipleChoiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  numberButton: {
    backgroundColor: '#00796B', // Teal
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
  progressFill: { height: '100%', backgroundColor: '#80CBC4', borderRadius: 6 },
  progressText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  // New Styles for Lesson Screen
  lessonContainer: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lessonBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  lessonExplanation: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
  },
  exampleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    marginLeft: 10,
  },
  exampleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  exampleQuestion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 15,
  },
  exampleAnswer: {
    fontSize: 20,
    color: '#00796B',
    lineHeight: 30,
  },
  exampleButton: {
    backgroundColor: '#00796B',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  exampleButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PercentageGame;
