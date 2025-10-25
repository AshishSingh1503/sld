import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
  PanResponder,
} from 'react-native';
import Svg, { Path, Rect, G, Text as SvgText, Circle, Polygon, Line } from 'react-native-svg';
import { DigitalInkRecognition } from '../../modules/digital-ink-recognition/src/DigitalInkRecognition';
import { RecognitionCandidate } from '../../modules/digital-ink-recognition/src/DigitalInkRecognition';
import Slider from '@react-native-community/slider';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface InsertedShape {
  type: 'Rectangle' | 'Circle' | 'Triangle' | 'Line';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Stroke {
  points: Array<{ x: number; y: number; timestamp?: number }>;
  color: string;
  width: number;
}

interface DigitalInkCanvasProps {
  languageTag: string;
  onRecognitionResult: (candidates: RecognitionCandidate[]) => void;
  undoRef?: React.MutableRefObject<(() => void) | undefined>;
  redoRef?: React.MutableRefObject<(() => void) | undefined>;
  clearRef?: React.MutableRefObject<(() => void) | undefined>;
  eraserActive?: boolean;
  recognitionEnabled?: boolean;
  onShapeInsert?: (shape: InsertedShape) => void;
  insertedShape?: InsertedShape | null;
  setInsertedShape?: (shape: InsertedShape | null) => void;
  activeTool?: string;
  pageLayout?: { layout: 'blank' | 'ruled' | 'grid' | 'dot', density: number, lineWidth: number };
  strokes?: Stroke[];
  setStrokes?: (strokes: Stroke[]) => void;
  autoAlignText?: boolean;
  recognitionMode?: 'alphabet' | 'words';
  wordGapMs?: number;
  penColor?: string;
  penWidth?: number;
}

const DigitalInkCanvas = forwardRef<any, DigitalInkCanvasProps>((props, ref) => {
  const {
    languageTag,
    onRecognitionResult,
    undoRef,
    redoRef,
    clearRef,
    eraserActive,
    recognitionEnabled,
    onShapeInsert,
    insertedShape,
    setInsertedShape,
    activeTool,
    pageLayout,
    strokes: controlledStrokes,
    setStrokes: setControlledStrokes,
    autoAlignText,
    recognitionMode = 'words',
    wordGapMs = 1200,
    penColor,
    penWidth,
  } = props;

  const [internalStrokes, setInternalStrokes] = useState<Stroke[]>([]);
  const strokes = controlledStrokes !== undefined ? controlledStrokes : internalStrokes;
  const setStrokes = setControlledStrokes !== undefined ? setControlledStrokes : setInternalStrokes;

  const layoutType = pageLayout?.layout || 'blank';
  const density = pageLayout?.density || 40;
  const lineWidth = pageLayout?.lineWidth || 1;

  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [eraserPath, setEraserPath] = useState<{ x: number; y: number }[]>([]);
  const [eraserCursor, setEraserCursor] = useState<{ x: number; y: number } | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState<RecognitionCandidate[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(screenWidth);
  const [canvasHeight, setCanvasHeight] = useState(screenHeight);
  const [strokeWidth, setStrokeWidth] = useState<number>(penWidth ?? 3);
  const [selectedColor, setSelectedColor] = useState<string>(penColor ?? '#000000');
  
  const ERASER_RADIUS = 18; // px
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [justInserted, setJustInserted] = useState(false);

  const canvasRef = useRef<View>(null);

  useEffect(() => {
    console.log('DigitalInkCanvas mounted');
  }, []);

  useEffect(() => {
    // Update canvas dimensions based on screen size for landscape
    const updateCanvasSize = () => {
      // For landscape mode, use more width and less height
      setCanvasWidth(screenWidth * 0.9);
      setCanvasHeight(screenHeight * 0.7);
    };

    console.log('Number of strokes:', strokes.length);
    


    updateCanvasSize();
    const subscription = Dimensions.addEventListener('change', updateCanvasSize);
    return () => subscription?.remove();
  }, []);

  // Initialize the recognizer when the component mounts or language changes
  useEffect(() => {
    const initializeRecognizer = async () => {
      try {
        console.log('Initializing recognizer for language:', languageTag);
        const success = await DigitalInkRecognition.initializeRecognizer(languageTag);
        if (success) {
          console.log('Recognizer initialized successfully');
        } else {
          console.error('Failed to initialize recognizer');
        }
      } catch (error) {
        console.error('Error initializing recognizer:', error);
      }
    };

    initializeRecognizer();
  }, [languageTag]);

  // Helper: get bounding box for a stroke
  const getBoundingBox = (points: { x: number; y: number }[]) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  };

  // Helper: check if two bounding boxes intersect
  const boxesIntersect = (a: any, b: any) => {
    return (
      a.minX <= b.maxX && a.maxX >= b.minX &&
      a.minY <= b.maxY && a.maxY >= b.minY
    );
  };

  // Modified touch handlers for eraser
  const handleTouchStart = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    if (eraserActive) {
      setEraserPath([{ x: locationX, y: locationY }]);
      setEraserCursor({ x: locationX, y: locationY });
      setCurrentStroke(null);
    } else if (activeTool === 'pen' && !insertedShape) {
      setEraserCursor(null);
      const now = Date.now();
      const newStroke: Stroke = {
        points: [{ x: locationX, y: locationY, timestamp: now }],
        color: selectedColor,
        width: strokeWidth,
      };
      setCurrentStroke(newStroke);
    }
  };

  const handleTouchMove = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    if (eraserActive) {
      setEraserPath(prev => [...prev, { x: locationX, y: locationY }]);
      setEraserCursor({ x: locationX, y: locationY });
    } else if (activeTool === 'pen' && currentStroke) {
      setCurrentStroke(prev => {
        if (!prev) return null;
        const now = Date.now();
        return {
          ...prev,
          points: [...prev.points, { x: locationX, y: locationY, timestamp: now }],
        };
      });
    }
  };

  const handleTouchEnd = () => {
    if (eraserActive && eraserPath.length > 1) {
      const eraserBox = getBoundingBox(eraserPath);
      setStrokes(strokes.filter(stroke => {
        const strokeBox = getBoundingBox(stroke.points);
        return !boxesIntersect(eraserBox, strokeBox);
      }));
      setEraserPath([]);
      setEraserCursor(null);
    } else if (currentStroke && currentStroke.points.length > 1) {
      setStrokes([...strokes, currentStroke]);
      setCurrentStroke(null);
    }
    setEraserCursor(null);
  };

  const clearCanvas = () => {
    console.log('clearCanvas called');
    Alert.alert(
      'Clear Canvas',
      'Are you sure you want to clear all strokes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setStrokes([]);
            setRecognitionResults([]);
            onRecognitionResult([]);
          }
        }
      ]
    );
  };

  const recognizeStrokes = async () => {
    if (strokes.length === 0) {
      Alert.alert('No Strokes', 'Please draw something before recognizing.');
      return;
    }
    setIsRecognizing(true);
    try {
      console.log('Starting recognition with language:', languageTag);
      console.log('Number of strokes:', strokes.length);
      // Ensure recognizer is initialized
      console.log('Initializing recognizer...');
      const initSuccess = await DigitalInkRecognition.initializeRecognizer(languageTag);
      if (!initSuccess) {
        throw new Error('Failed to initialize recognizer');
      }
      let candidates: RecognitionCandidate[] = [];
      if (recognitionMode === 'alphabet') {
        // Recognize each stroke as a separate character
        const charResults = await Promise.all(
          strokes.map(async (stroke) => {
            const singleStroke = [{ points: stroke.points }];
            const result = await DigitalInkRecognition.recognizeInk(singleStroke);
            return result[0]?.text || '';
          })
        );
        const joined = charResults.join('');
        candidates = [{ text: joined, score: 1 }];
      } else {
        // Always recognize all strokes as a single word in 'words' mode
        const result = await DigitalInkRecognition.recognizeInk(
          strokes.map(stroke => ({ points: stroke.points }))
        );
        candidates = result;
      }
      setRecognitionResults(candidates);
      onRecognitionResult(candidates);
      if (candidates.length === 0) {
        Alert.alert('No Results', 'No text was recognized from the strokes.');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      Alert.alert('Recognition Error', 'Failed to recognize the handwriting. Please try again.');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleStrokePress = (strokeIdx: number) => {
    if (eraserActive) {
      setStrokes(strokes.filter((_, idx) => idx !== strokeIdx));
    }
  };

  const renderStroke = (stroke: Stroke, index: number) => {
    if (stroke.points.length < 2) return null;
    const pathData = stroke.points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    return (
      <Path
        key={index}
        d={pathData}
        stroke={stroke.color}
        strokeWidth={stroke.width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const renderCurrentStroke = () => {
    if (!currentStroke || currentStroke.points.length < 2) return null;

    const pathData = currentStroke.points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return (
      <Path
        d={pathData}
        stroke={currentStroke.color}
        strokeWidth={currentStroke.width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setRedoStack(stack => [strokes[strokes.length - 1], ...stack]);
    setStrokes(newStrokes);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setStrokes([...strokes, redoStack[0]]);
    setRedoStack(redoStack.slice(1));
  };

  // Expose undo/redo/clear to parent via refs
  React.useEffect(() => {
    if (undoRef) undoRef.current = handleUndo;
    if (redoRef) redoRef.current = handleRedo;
    if (clearRef) clearRef.current = clearCanvas;
  }, [undoRef, redoRef, clearRef, strokes, redoStack]);

  // After adding a new stroke, if recognitionEnabled, call recognizeStrokes
  useEffect(() => {
    if (recognitionEnabled && strokes.length > 0) {
      recognizeStrokes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes.length, recognitionEnabled]);

  console.log('Number of strokes:', strokes.length);

  // PanResponder for moving/resizing shape
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => !!insertedShape,
      onPanResponderGrant: (evt, gestureState) => {
        if (insertedShape) {
          const { x, y } = insertedShape;
          const touchX = evt.nativeEvent.locationX;
          const touchY = evt.nativeEvent.locationY;
          if (justInserted) {
            setIsDragging(true);
            setDragOffset({ x: touchX - x, y: touchY - y });
            setJustInserted(false);
          } else if (Math.abs(touchX - (x + insertedShape.width)) < 24 && Math.abs(touchY - (y + insertedShape.height)) < 24) {
            setIsResizing(true);
          } else {
            setIsDragging(true);
            setDragOffset({ x: touchX - x, y: touchY - y });
          }
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isDragging && insertedShape) {
          setInsertedShape && setInsertedShape({ ...insertedShape, x: evt.nativeEvent.locationX - dragOffset.x, y: evt.nativeEvent.locationY - dragOffset.y });
        } else if (isResizing && insertedShape) {
          setInsertedShape && setInsertedShape({ ...insertedShape, width: Math.max(24, evt.nativeEvent.locationX - insertedShape.x), height: Math.max(24, evt.nativeEvent.locationY - insertedShape.y) });
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        setIsResizing(false);
      },
    })
  ).current;

  // Handler for shape insert from toolbar
  React.useEffect(() => {
    if (onShapeInsert) {
      // Listen for shape insert event
      // This effect is just a placeholder for prop change
    }
  }, [onShapeInsert]);

  // After insertedShape is set, if it exists, set isDragging to true and set dragOffset to {x: 0, y: 0} (or appropriate default)
  React.useEffect(() => {
    if (insertedShape) {
      setIsDragging(true);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [insertedShape]);

  // When insertedShape changes, set justInserted to true
  React.useEffect(() => {
    if (insertedShape) {
      setJustInserted(true);
    }
  }, [insertedShape]);

  // Sync penColor and penWidth from props
  useEffect(() => {
    if (typeof penColor === 'string') setSelectedColor(penColor);
  }, [penColor]);
  useEffect(() => {
    if (typeof penWidth === 'number') setStrokeWidth(penWidth);
  }, [penWidth]);

  // Render inserted shape
  const renderInsertedShape = () => {
    if (!insertedShape) return null;
    const { type, x, y, width, height } = insertedShape;
    let shapeNode = null;
    if (type === 'Rectangle') {
      shapeNode = <Rect x={x} y={y} width={width} height={height} stroke="#2196F3" strokeWidth={3} fill="rgba(33,150,243,0.1)" />;
    } else if (type === 'Circle') {
      shapeNode = <Circle cx={x + width / 2} cy={y + height / 2} r={Math.min(width, height) / 2} stroke="#2196F3" strokeWidth={3} fill="rgba(33,150,243,0.1)" />;
    } else if (type === 'Triangle') {
      shapeNode = <Polygon points={`${x + width / 2},${y} ${x + width},${y + height} ${x},${y + height}`} stroke="#2196F3" strokeWidth={3} fill="rgba(33,150,243,0.1)" />;
    } else if (type === 'Line') {
      shapeNode = <Line x1={x} y1={y} x2={x + width} y2={y + height} stroke="#2196F3" strokeWidth={3} />;
    }
    return (
      <>
        {shapeNode}
        {/* Render resize handle as SVG circle */}
        <Circle
          cx={x + width}
          cy={y + height}
          r={14}
          fill="#2196F3"
          stroke="#fff"
          strokeWidth={2}
        />
      </>
    );
  };

  // Helper to render page layout background
  const renderPageLayout = () => {
    switch (layoutType) {
      case 'ruled':
        // Horizontal lines every density px
        return (
          <G stroke="#e0e0e0" strokeWidth={lineWidth}>
            {Array.from({ length: Math.floor(canvasHeight / density) }, (_, i) => (
              <Line
                key={`ruled-${i}`}
                x1={0}
                y1={i * density}
                x2={canvasWidth}
                y2={i * density}
              />
            ))}
          </G>
        );
      case 'grid':
        // Grid every density px
        return (
          <G stroke="#e0e0e0" strokeWidth={lineWidth}>
            {Array.from({ length: Math.floor(canvasWidth / density) }, (_, i) => (
              <Line
                key={`v-${i}`}
                x1={i * density}
                y1={0}
                x2={i * density}
                y2={canvasHeight}
              />
            ))}
            {Array.from({ length: Math.floor(canvasHeight / density) }, (_, i) => (
              <Line
                key={`h-${i}`}
                x1={0}
                y1={i * density}
                x2={canvasWidth}
                y2={i * density}
              />
            ))}
          </G>
        );
      case 'dot':
        // Dots every density px
        return (
          <G>
            {Array.from({ length: Math.floor(canvasWidth / density) }, (_, i) =>
              Array.from({ length: Math.floor(canvasHeight / density) }, (_, j) => (
                <Circle
                  key={`dot-${i}-${j}`}
                  cx={i * density + density / 2}
                  cy={j * density + density / 2}
                  r={lineWidth + 1}
                  fill="#bdbdbd"
                />
              ))
            )}
          </G>
        );
      case 'blank':
      default:
        return null;
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getRecognitionResult: () => {
      // Return the top recognition result text, or undefined
      return recognitionResults[0]?.text;
    },
    clear: () => {
      setStrokes([]);
      setRecognitionResults([]);
      props.onRecognitionResult([]);
    },
  }));

  return (
    <View style={styles.container}>
      {/* Canvas */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <View
          ref={canvasRef}
          style={styles.canvas}
          onLayout={e => {
            setCanvasWidth(e.nativeEvent.layout.width);
            setCanvasHeight(e.nativeEvent.layout.height);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <Svg width="100%" height="100%" style={styles.svg}>
            {renderPageLayout()}
            {/* Render all completed strokes */}
            {strokes.map((stroke, index) => renderStroke(stroke, index))}
            {/* Render current stroke */}
            {renderCurrentStroke()}
            {/* Render eraser path */}
            {eraserActive && eraserPath.length > 1 && (
              <Path
                d={eraserPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                stroke="#FF5252"
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.5}
              />
            )}
            {/* Render eraser cursor */}
            {eraserActive && eraserCursor && (
              <Circle
                cx={eraserCursor.x}
                cy={eraserCursor.y}
                r={ERASER_RADIUS}
                stroke="#FF5252"
                strokeWidth={2}
                fill="rgba(255,82,82,0.15)"
              />
            )}
            {/* Recognition results overlay */}
            {recognitionResults.length > 0 && (
              <G>
                {autoAlignText ? (
                  <>
                    {/* Only show the best result, auto-aligned */}
                    {recognitionResults[0] && (() => {
                      const words = recognitionResults[0].text.split(' ');
                      const fontSize = 18;
                      const lineHeight = 26;
                      let x = 20;
                      let y = 40;
                      let line = '';
                      const lines: string[] = [];
                      words.forEach(word => {
                        const testLine = line ? line + ' ' + word : word;
                        // Estimate width: 10px per char (rough)
                        if ((testLine.length * 10) > (canvasWidth - 40)) {
                          lines.push(line);
                          line = word;
                        } else {
                          line = testLine;
                        }
                      });
                      if (line) lines.push(line);
                      return lines.map((l, i) => (
                        <SvgText
                          key={i}
                          x={x}
                          y={y + i * lineHeight}
                          fontSize={fontSize}
                          fill="#333"
                          textAnchor="start"
                        >
                          {l}
                        </SvgText>
                      ));
                    })()}
                  </>
                ) : (
                  <>
                    <Rect
                      x={10}
                      y={10}
                      width={canvasWidth - 20}
                      height={80}
                      fill="rgba(255, 255, 255, 0.95)"
                      stroke="#4CAF50"
                      strokeWidth="2"
                      rx="8"
                    />
                    <SvgText
                      x={20}
                      y={35}
                      fontSize="16"
                      fontWeight="bold"
                      fill="#333"
                    >
                      Recognition Results:
                    </SvgText>
                    {recognitionResults.slice(0, 3).map((result, index) => (
                      <SvgText
                        key={index}
                        x={20}
                        y={55 + index * 20}
                        fontSize="14"
                        fill="#666"
                      >
                        {index + 1}. "{result.text}" {result.score != null ? `(${(result.score * 100).toFixed(1)}%)` : ''}
                      </SvgText>
                    ))}
                  </>
                )}
              </G>
            )}
            {renderInsertedShape()}
          </Svg>
          {/* Overlay for shape move/resize */}
          {insertedShape && (
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none" />
          )}
        </View>
      </View>

      
    </View>
  );
});

export { DigitalInkCanvas };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexWrap: 'wrap',
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  colorSelector: {
    flexDirection: 'row',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 6,
    backgroundColor: 'white',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  recognizeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  recognizeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  recognizeButtonDisabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e9ecef',
    overflow: 'hidden',
    position: 'relative',
  },
  svg: {
    flex: 1,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 3,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorButton: {
    borderColor: '#2196F3',
    borderWidth: 3,
  },
  colorCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  widthValue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    minWidth: 28,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  verticalColorToolbar: {
    position: 'absolute',
    left: 10,
    top: 80,
    width: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 20,
    alignItems: 'center',
  },
  verticalColorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
});