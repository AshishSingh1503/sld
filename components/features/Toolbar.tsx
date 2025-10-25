import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Modal, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Rect, Circle as SvgCircle, Polygon, Line as SvgLine, Line, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { InsertedShape } from './DigitalInkCanvas';
import { MaterialIcons, Ionicons as IoniconsIcon, FontAwesome } from '@expo/vector-icons';
import { StyleSheet as RNStyleSheet } from 'react-native';
import PencilSVG from '../../assets/pencil-svgrepo-com (2).svg';
import HighlighterSVG from '../../assets/highlighter-svgrepo-com.svg';
import EraserSVG from '../../assets/eraser-svgrepo-com.svg';
import { voiceRecognitionService } from './VoiceRecognitionService';

// --- NEW Sound Wave Animator Component ---
// This component displays a visual representation of the app listening.
const SoundWaveAnimator = () => {
  const anims = useRef(Array(5).fill(0).map(() => new Animated.Value(0.2))).current;

  useEffect(() => {
    const animations = anims.map((anim) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: Math.random() * 300 + 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: Math.random() * 300 + 300,
            useNativeDriver: true,
          }),
        ])
      );
    });
    Animated.stagger(100, animations).start();

    return () => anims.forEach(anim => anim.stopAnimation());
  }, []);

  return (
    <View style={styles.soundWaveContainer}>
      {anims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.soundWaveBar,
            {
              transform: [{
                scaleY: anim
              }],
            },
          ]}
        />
      ))}
    </View>
  );
};


// --- NEW Voice UI Panel Component ---
// This component is the modal overlay that appears when listening.
// It handles its own fade-in/out animations for a smooth UX.
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

interface VoiceUIPanelProps {
  isVisible: boolean;
  partialText: string;
  onStop: () => void;
  onCloseAnimationComplete: () => void;
}

const VoiceUIPanel: React.FC<VoiceUIPanelProps> = ({ isVisible, partialText, onStop, onCloseAnimationComplete }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const prevIsVisible = usePrevious(isVisible);

  useEffect(() => {
    if (isVisible) {
      Animated.spring(anim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else if (prevIsVisible && !isVisible) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onCloseAnimationComplete();
      });
    }
  }, [isVisible, prevIsVisible, onCloseAnimationComplete]);

  const cardStyle = {
    opacity: anim,
    transform: [{
      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })
    }],
  };

  return (
    <View style={styles.voiceListeningOverlay}>
      <Animated.View style={[styles.voiceListeningCard, cardStyle]}>
        <Text style={styles.voiceListeningTitle}>Listening...</Text>
        <SoundWaveAnimator />
        <Text style={styles.voicePartialText} numberOfLines={3}>
          {partialText || 'Speak now to transcribe text.'}
        </Text>
        <TouchableOpacity style={styles.voiceStopButton} onPress={onStop}>
          <Ionicons name="stop" size={24} color="#FFFFFF" />
          <Text style={styles.voiceStopButtonText}>Stop</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};


const TOOLBAR_HEIGHT = 64;
const SEPARATOR_COLOR = '#E5E5E7';
const SEPARATOR_HEIGHT = 24;

export type ToolKey =
  | 'undo'
  | 'redo'
  | 'clear'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'lasso'
  | 'shapes'
  | 'text'
  | 'table'
  | 'pageLayout'
  | 'voice';

interface ToolConfig {
  key: ToolKey;
  iconSet: 'MaterialIcons' | 'Ionicons' | 'FontAwesome';
  iconName: string;
  accessibilityLabel: string;
}

// Top toolbar tools
const TOP_TOOL_GROUPS: ToolConfig[][] = [
  [
    { key: 'undo', iconSet: 'Ionicons', iconName: 'arrow-undo', accessibilityLabel: 'Undo' },
    { key: 'redo', iconSet: 'Ionicons', iconName: 'arrow-redo', accessibilityLabel: 'Redo' },
    { key: 'clear', iconSet: 'Ionicons', iconName: 'trash', accessibilityLabel: 'Clear Canvas' },
  ],
  [
    { key: 'shapes', iconSet: 'Ionicons', iconName: 'shapes', accessibilityLabel: 'Shapes Selector' },
    { key: 'text', iconSet: 'Ionicons', iconName: 'text', accessibilityLabel: 'Text Box' },
    { key: 'voice', iconSet: 'Ionicons', iconName: 'mic', accessibilityLabel: 'Speech to Text' },
    { key: 'table', iconSet: 'Ionicons', iconName: 'grid', accessibilityLabel: 'Table Insertion' },
    { key: 'pageLayout', iconSet: 'Ionicons', iconName: 'document-text', accessibilityLabel: 'Page Layout' },
  ],
];

