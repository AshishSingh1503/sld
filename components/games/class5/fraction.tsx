import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Svg, Circle, Path, G } from 'react-native-svg';

// --- Constants ---
const COLORS = {
  primary: '#8E44AD', // Purple for this module
  secondary: '#9B59B6',
  background: '#F4ECF7',
  card: '#FFFFFF',
  text: '#34495E',
  lightText: '#7F8C8D',
  white: '#FFFFFF',
  headerText: '#5B2C6F',
  correct: '#2ECC71',
  incorrect: '#E74C3C',
};

// --- Type Definitions ---
type ScreenType = 'hub' | 'compare' | 'decimal' | 'equivalent' | 'likeUnlike';
type Fraction = { num: number; den: number };
type HubProps = {
    onSelect: (screen: ScreenType) => void;
};
type ScreenProps = {
    onBack: () => void;
};
type Feedback = {
    message: string;
    type: 'correct' | 'incorrect';
};

// --- Reusable Components ---
const ModuleCard: React.FC<{title: string, icon: string, description: string, onPress: () => void}> = ({ title, icon, description, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const AppButton: React.FC<{title: string, onPress: () => void, disabled?: boolean, style?: object}> = ({ title, onPress, disabled, style }) => (
    <TouchableOpacity style={[styles.button, style, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled}>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const FeedbackIndicator: React.FC<Feedback> = ({ message, type }) => (
  <View style={[styles.feedbackContainer, { backgroundColor: type === 'correct' ? COLORS.correct : COLORS.incorrect }]}>
    <Text style={styles.feedbackText}>{message}</Text>
  </View>
);

// --- Visual Fraction Component ---
const FractionPie: React.FC<{fraction: Fraction, size?: number}> = ({ fraction, size = 100 }) => {
    const { num, den } = fraction;
    const radius = size / 2;
    const paths = [];

    for (let i = 0; i < den; i++) {
        const angle = (i / den) * 360;
        const nextAngle = ((i + 1) / den) * 360;
        const startRad = (angle - 90) * Math.PI / 180;
        const endRad = (nextAngle - 90) * Math.PI / 180;
        const x1 = radius + radius * Math.cos(startRad);
        const y1 = radius + radius * Math.sin(startRad);
        const x2 = radius + radius * Math.cos(endRad);
        const y2 = radius + radius * Math.sin(endRad);
        const largeArcFlag = (nextAngle - angle) > 180 ? 1 : 0;
        
        const d = `M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
        paths.push(
            <Path
                key={i}
                d={d}
                fill={i < num ? COLORS.secondary : '#EAECEE'}
                stroke={COLORS.lightText}
                strokeWidth={0.5}
            />
        );
    }

    return (
        <View style={styles.fractionContainer}>
            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
                {paths}
            </Svg>
            <Text style={styles.fractionText}>{num}/{den}</Text>
        </View>
    );
};

// --- Screen Components ---

const HubScreen: React.FC<HubProps> = ({ onSelect }) => (
    <View>
        <Text style={styles.mainHeader}>Fun with Fractions</Text>
        <Text style={styles.introText}>Explore, compare, and convert fractions and decimals!</Text>
        <ModuleCard title="Compare Fractions" icon="<> " description="Which fraction is bigger?" onPress={() => onSelect('compare')} />
        <ModuleCard title="Like & Unlike Fractions" icon="🆚" description="Learn about fraction families." onPress={() => onSelect('likeUnlike')} />
        <ModuleCard title="Decimal & Fractions" icon="⇌" description="Convert using money, length, and weight." onPress={() => onSelect('decimal')} />
        <ModuleCard title="Equivalent Fractions" icon="=" description="Find fractions that are the same." onPress={() => onSelect('equivalent')} />
    </View>
);

const CompareFractionsScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [fractions, setFractions] = useState<[Fraction, Fraction]>([{num: 1, den: 2}, {num: 1, den: 3}]);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const generateFractions = () => {
        setFeedback(null);
        let f1 = { num: Math.ceil(Math.random() * 4), den: Math.ceil(Math.random() * 4) + 4 };
        let f2 = { num: Math.ceil(Math.random() * 4), den: Math.ceil(Math.random() * 4) + 4 };
        while (f1.num / f1.den === f2.num / f2.den) {
            f2 = { num: Math.ceil(Math.random() * 4), den: Math.ceil(Math.random() * 4) + 4 };
        }
        setFractions([f1, f2]);
    };

    useEffect(generateFractions, []);

    const handleAnswer = (op: '>' | '<' | '=') => {
        const [f1, f2] = fractions;
        const val1 = f1.num / f1.den;
        const val2 = f2.num / f2.den;
        let isCorrect = false;
        if ((op === '>' && val1 > val2) || (op === '<' && val1 < val2) || (op === '=' && val1 === val2)) {
            isCorrect = true;
        }

        if (isCorrect) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(generateFractions, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Try again!' });
            setTimeout(() => setFeedback(null), 2000);
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back to Menu</Text></TouchableOpacity>
            <Text style={styles.sectionHeader}>Compare the Fractions</Text>
            <View style={styles.compareContainer}>
                <FractionPie fraction={fractions[0]} size={120} />
                <View style={styles.compareOptions}>
                    <AppButton title=">" onPress={() => handleAnswer('>')} style={styles.compareButton} />
                    <AppButton title="<" onPress={() => handleAnswer('<')} style={styles.compareButton} />
                    <AppButton title="=" onPress={() => handleAnswer('=')} style={styles.compareButton} />
                </View>
                <FractionPie fraction={fractions[1]} size={120} />
            </View>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
        </View>
    );
};

const LikeUnlikeScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [fractions, setFractions] = useState<[Fraction, Fraction]>([{num: 1, den: 4}, {num: 3, den: 4}]);
    const [isLike, setIsLike] = useState(true);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const generateFractions = () => {
        setFeedback(null);
        const shouldBeLike = Math.random() > 0.5;
        const den1 = Math.floor(Math.random() * 5) + 3; // 3-7
        const num1 = Math.ceil(Math.random() * (den1 - 1));
        
        let den2, num2;
        if (shouldBeLike) {
            den2 = den1;
            num2 = Math.ceil(Math.random() * (den1 - 1));
            while (num1 === num2) {
                num2 = Math.ceil(Math.random() * (den1 - 1));
            }
        } else {
            den2 = Math.floor(Math.random() * 5) + 3;
            while (den1 === den2) {
                den2 = Math.floor(Math.random() * 5) + 3;
            }
            num2 = Math.ceil(Math.random() * (den2 - 1));
        }
        
        setFractions([{num: num1, den: den1}, {num: num2, den: den2}]);
        setIsLike(shouldBeLike);
    };

    useEffect(generateFractions, []);

    const handleAnswer = (answer: boolean) => {
        if (answer === isLike) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(generateFractions, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: `These are ${isLike ? 'Like' : 'Unlike'} fractions.` });
            setTimeout(generateFractions, 2000);
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back to Menu</Text></TouchableOpacity>
            <Text style={styles.sectionHeader}>Like & Unlike Fractions</Text>
            <Text style={styles.explanationText}><Text style={{fontWeight: 'bold'}}>Like fractions</Text> have the same denominator. <Text style={{fontWeight: 'bold'}}>Unlike fractions</Text> have different denominators.</Text>
            <View style={styles.compareContainer}>
                <FractionPie fraction={fractions[0]} size={120} />
                <FractionPie fraction={fractions[1]} size={120} />
            </View>
            <Text style={styles.questionText}>Are these Like or Unlike fractions?</Text>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsContainer}>
                <AppButton title="Like" onPress={() => handleAnswer(true)} disabled={!!feedback} />
                <AppButton title="Unlike" onPress={() => handleAnswer(false)} disabled={!!feedback} />
            </View>
        </View>
    );
};

const DecimalFractionsScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const problems = [
        { context: 'Money', value: 0.50, unit: 'rupee', fraction: '1/2' },
        { context: 'Money', value: 0.25, unit: 'rupee', fraction: '1/4' },
        { context: 'Length', value: 0.5, unit: 'm', fraction: '1/2' },
        { context: 'Weight', value: 0.5, unit: 'kg', fraction: '1/2' },
        { context: 'Volume', value: 0.2, unit: 'L', fraction: '1/5' },
        { context: 'Length', value: 0.1, unit: 'm', fraction: '1/10' },
    ];

    const [problem, setProblem] = useState(problems[0]);
    const [options, setOptions] = useState<string[]>([]);
    const [isDecimalToFraction, setIsDecimalToFraction] = useState(true);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const generateQuestion = () => {
        setFeedback(null);
        const newProblem = problems[Math.floor(Math.random() * problems.length)];
        const convertDir = Math.random() > 0.5;
        setProblem(newProblem);
        setIsDecimalToFraction(convertDir);

        const correctAnswer = convertDir ? `${newProblem.fraction} ${newProblem.unit}` : `${newProblem.value.toFixed(2)} ${newProblem.unit}`;
        
        const otherOptions: string[] = [];
        while(otherOptions.length < 2) {
            const randomProblem = problems[Math.floor(Math.random() * problems.length)];
            const randomOption = convertDir ? `${randomProblem.fraction} ${randomProblem.unit}` : `${randomProblem.value.toFixed(2)} ${randomProblem.unit}`;
            if (randomOption !== correctAnswer && !otherOptions.includes(randomOption)) {
                otherOptions.push(randomOption);
            }
        }
        setOptions([correctAnswer, ...otherOptions].sort(() => 0.5 - Math.random()));
    };

    useEffect(generateQuestion, []);

    const handleAnswer = (answer: string) => {
        const correctAnswer = isDecimalToFraction ? `${problem.fraction} ${problem.unit}` : `${problem.value.toFixed(2)} ${problem.unit}`;
        if (answer === correctAnswer) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(generateQuestion, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: `The right answer is ${correctAnswer}` });
            setTimeout(generateQuestion, 2000);
        }
    };

    const prompt = isDecimalToFraction
        ? `What is ${problem.value.toFixed(2)} ${problem.unit} as a fraction?`
        : `What is ${problem.fraction} ${problem.unit} as a decimal?`;

    return (
        <View>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back to Menu</Text></TouchableOpacity>
            <Text style={styles.sectionHeader}>Decimals & Fractions</Text>
            <View style={styles.practiceBox}>
                <Text style={styles.questionText}>{prompt}</Text>
                 <View style={{height: 20}} />
                {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
                <View style={styles.decimalOptionsContainer}>
                    {options.map(opt => <AppButton key={opt} title={opt} onPress={() => handleAnswer(opt)} disabled={!!feedback} style={styles.decimalButton} />)}
                </View>
            </View>
        </View>
    );
};

const EquivalentFractionsScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const [fractions, setFractions] = useState<[Fraction, Fraction]>([{num: 1, den: 2}, {num: 2, den: 4}]);
    const [areEquivalent, setAreEquivalent] = useState(true);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const generateFractions = () => {
        setFeedback(null);
        const shouldBeEquivalent = Math.random() > 0.5;
        const den1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const num1 = Math.ceil(Math.random() * (den1 - 1));
        const f1 = { num: num1, den: den1 };

        let f2;
        if (shouldBeEquivalent) {
            const multiplier = Math.floor(Math.random() * 3) + 2; // 2-4
            f2 = { num: num1 * multiplier, den: den1 * multiplier };
        } else {
            const den2 = Math.floor(Math.random() * 5) + 2;
            const num2 = Math.ceil(Math.random() * (den2 - 1));
            if (num1 / den1 === num2 / den2) {
                generateFractions(); // Recurse if they are the same value
                return;
            }
            f2 = { num: num2, den: den2 };
        }

        setFractions([f1, f2]);
        setAreEquivalent(shouldBeEquivalent);
    };

    useEffect(generateFractions, []);

    const handleAnswer = (answer: boolean) => {
        if (answer === areEquivalent) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(generateFractions, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: areEquivalent ? 'They are equivalent!' : 'They are not equivalent.' });
            setTimeout(generateFractions, 2000);
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>← Back to Menu</Text></TouchableOpacity>
            <Text style={styles.sectionHeader}>Equivalent Fractions</Text>
            <Text style={styles.explanationText}>Equivalent fractions look different but have the same value.</Text>
            <View style={styles.compareContainer}>
                <FractionPie fraction={fractions[0]} size={120} />
                <FractionPie fraction={fractions[1]} size={120} />
            </View>
            <Text style={styles.questionText}>Are these fractions equivalent?</Text>
            {feedback && <FeedbackIndicator message={feedback.message} type={feedback.type} />}
            <View style={styles.optionsContainer}>
                <AppButton title="Yes" onPress={() => handleAnswer(true)} disabled={!!feedback} />
                <AppButton title="No" onPress={() => handleAnswer(false)} disabled={!!feedback} />
            </View>
        </View>
    );
};


// --- Main App Component ---
const FractionsModule: React.FC = () => {
    const [screen, setScreen] = useState<ScreenType>('hub');

    const renderScreen = () => {
        switch (screen) {
            case 'compare': return <CompareFractionsScreen onBack={() => setScreen('hub')} />;
            case 'likeUnlike': return <LikeUnlikeScreen onBack={() => setScreen('hub')} />;
            case 'decimal': return <DecimalFractionsScreen onBack={() => setScreen('hub')} />;
            case 'equivalent': return <EquivalentFractionsScreen onBack={() => setScreen('hub')} />;
            default: return <HubScreen onSelect={setScreen} />;
        }
    };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderScreen()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FractionsModule;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, flexGrow: 1 },
  mainHeader: { fontSize: 32, fontWeight: 'bold', color: COLORS.headerText, textAlign: 'center', marginBottom: 10 },
  sectionHeader: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginTop: 10, marginBottom: 15 },
  introText: { fontSize: 16, lineHeight: 24, color: COLORS.lightText, textAlign: 'center', marginBottom: 30 },
  explanationText: { fontSize: 16, lineHeight: 24, color: COLORS.text, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 15, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  cardIcon: { fontSize: 30, marginRight: 20 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  cardDescription: { fontSize: 14, color: COLORS.lightText, marginTop: 2 },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  backButtonText: { fontSize: 16, color: COLORS.secondary, fontWeight: '600' },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },
  disabledButton: { backgroundColor: '#D2B4DE' },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  feedbackContainer: { padding: 15, borderRadius: 10, marginVertical: 20 },
  feedbackText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  fractionContainer: { alignItems: 'center', marginHorizontal: 10 },
  fractionText: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  compareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 200,
  },
  compareOptions: {
    alignItems: 'center',
  },
  compareButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  practiceBox: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 15,
  },
  decimalOptionsContainer: {
      alignItems: 'center',
  },
  decimalButton: {
      width: '80%',
      marginVertical: 8,
  }
});
