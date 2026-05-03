import React from 'react';

export default function Gauge({ score }) {
  const r = 72, cx = 90, cy = 90;
  const rad = d => d * Math.PI / 180;
  const arc = (a1, a2) => {
    const s = { x: cx + r * Math.cos(rad(a1)), y: cy + r * Math.sin(rad(a1)) };
    const e = { x: cx + r * Math.cos(rad(a2)), y: cy + r * Math.sin(rad(a2)) };
    return `M${s.x} ${s.y} A${r} ${r} 0 ${Math.abs(a2-a1)>180?1:0} 1 ${e.x} ${e.y}`;
  };
  const S = -210, T = 240, fill = S + (score / 100) * T;
  const color = score >= 68 ? '#30d158' : score >= 45 ? '#ff9500' : '#ff4757';
  return (
    <svg viewBox="0 0 180 145" style={{ width: '100%', maxWidth: 180, overflow: 'visible' }}>
      <path d={arc(S, S+T)} fill="none" stroke="#1f232e" strokeWidth="10" strokeLinecap="round"/>
      <path d={arc(S, fill)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        style={{ filter:`drop-shadow(0 0 6px ${color}99)`, transition:'all 1s ease' }}/>
      <text x="90" y="96" textAnchor="middle" fill={color}
        style={{ fontFamily:"'DM Serif Display',serif", fontSize:'32px', fontWeight:700 }}>{score}</text>
      <text x="90" y="114" textAnchor="middle" fill="#5a6070"
        style={{ fontFamily:"'Inter',sans-serif", fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase' }}>
        Health Score
      </text>
    </svg>
  );
}