// Bottom toolbar tools
const BOTTOM_TOOL_GROUPS: ToolConfig[][] = [
  [
    { key: 'pen', iconSet: 'Ionicons', iconName: 'pencil', accessibilityLabel: 'Pen Tool' },
    { key: 'highlighter', iconSet: 'MaterialIcons', iconName: 'highlight', accessibilityLabel: 'Highlighter' },
    { key: 'eraser', iconSet: 'MaterialIcons', iconName: 'cleaning-services', accessibilityLabel: 'Eraser' },
  ],
];

const SHAPES = ['Rectangle', 'Circle', 'Triangle', 'Line'] as const;
const TABLE_ROWS = Array.from({ length: 10 }, (_, i) => i + 1);
const TABLE_COLS = Array.from({ length: 10 }, (_, i) => i + 1);

export interface ToolbarProps {
  activeTool?: ToolKey;
  onToolSelect: (tool: ToolKey) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onShapeInsert?: (shape: InsertedShape['type']) => void;
  onPageLayoutChange?: (config: { layout: 'blank' | 'ruled' | 'grid' | 'dot', density: number, lineWidth: number }) => void;
  onSave?: () => void;
  onOpenSettings?: () => void;
  onBack?: () => void;
  hiddenTools?: ToolKey[];
  penColor?: string;
  onPenColorChange?: (color: string) => void;
  penWidth?: number;
  onPenWidthChange?: (width: number) => void;
  availableColors?: string[];
  availableWidths?: number[];
  noteName?: string; // New prop
  noteColor?: string; // New prop
  onAddPage?: () => void;
  onOpenTypeLevelModal?: () => void;
  onVoiceText?: (text: string) => void;
}

interface ToolButtonProps {
  iconSet: 'MaterialIcons' | 'Ionicons' | 'FontAwesome';
  iconName: string;
  active?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  toolKey?: ToolKey;
  isListening?: boolean;
  voiceSupported?: boolean | null;
}

const ICON_SIZE = 22;

const ToolButton: React.FC<ToolButtonProps> = ({
  iconSet,
  iconName,
  active = false,
  onPress,
  accessibilityLabel,
  toolKey,
  isListening = false,
  voiceSupported = null,
}) => {
  let IconComponent: React.ComponentType<any>;
  let customIcon = null;
  let iconSize = ICON_SIZE;

  // Animated scale for Apple Notes-like effect
  const scaleAnim = useRef(new Animated.Value(active ? 1.3 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: active ? 1.3 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 120,
    }).start();
  }, [active]);

  // Use SVGs from assets for pen, highlighter, eraser and make them larger
  if (toolKey === 'pen') {
    customIcon = <PencilSVG width={active ? 105 : 84} height={active ? 105 : 88} />;
    iconSize = active ? 64 : 48;
  } else if (toolKey === 'highlighter') {
    customIcon = <HighlighterSVG width={active ? 140 : 104} height={active ? 140 : 98} />;
    iconSize = active ? 64 : 48;
  } else if (toolKey === 'eraser') {
    customIcon = <EraserSVG width={active ? 105 : 84} height={active ? 105 : 88} />;
    iconSize = active ? 64 : 48;
  }
  
  switch (iconSet) {
    case 'MaterialIcons':
      IconComponent = MaterialIcons;
      break;
    case 'Ionicons':
      IconComponent = IoniconsIcon;
      break;
    case 'FontAwesome':
      IconComponent = FontAwesome;
      break;
    default:
      IconComponent = MaterialIcons;
  }

  // Apple Notes-like shadow/glow for active tool
  const shadowStyle =
    active && (toolKey === 'pen' || toolKey === 'highlighter' || toolKey === 'eraser')
      ? {
          shadowColor: '#007AFF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
          backgroundColor: '#E3F2FD',
        }
      : {};

  // Special styling for voice tool when listening
  const voiceListeningStyle = toolKey === 'voice' && isListening ? {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  } : {};

  // Special styling for voice tool when not supported
  const voiceUnsupportedStyle = toolKey === 'voice' && voiceSupported === false ? {
    backgroundColor: '#E5E5E7',
    opacity: 0.5,
  } : {};

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, shadowStyle]}>
    <TouchableOpacity
      style={[
        toolButtonStyles.button,
        active ? toolButtonStyles.activeButton : null,
        voiceListeningStyle,
        voiceUnsupportedStyle
      ].filter(Boolean)}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={toolKey === 'voice' && voiceSupported === false}
    >
      {customIcon ? (
        React.cloneElement(customIcon, { color: active ? '#007AFF' : '#1C1C1E' })
      ) : (
        <IconComponent 
          name={iconName as any}
          size={iconSize} 
          color={
            toolKey === 'voice' && voiceSupported === false ? '#8E8E93' :
            toolKey === 'voice' && isListening ? '#FFFFFF' : 
            (active ? '#007AFF' : '#1C1C1E')
          } 
          style={iconSet === 'MaterialIcons' ? { fontWeight: active ? '600' : '400' } : {}}
        />
      )}
    </TouchableOpacity>
    </Animated.View>
  );
};

