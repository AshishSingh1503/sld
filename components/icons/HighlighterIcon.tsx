import React from 'react';
import Svg, { Polygon, Rect, G } from 'react-native-svg';

const HighlighterIcon = (props: any) => (
  <Svg width={24} height={24} viewBox="-41 -41 492 492" {...props}>
    <G>
      <Polygon points="235,30 235,0 175,0 175,30 145,30 145,60 205,60 265,60 265,30" fill="#565659" />
      <Polygon points="190,410 220,400 220,380 190,380" fill="#ffd014" />
      <Rect x={205} y={60} width={60} height={250} fill="#FF9811" />
      <Rect x={145} y={60} width={60} height={250} fill="#ffd014" />
      <Polygon points="145,310 145,330 175,350 175,380 190,380 220,380 235,380 235,350 265,330 265,310 205,310" fill="#565659" />
    </G>
  </Svg>
);

export default HighlighterIcon; 