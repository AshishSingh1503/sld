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
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

// --- Configuration ---

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TypeScript Types ---

type MeasurementType = 'length' | 'weight' | 'volume' | 'time';

type Unit = {
  name: string;
  symbol: string;
};

type Measurement = {
  value: number;
  unit: Unit;
};

type TimeValue = {
    hours: number;
    minutes: number;
}

type Question = {
  type: 'conversion' | 'comparison' | 'reading';
  text: string;
  visual: Measurement | [Measurement, Measurement] | TimeValue;
  options: (number | string)[];
  correctAnswer: number | string;
};

type GameState = 'home' | 'topicSelect' | 'quiz' | 'score';

type GameData = {
  topic?: MeasurementType;
  score?: number;
  total?: number;
};

// --- Constants ---
const UNITS = {
  length: { m: { name: 'meter', symbol: 'm' }, cm: { name: 'centimeter', symbol: 'cm' } },
  weight: { kg: { name: 'kilogram', symbol: 'kg' }, g: { name: 'gram', symbol: 'g' } },
  volume: { l: { name: 'liter', symbol: 'L' }, ml: { name: 'milliliter', symbol: 'mL' } },
};

// --- Color Palette ---
const COLORS = {
  primary: '#27AE60', // Nephritis Green
  secondary: '#F1C40F', // Sunflower Yellow
  volume: '#3498DB', // Peter River Blue for Volume
  time: '#8E44AD', // Wisteria for Time
  background: '#ECF0F1', // Clouds White
  card: '#FFFFFF',
  text: '#2C3E50', // Midnight Blue
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

const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateQuestions = (topic: MeasurementType): Question[] => {
  const questions: Question[] = [];
  
  if (topic === 'length') {
    for (let i = 1; i <= 3; i++) {
      questions.push({ type: 'conversion', text: `${i} m = ? cm`, visual: { value: i, unit: UNITS.length.m }, correctAnswer: i * 100, options: shuffleArray([i * 100, i * 10, i * 1000, i + 100])});
    }
  } else if (topic === 'weight') {
    for (let i = 1; i <= 3; i++) {
      questions.push({ type: 'conversion', text: `${i} kg = ? g`, visual: { value: i, unit: UNITS.weight.kg }, correctAnswer: i * 1000, options: shuffleArray([i * 1000, i * 100, i + 1000, 100])});
    }
  } else if (topic === 'volume') {
    for (let i = 1; i <= 3; i++) {
        questions.push({ type: 'conversion', text: `${i} L = ? mL`, visual: { value: i, unit: UNITS.volume.l }, correctAnswer: i * 1000, options: shuffleArray([i * 1000, i * 100, i + 100, 500])});
    }
  } else if (topic === 'time') {
    for (let i = 0; i < 4; i++) {
        const hours = Math.floor(Math.random() * 12) + 1;
        const minutes = (Math.floor(Math.random() * 12)) * 5; // On the 5s
        const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
        const wrongOption1 = `${(hours % 12) + 1}:${minutes.toString().padStart(2, '0')}`;
        const wrongOption2 = `${hours}:${((minutes + 15) % 60).toString().padStart(2, '0')}`;
        questions.push({ type: 'reading', text: 'What time is it?', visual: { hours, minutes }, correctAnswer: timeString, options: shuffleArray([timeString, wrongOption1, wrongOption2, '12:00']) });
    }
  }
  return shuffleArray(questions);
};


// --- Dynamic UI Components ---

const RulerVisual: React.FC<{ measurement: Measurement }> = ({ measurement }) => {
    const valueInCm = measurement.unit.symbol === 'm' ? measurement.value * 100 : measurement.value;
    const percentage = Math.min(valueInCm / 300, 1) * 100; // Max out at 3m for visual clarity
    return (
      <View style={styles.rulerContainer}>
        <View style={styles.ruler}>
          <Text style={styles.rulerMark}>0</Text>
          <Text style={styles.rulerMark}>1m</Text>
          <Text style={styles.rulerMark}>2m</Text>
          <Text style={styles.rulerMark}>3m</Text>
        </View>
        <Animated.View style={[styles.rulerIndicator, { width: `${percentage}%` }]} />
      </View>
    );
  };

const ScaleVisual: React.FC<{ left: Measurement; right: Measurement }> = ({ left, right }) => {
  const leftWeightInG = left.unit.symbol === 'kg' ? left.value * 1000 : left.value;
  const rightWeightInG = right.unit.symbol === 'kg' ? right.value * 1000 : right.value;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let angle = 0;
    if (leftWeightInG > rightWeightInG) angle = -5;
    if (rightWeightInG > leftWeightInG) angle = 5;
    Animated.spring(rotation, { toValue: angle, useNativeDriver: true }).start();
  }, [left, right, rotation, leftWeightInG, rightWeightInG]);

  const animatedStyle = { transform: [{ rotate: rotation.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] }) }] };

  return (
    <View style={styles.scaleContainer}>
      <Animated.View style={[styles.scaleBeam, animatedStyle]}>
        <View style={styles.scalePan}><Text style={styles.scaleText}>{`${left.value}${left.unit.symbol}`}</Text></View>
        <View style={styles.scalePan}><Text style={styles.scaleText}>{`${right.value}${right.unit.symbol}`}</Text></View>
      </Animated.View>
      <View style={styles.scaleBase} />
    </View>
  );
};