const toolButtonStyles = RNStyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  activeButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
});

const Separator: React.FC = () => (
  <View style={styles.separator} />
);

export const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  onToolSelect, 
  onUndo, 
  onRedo, 
  onClear, 
  onShapeInsert, 
  onPageLayoutChange, 
  onSave, 
  onOpenSettings, 
  onBack, 
  hiddenTools = [],
  penColor = '#222',
  onPenColorChange,
  penWidth = 3,
  onPenWidthChange,
  availableColors = ['#222', '#007AFF', '#FF3B30', '#4CD964', '#FF9500', '#AF52DE', '#FFD60A', '#5AC8FA', '#8E8E93'],
  availableWidths = [1, 2, 3, 5, 8, 12],
  onAddPage,
  noteName, // Destructure new prop
  noteColor, // Destructure new prop
  onOpenTypeLevelModal,
  onVoiceText,
}) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [selectedShape, setSelectedShape] = useState<typeof SHAPES[number]>(SHAPES[0]);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState(1);
  const [selectedCols, setSelectedCols] = useState(1);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<'blank' | 'ruled' | 'grid' | 'dot'>('blank');
  const [density, setDensity] = useState(40);
  const [lineWidth, setLineWidth] = useState(1);
  const [showColorModal, setShowColorModal] = useState(false);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);
  const [partialText, setPartialText] = useState<string>('');
  const [showVoiceUI, setShowVoiceUI] = useState(false); // New state to manage UI mounting/unmounting

  // Initialize voice recognition service
  useEffect(() => {
    const initVoice = async () => {
      const isSupported = await voiceRecognitionService.checkSupport();
      setVoiceSupported(isSupported);
      if (!isSupported) return;

      await voiceRecognitionService.initialize({
        onStart: () => {
          setIsListening(true);
          setShowVoiceUI(true);
          setPartialText('');
        },
        onEnd: () => {
          setIsListening(false);
          setPartialText('');
        },
        onResults: (results) => {
          if (results?.[0] && onVoiceText) {
            onVoiceText(results[0]);
          }
        },
        onPartialResults: (results) => {
          if (results?.[0]) {
            setPartialText(results[0]);
          }
        },
        onError: (error) => {
          setIsListening(false);
          setPartialText('');
          Alert.alert('Voice Recognition Error', error);
        },
      });
    };
    initVoice();
    return () => {
      voiceRecognitionService.destroy();
    };
  }, [onVoiceText]);

  const handleVoicePress = async () => {
    if (voiceSupported === false) {
      Alert.alert(
        'Voice Recognition Not Supported',
        'Voice recognition is not available on this device.'
      );
      return;
    }

    if (isListening) {
      await voiceRecognitionService.stop();
    } else {
      await voiceRecognitionService.start('en-US');
    }
  };

  const renderLayoutPreview = (layout: 'blank' | 'ruled' | 'grid' | 'dot') => {
    const w = 100, h = 60;
    switch (layout) {
      case 'ruled':
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={h} fill="#FAFAFA" rx={8} />
            {Array.from({ length: Math.floor(h / 15) }, (_, i) => (
              <Line
                key={i}
                x1={8}
                y1={i * 15 + 10}
                x2={w - 8}
                y2={i * 15 + 10}
                stroke="#E0E0E0"
                strokeWidth={1}
              />
            ))}
          </Svg>
        );
      case 'grid':
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={h} fill="#FAFAFA" rx={8} />
            {Array.from({ length: Math.floor(w / 15) }, (_, i) => (
              <Line
                key={`v-${i}`}
                x1={i * 15 + 8}
                y1={8}
                x2={i * 15 + 8}
                y2={h - 8}
                stroke="#E0E0E0"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: Math.floor(h / 15) }, (_, i) => (
              <Line
                key={`h-${i}`}
                x1={8}
                y1={i * 15 + 8}
                x2={w - 8}
                y2={i * 15 + 8}
                stroke="#E0E0E0"
                strokeWidth={1}
              />
            ))}
          </Svg>
        );
      case 'dot':
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={h} fill="#FAFAFA" rx={8} />
            {Array.from({ length: Math.floor(w / 15) }, (_, i) =>
              Array.from({ length: Math.floor(h / 15) }, (_, j) => (
                <Circle
                  key={`dot-${i}-${j}`}
                  cx={i * 15 + 15}
                  cy={j * 15 + 15}
                  r={1.5}
                  fill="#D0D0D0"
                />
              ))
            )}
          </Svg>
        );
      case 'blank':
      default:
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={h} fill="#FAFAFA" stroke="#E0E0E0" strokeWidth={1} rx={8} />
          </Svg>
        );
    }
  };

  const handlePress = (tool: ToolKey) => {
    Haptics.selectionAsync();
    if (tool === 'undo') onUndo();
    else if (tool === 'redo') onRedo();
    else if (tool === 'clear') onClear();
    else if (tool === 'pageLayout') setShowLayoutMenu(true);
    else if (tool === 'voice') {
      handleVoicePress();
    }
    else {
      onToolSelect(tool);
      if (tool === 'shapes') setShowShapeMenu(true);
      if (tool === 'table') setShowTableMenu(true);
    }
  };

  const showShapeDropdown = activeTool === 'shapes';
  const showTableDropdown = activeTool === 'table';

  const handleLayoutSelect = (layout: 'blank' | 'ruled' | 'grid' | 'dot') => {
    setSelectedLayout(layout);
    if (onPageLayoutChange) onPageLayoutChange({ layout, density, lineWidth });
  };

  const handleDensityChange = (val: number) => {
    setDensity(val);
    if (onPageLayoutChange) onPageLayoutChange({ layout: selectedLayout, density: val, lineWidth });
  };

  const handleLineWidthChange = (val: number) => {
    setLineWidth(val);
    if (onPageLayoutChange) onPageLayoutChange({ layout: selectedLayout, density, lineWidth: val });
  };

  return (
    <>
      {/* TOP TOOLBAR */}
      <View style={styles.topToolbar}>
        <View style={styles.toolbarContent}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            decelerationRate="fast"
          >
            {/* Back Button */}
            {onBack && (
              <View style={styles.backButtonContainer}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
            {/* Note Name and Color Display */}
            {noteName && (
              <View style={[styles.noteHeaderDisplay, { backgroundColor: noteColor || '#f0f0f0' }]}>
                <Text style={styles.noteNameDisplay} numberOfLines={1}>{noteName}</Text>
                {noteColor && <View style={[styles.noteColorSwatch, { backgroundColor: noteColor }]} />}
              </View>
            )}


            {/* Top Tool Groups */}
            {TOP_TOOL_GROUPS.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                <View style={styles.toolGroup}>
                  {group.filter(tool => !hiddenTools.includes(tool.key)).map((tool) => (
                    <ToolButton
                      key={tool.key}
                      iconSet={tool.iconSet}
                      iconName={tool.iconName}
                      active={activeTool === tool.key}
                      onPress={() => handlePress(tool.key)}
                      accessibilityLabel={tool.accessibilityLabel}
                      toolKey={tool.key}
                      isListening={isListening}
                      voiceSupported={voiceSupported}
                    />
                  ))}
                </View>
                {groupIdx < TOP_TOOL_GROUPS.length - 1 && <Separator />}
              </React.Fragment>
            ))}

            {/* Save and Settings */}
            <Separator />
            <View style={styles.toolGroup}>
              {onSave && (
                <ToolButton
                  iconSet="Ionicons"
                  iconName="save"
                  onPress={onSave}
                  accessibilityLabel="Save"
                />
              )}
              {onOpenSettings && (
                <ToolButton
                  iconSet="Ionicons"
                  iconName="settings"
                  onPress={onOpenSettings}
                  accessibilityLabel="Settings"
                />
              )}
              {onOpenTypeLevelModal && (
                <ToolButton
                  iconSet="Ionicons"
                  iconName="options-outline"
                  onPress={onOpenTypeLevelModal}
                  accessibilityLabel="Type and Level"
                />
              )}
            </View>

            {/* Add Page Button */}
            {onAddPage && (
              <View style={styles.toolGroup}>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#4CAF50',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginHorizontal: 4,
                  }}
                  onPress={onAddPage}
                  accessibilityLabel="Add Page"
                >
                  <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Status Labels */}
          <View style={styles.statusContainer}>
            {showShapeDropdown && (
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>{selectedShape}</Text>
              </View>
            )}
            {showTableDropdown && (
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>{selectedRows}×{selectedCols}</Text>
              </View>
            )}
            {isListening && partialText && (
              <View style={[styles.statusChip, { backgroundColor: '#FFE5E5' }]}>
                <Text style={[styles.statusText, { color: '#FF3B30' }]} numberOfLines={1}>
                  {partialText.length > 30 ? `${partialText.substring(0, 30)}...` : partialText}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* BOTTOM TOOLBAR */}
      <View style={styles.bottomToolbarContainer}>
        <View style={styles.bottomToolbarSection}>
          {/* SVG Tool Icons (Pen, Highlighter, Eraser) */}
          <View style={styles.svgToolsSection}>
            {['pen', 'highlighter', 'eraser'].map((toolKey) => {
              const tool = BOTTOM_TOOL_GROUPS[0].find(t => t.key === toolKey);
              if (!tool || hiddenTools.includes(tool.key)) return null;
              return (
                <ToolButton
                  key={tool.key}
                  iconSet={tool.iconSet}
                  iconName={tool.iconName}
                  active={activeTool === tool.key}
                  onPress={() => handlePress(tool.key)}
                  accessibilityLabel={tool.accessibilityLabel}
                  toolKey={tool.key}
                />
              );
            })}
          </View>
          {/* Color Palette 2x3 grid, last swatch opens modal */}
          <View style={styles.colorPaletteGrid2x3}>
            {[0, 1].map(row => (
              <View key={row} style={{ flexDirection: 'row' }}>
                {[0, 1, 2].map(col => {
                  const idx = row * 3 + col;
                  const color = availableColors[idx];
                  // If last swatch (6th), show 'more colors' button
                  if (row === 1 && col === 2) {
                    return (
                      <TouchableOpacity
                        key={'more-colors'}
                        style={[
                          styles.colorSwatch,
                          {
                            backgroundColor: '#E5E5E7',
                            borderWidth: 1,
                            borderColor: '#007AFF',
                          }
                        ]}
                        onPress={() => setShowColorModal(true)}
                        accessibilityLabel={`More colors`}
                      >
                        <Ionicons name="ellipsis-horizontal" size={16} color="#007AFF" />
                      </TouchableOpacity>
                    );
                  }
                  if (!color) return <View key={col} style={styles.colorSwatch} />;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: color,
                          borderWidth: penColor === color ? 2 : 1,
                          borderColor: penColor === color ? '#007AFF' : '#E5E5E7',
                        }
                      ]}
                      onPress={() => onPenColorChange && onPenColorChange(color)}
                      accessibilityLabel={`Select color ${color}`}
                    >
                      {penColor === color && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          {/* Width Selector - only 3 options, visually Normal/Bold/Bolder */}
          <View style={styles.widthSection}>
            {[4, 8, 14].map((diameter, idx) => (
              <TouchableOpacity
                key={diameter}
                style={[
                  styles.widthSwatch,
                  {
                    borderWidth: penWidth === diameter / 2 ? 2 : 1,
                    borderColor: penWidth === diameter / 2 ? '#007AFF' : '#E5E5E7',
                  }
                ]}
                onPress={() => onPenWidthChange && onPenWidthChange(diameter / 2)}
                accessibilityLabel={`Select width option ${idx + 1}`}
              >
                <View style={{
                  width: diameter,
                  height: diameter,
                  borderRadius: diameter / 2,
                  backgroundColor: '#222',
                  alignSelf: 'center',
                }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Shape Selection Modal */}
      <Modal
        visible={showShapeMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShapeMenu(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowShapeMenu(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Shape</Text>
            </View>
            <View style={styles.shapeGrid}>
              {SHAPES.map((shape: typeof SHAPES[number]) => (
                <TouchableOpacity
                  key={shape}
                  style={[styles.shapeItem, selectedShape === shape && styles.selectedShapeItem]}
                  onPress={() => {
                    setSelectedShape(shape);
                    setShowShapeMenu(false);
                    if (onShapeInsert) onShapeInsert(shape);
                  }}
                >
                  <View style={styles.shapeIcon}>
                    {shape === 'Rectangle' && (
                      <Svg width={32} height={32}>
                        <Rect x={4} y={8} width={24} height={16} stroke="#007AFF" strokeWidth={2} fill="none" rx={2} />
                      </Svg>
                    )}
                    {shape === 'Circle' && (
                      <Svg width={32} height={32}>
                        <SvgCircle cx={16} cy={16} r={10} stroke="#007AFF" strokeWidth={2} fill="none" />
                      </Svg>
                    )}
                    {shape === 'Triangle' && (
                      <Svg width={32} height={32}>
                        <Polygon points="16,6 26,22 6,22" stroke="#007AFF" strokeWidth={2} fill="none" />
                      </Svg>
                    )}
                    {shape === 'Line' && (
                      <Svg width={32} height={32}>
                        <SvgLine x1={6} y1={22} x2={26} y2={10} stroke="#007AFF" strokeWidth={2} />
                      </Svg>
                    )}
                  </View>
                  <Text style={[styles.shapeLabel, selectedShape === shape && styles.selectedShapeLabel]}>
                    {shape}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Table Selection Modal */}
      <Modal
        visible={showTableMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTableMenu(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTableMenu(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Table Size</Text>
            </View>
            
            <View style={styles.tableSection}>
              <Text style={styles.sectionTitle}>Rows</Text>
              <View style={styles.numberGrid}>
                {TABLE_ROWS.map((row) => (
                  <TouchableOpacity
                    key={row}
                    style={[styles.numberItem, selectedRows === row && styles.selectedNumberItem]}
                    onPress={() => setSelectedRows(row)}
                  >
                    <Text style={[styles.numberText, selectedRows === row && styles.selectedNumberText]}>
                      {row}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.tableSection}>
              <Text style={styles.sectionTitle}>Columns</Text>
              <View style={styles.numberGrid}>
                {TABLE_COLS.map((col) => (
                  <TouchableOpacity
                    key={col}
                    style={[styles.numberItem, selectedCols === col && styles.selectedNumberItem]}
                    onPress={() => setSelectedCols(col)}
                  >
                    <Text style={[styles.numberText, selectedCols === col && styles.selectedNumberText]}>
                      {col}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.doneButton} onPress={() => setShowTableMenu(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Page Layout Modal */}
      <Modal
        visible={showLayoutMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLayoutMenu(false)}
      >
        <View style={styles.layoutModalContainer}>
          <View style={styles.layoutModalContent}>
            <View style={styles.layoutModalHeader}>
              <TouchableOpacity onPress={() => setShowLayoutMenu(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
              <Text style={styles.layoutModalTitle}>Page Layout</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.layoutScrollView}>
              <View style={styles.layoutGrid}>
                {(['blank', 'ruled', 'grid', 'dot'] as const).map(layout => (
                  <TouchableOpacity
                    key={layout}
                    style={[
                      styles.layoutItem,
                      selectedLayout === layout && styles.selectedLayoutItem
                    ]}
                    onPress={() => {
                      handleLayoutSelect(layout);
                      setShowLayoutMenu(false);
                    }}
                  >
                    <View style={styles.layoutPreview}>
                      {renderLayoutPreview(layout)}
                    </View>
                    <Text style={[styles.layoutLabel, selectedLayout === layout && styles.selectedLayoutLabel]}>
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                    </Text>
                    {selectedLayout === layout && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color="#007AFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.layoutControls}>
                <Text style={styles.layoutControlsTitle}>Layout Options</Text>
                <View style={styles.optionRow}>
                  <View style={styles.optionItem}>
                    <Text style={styles.optionLabel}>Spacing</Text>
                    <View style={styles.optionValues}>
                      {[20, 30, 40, 50, 60].map(value => (
                        <TouchableOpacity
                          key={value}
                          style={[styles.optionButton, density === value && styles.selectedOptionButton]}
                          onPress={() => handleDensityChange(value)}
                        >
                          <Text style={[styles.optionButtonText, density === value && styles.selectedOptionButtonText]}>
                            {value}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.optionItem}>
                    <Text style={styles.optionLabel}>Width</Text>
                    <View style={styles.optionValues}>
                      {[1, 2, 3, 4, 5].map(value => (
                        <TouchableOpacity
                          key={value}
                          style={[styles.optionButton, lineWidth === value && styles.selectedOptionButton]}
                          onPress={() => handleLineWidthChange(value)}
                        >
                          <Text style={[styles.optionButtonText, lineWidth === value && styles.selectedOptionButtonText]}>
                            {value}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* More Colors Modal */}
      <Modal
        visible={showColorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowColorModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Color</Text>
            </View>
            <View style={styles.moreColorsGrid}>
              {availableColors.slice(6).map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: color,
                      borderWidth: penColor === color ? 2 : 1,
                      borderColor: penColor === color ? '#007AFF' : '#E5E5E7',
                    }
                  ]}
                  onPress={() => {
                    onPenColorChange && onPenColorChange(color);
                    setShowColorModal(false);
                  }}
                  accessibilityLabel={`Select color ${color}`}
                >
                  {penColor === color && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- UPDATED Voice Listening UI --- */}
      {showVoiceUI && (
        <VoiceUIPanel
          isVisible={isListening}
          partialText={partialText}
          onStop={handleVoicePress}
          onCloseAnimationComplete={() => setShowVoiceUI(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Top toolbar styles
  topToolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
    elevation: 8,
    zIndex: 10,
  },
  
  // Bottom toolbar styles
  bottomToolbarContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff056',
    paddingVertical: 12,
    paddingHorizontal: 0,
    zIndex: 100,
    alignItems: 'center',
    height: 120,
    width: '55%',
    alignSelf: 'center',
    borderRadius: 40,
  },
  bottomToolbarSection: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  svgToolsSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 34,
  },
  colorPaletteGrid2x3: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  moreColorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  widthSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 7,
  },
  widthSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarContent: {
    height: TOOLBAR_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  backButtonContainer: {
    marginRight: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  separator: {
    width: 1,
    height: SEPARATOR_HEIGHT,
    backgroundColor: SEPARATOR_COLOR,
    marginHorizontal: 8,
  },
  statusContainer: {
    position: 'absolute',
    right: 16,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    minWidth: 280,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shapeItem: {
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedShapeItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  shapeIcon: {
    marginBottom: 8,
  },
  shapeLabel: {
    fontSize: 14,
    color: '#6D6D72',
    fontWeight: '500',
  },
  selectedShapeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tableSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  numberItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
    marginHorizontal: 2,
  },
  selectedNumberItem: {
    backgroundColor: '#007AFF',
  },
  numberText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  selectedNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  layoutModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  layoutModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  layoutModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
  },
  closeButton: {
    padding: 4,
  },
  layoutModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  layoutScrollView: {
    paddingHorizontal: 20,
  },
  layoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  layoutItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLayoutItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  layoutPreview: {
    marginBottom: 12,
  },
  layoutLabel: {
    fontSize: 14,
    color: '#6D6D72',
    fontWeight: '500',
  },
  selectedLayoutLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  layoutControls: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  layoutControlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  optionRow: {
    gap: 20,
  },
  optionItem: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 14,
    color: '#6D6D72',
    fontWeight: '500',
    marginBottom: 8,
  },
  optionValues: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    width: 40,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  selectedOptionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  selectedOptionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteHeaderDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD', // Default background, will be overridden by noteColor
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxWidth: 200, // Limit width
    overflow: 'hidden',
  },
  noteNameDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  noteColorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  // --- NEW Voice and Animation Styles ---
  voiceListeningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  voiceListeningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  voiceListeningTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  soundWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginVertical: 16,
  },
  soundWaveBar: {
    width: 6,
    height: 50,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
  voicePartialText: {
    fontSize: 16,
    color: '#6D6D72',
    textAlign: 'center',
    minHeight: 70,
    marginBottom: 16,
  },
  voiceStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 16,
    alignSelf: 'stretch',
    gap: 8,
  },
  voiceStopButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});