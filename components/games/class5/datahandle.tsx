import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Svg, Path, G, Text as SvgText } from 'react-native-svg';

// --- Constants ---
const COLORS = {
  primary: '#2980B9', // A professional blue
  secondary: '#3498DB',
  background: '#F0F8FF', // Light AliceBlue
  card: '#FFFFFF',
  text: '#34495E',
  lightText: '#7F8C8D',
  white: '#FFFFFF',
  headerText: '#1A5276',
  chartColors: ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6'],
};

// --- Local Navigation ---
type HubProps = {
    onSelect: (screen: ScreenType) => void;
};
type ScreenProps = {
    onBack: () => void;
};
type ScreenType = 'hub' | 'pictograph' | 'barGraph' | 'pieChart';
type DataType = { label: string; value: number };

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

const BackButton: React.FC<{onPress: () => void}> = ({ onPress }) => (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
        <Text style={styles.backButtonText}>← Back to Menu</Text>
    </TouchableOpacity>
);

// --- Chart Components ---

const Pictograph: React.FC<{data: DataType[], symbol: string, scale: number}> = ({ data, symbol, scale }) => (
    <View style={styles.chartContainer}>
        {data.map(item => (
            <View key={item.label} style={styles.pictographRow}>
                <Text style={styles.pictographLabel}>{item.label}</Text>
                <Text style={styles.pictographSymbols}>{symbol.repeat(item.value / scale)}</Text>
            </View>
        ))}
        <Text style={styles.keyText}>Key: {symbol} = {scale}</Text>
    </View>
);

const BarGraph: React.FC<{data: DataType[]}> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    return (
        <View style={styles.chartContainer}>
            <View style={styles.barGraphContainer}>
                {data.map((item, index) => (
                    <View key={item.label} style={styles.barWrapper}>
                        <View style={[styles.bar, { height: `${(item.value / maxValue) * 100}%`, backgroundColor: COLORS.chartColors[index % COLORS.chartColors.length] }]} />
                        <Text style={styles.barLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const PieChart: React.FC<{data: DataType[]}> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;

    const getCoordinates = (percent: number): [number, number] => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <View style={styles.chartContainer}>
            <Svg height="200" width="200" viewBox="-1 -1 2 2">
                <G rotation="-90">
                    {data.map((item, index) => {
                        const percent = item.value / total;
                        const [startX, startY] = getCoordinates(cumulativeAngle);
                        cumulativeAngle += percent;
                        const [endX, endY] = getCoordinates(cumulativeAngle);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                        
                        return <Path key={item.label} d={pathData} fill={COLORS.chartColors[index % COLORS.chartColors.length]} />;
                    })}
                </G>
            </Svg>
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={item.label} style={styles.legendItem}>
                        <View style={[styles.legendColorBox, { backgroundColor: COLORS.chartColors[index % COLORS.chartColors.length] }]} />
                        <Text style={styles.legendLabel}>{item.label} ({item.value})</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};


// --- Screen Components ---

const HubScreen: React.FC<HubProps> = ({ onSelect }) => (
    <View>
        <Text style={styles.mainHeader}>Data Handling</Text>
        <Text style={styles.introText}>Learn how to represent and understand data using different kinds of charts!</Text>
        <ModuleCard title="Pictographs" icon="🍎" description="Telling stories with pictures." onPress={() => onSelect('pictograph')} />
        <ModuleCard title="Bar Graphs" icon="📊" description="Comparing amounts with bars." onPress={() => onSelect('barGraph')} />
        <ModuleCard title="Pie Charts" icon="🥧" description="Seeing parts of a whole." onPress={() => onSelect('pieChart')} />
    </View>
);

const PictographScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const fruitData: DataType[] = [ { label: 'Apple', value: 4 }, { label: 'Mango', value: 5 }, { label: 'Banana', value: 3 } ];
    return (
        <View>
            <BackButton onPress={onBack} />
            <Text style={styles.sectionHeader}>Pictographs</Text>
            <Text style={styles.explanationText}>A pictograph uses pictures to show data. We use a 'key' to know what each picture stands for.</Text>
            <Pictograph data={fruitData} symbol="🍎" scale={1} />
        </View>
    );
};

const BarGraphScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const petData: DataType[] = [ { label: 'Dogs', value: 8 }, { label: 'Cats', value: 6 }, { label: 'Fish', value: 10 }, { label: 'Birds', value: 4 } ];
    return (
        <View>
            <BackButton onPress={onBack} />
            <Text style={styles.sectionHeader}>Bar Graphs</Text>
            <Text style={styles.explanationText}>A bar graph uses bars of different heights to compare data. The taller the bar, the larger the amount!</Text>
            <BarGraph data={petData} />
        </View>
    );
};

const PieChartScreen: React.FC<ScreenProps> = ({ onBack }) => {
    const subjectData: DataType[] = [ { label: 'Math', value: 8 }, { label: 'Science', value: 10 }, { label: 'English', value: 7 }, { label: 'Art', value: 5 } ];
    return (
        <View>
            <BackButton onPress={onBack} />
            <Text style={styles.sectionHeader}>Pie Charts</Text>
            <Text style={styles.explanationText}>A pie chart is a circle divided into slices to show how a total amount is broken into parts.</Text>
            <PieChart data={subjectData} />
        </View>
    );
};


// --- Main App Component ---
const DataHandlingModule: React.FC = () => {
    const [screen, setScreen] = useState<ScreenType>('hub');

    const renderScreen = () => {
        switch (screen) {
            case 'pictograph': return <PictographScreen onBack={() => setScreen('hub')} />;
            case 'barGraph': return <BarGraphScreen onBack={() => setScreen('hub')} />;
            case 'pieChart': return <PieChartScreen onBack={() => setScreen('hub')} />;
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

export default DataHandlingModule;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  mainHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.headerText,
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.lightText,
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardIcon: {
    fontSize: 30,
    marginRight: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  keyText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 15,
  },
  // Pictograph Styles
  pictographRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  pictographLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  pictographSymbols: {
    fontSize: 24,
  },
  // Bar Graph Styles
  barGraphContainer: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
    flex: 1,
  },
  bar: {
    width: '80%',
    borderRadius: 5,
  },
  barLabel: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.lightText,
  },
  // Pie Chart Styles
  legendContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColorBox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 10,
  },
  legendLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
});