const VolumeVisual: React.FC<{ measurement: Measurement }> = ({ measurement }) => {
    const valueInMl = measurement.unit.symbol === 'L' ? measurement.value * 1000 : measurement.value;
    const fillPercentage = Math.min(valueInMl / 3000, 1) * 100; // Max at 3L
  
    return (
      <View style={styles.beaker}>
        <View style={styles.beakerMarkings}>
          <Text style={styles.beakerMarkText}>3L</Text>
          <Text style={styles.beakerMarkText}>2L</Text>
          <Text style={styles.beakerMarkText}>1L</Text>
        </View>
        <Animated.View style={[styles.beakerLiquid, { height: `${fillPercentage}%` }]} />
      </View>
    );
  };
  
const ClockVisual: React.FC<{ time: TimeValue }> = ({ time }) => {
    const size = 200;
    const center = size / 2;
    const hourAngle = (time.hours % 12) * 30 + time.minutes * 0.5;
    const minuteAngle = time.minutes * 6;
  
    const hourHandX = center + 40 * Math.sin(hourAngle * (Math.PI / 180));
    const hourHandY = center - 40 * Math.cos(hourAngle * (Math.PI / 180));
    const minuteHandX = center + 60 * Math.sin(minuteAngle * (Math.PI / 180));
    const minuteHandY = center - 60 * Math.cos(minuteAngle * (Math.PI / 180));
  
    return (
      <Svg height={size} width={size}>
        <Circle cx={center} cy={center} r={size / 2 - 2} stroke={COLORS.text} strokeWidth="4" fill={COLORS.card} />
        {[...Array(12)].map((_, i) => {
            const angle = i * 30 * (Math.PI / 180);
            const x = center + (center - 15) * Math.sin(angle);
            const y = center - (center - 15) * Math.cos(angle);
            return <SvgText key={i} x={x} y={y + 5} fontSize="16" fill={COLORS.text} textAnchor="middle">{i === 0 ? 12 : i}</SvgText>;
        })}
        <Line x1={center} y1={center} x2={hourHandX} y2={hourHandY} stroke={COLORS.text} strokeWidth="6" strokeLinecap="round" />
        <Line x1={center} y1={center} x2={minuteHandX} y2={minuteHandY} stroke={COLORS.text} strokeWidth="4" strokeLinecap="round" />
        <Circle cx={center} cy={center} r="5" fill={COLORS.time} />
      </Svg>
    );
  };


// --- Screen Components ---

const HomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <SafeAreaView style={[styles.container, styles.centerContent]}>
    <Text style={styles.title}>Measurement Masters! 📏</Text>
    <Text style={styles.subtitle}>Learn Length, Weight, Volume & Time</Text>
    <TouchableOpacity style={[styles.ctaButton, SHADOW]} onPress={onStart}>
      <Text style={styles.ctaButtonText}>Let's Go!</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const TopicSelectScreen: React.FC<{ onSelect: (topic: MeasurementType) => void }> = ({ onSelect }) => (
  <SafeAreaView style={[styles.container, styles.centerContent]}>
    <Text style={styles.title}>Choose a Topic</Text>
    <TouchableOpacity style={[styles.topicButton, SHADOW, {borderColor: COLORS.primary}]} onPress={() => onSelect('length')}>
      <Text style={[styles.topicButtonText, {color: COLORS.primary}]}>Length 📏</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.topicButton, SHADOW, {borderColor: COLORS.secondary}]} onPress={() => onSelect('weight')}>
      <Text style={[styles.topicButtonText, {color: COLORS.secondary}]}>Weight ⚖️</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.topicButton, SHADOW, {borderColor: COLORS.volume}]} onPress={() => onSelect('volume')}>
      <Text style={[styles.topicButtonText, {color: COLORS.volume}]}>Volume 💧</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.topicButton, SHADOW, {borderColor: COLORS.time}]} onPress={() => onSelect('time')}>
      <Text style={[styles.topicButtonText, {color: COLORS.time}]}>Time ⏰</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const QuizScreen: React.FC<{ topic: MeasurementType; onQuizComplete: (score: number, total: number) => void }> = ({ topic, onQuizComplete }) => {
  const [questions] = useState(() => generateQuestions(topic));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleOptionPress = (option: number | string) => {
    if (selectedOption) return;
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
      <Text style={styles.title}>{currentQuestion.text}</Text>
      <View style={styles.visualContainer}>
        {topic === 'length' && <RulerVisual measurement={currentQuestion.visual as Measurement} />}
        {topic === 'weight' && <ScaleVisual left={{value: (currentQuestion.visual as Measurement).value, unit: UNITS.weight.kg}} right={{value: 1500, unit: UNITS.weight.g}} />}
        {topic === 'volume' && <VolumeVisual measurement={currentQuestion.visual as Measurement} />}
        {topic === 'time' && <ClockVisual time={currentQuestion.visual as TimeValue} />}
      </View>
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const buttonStyle: (ViewStyle | object)[] = [styles.optionButton, SHADOW];
          if (isSelected) buttonStyle.push(isCorrect ? styles.correctOption : styles.incorrectOption);
          else if (selectedOption && option === currentQuestion.correctAnswer) buttonStyle.push(styles.correctOption);
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
const MeasurementGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('home');
  const [gameData, setGameData] = useState<GameData>({});

  const renderState = () => {
    switch (gameState) {
      case 'home':
        return <HomeScreen onStart={() => setGameState('topicSelect')} />;
      case 'topicSelect':
        return <TopicSelectScreen onSelect={(topic) => {
          setGameData({ topic });
          setGameState('quiz');
        }} />;
      case 'quiz':
        return <QuizScreen topic={gameData.topic!} onQuizComplete={(score, total) => {
          setGameData(prev => ({ ...prev, score, total }));
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
        return <HomeScreen onStart={() => setGameState('topicSelect')} />;
    }
  };

  return <View style={{flex: 1}}>{renderState()}</View>;
};

export default MeasurementGame;

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
  subtitle: { fontSize: 18, color: COLORS.text, textAlign: 'center', marginBottom: 30 },
  ctaButton: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 30, marginTop: 30 },
  ctaButtonText: { color: COLORS.lightText, fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: COLORS.card, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, borderWidth: 2, borderColor: COLORS.primary },
  secondaryButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  topicButton: { backgroundColor: COLORS.card, padding: 25, borderRadius: 20, marginVertical: 10, width: '80%', alignItems: 'center', borderWidth: 3 },
  topicButtonText: { fontSize: 24, fontWeight: 'bold' },
  visualContainer: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', paddingBottom: 20, minHeight: 250 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  optionButton: { backgroundColor: COLORS.card, width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, minHeight: 80, justifyContent: 'center' },
  optionText: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  correctOption: { backgroundColor: COLORS.correct },
  incorrectOption: { backgroundColor: COLORS.incorrect },
  scoreEmoji: { fontSize: 80, marginBottom: 20 },
  scoreText: { fontSize: 24, color: COLORS.text, marginTop: 20 },
  scoreValue: { fontSize: 48, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 40 },
  // Ruler Styles
  rulerContainer: { width: '90%', height: 60, justifyContent: 'center' },
  ruler: { width: '100%', height: 20, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.text, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 },
  rulerMark: { color: COLORS.text, fontWeight: 'bold' },
  rulerIndicator: { position: 'absolute', height: '100%', backgroundColor: COLORS.secondary, borderRadius: 10, opacity: 0.8 },
  // Scale Styles
  scaleContainer: { width: 250, height: 150, alignItems: 'center' },
  scaleBeam: { width: '100%', height: 15, backgroundColor: COLORS.text, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scalePan: { width: 60, height: 60, backgroundColor: COLORS.secondary, borderRadius: 30, justifyContent: 'center', alignItems: 'center', position: 'relative', top: 30 },
  scaleText: { color: COLORS.lightText, fontWeight: 'bold', fontSize: 16 },
  scaleBase: { width: 15, height: 80, backgroundColor: COLORS.text, position: 'absolute', bottom: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  // Volume Styles
  beaker: { width: 150, height: 200, backgroundColor: COLORS.card, borderWidth: 3, borderColor: COLORS.text, borderRadius: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5, justifyContent: 'flex-end', overflow: 'hidden', },
  beakerLiquid: { width: '100%', backgroundColor: COLORS.volume, opacity: 0.8 },
  beakerMarkings: { position: 'absolute', right: -30, top: 0, bottom: 0, justifyContent: 'space-around' },
  beakerMarkText: { color: COLORS.text, fontWeight: 'bold' },
});
