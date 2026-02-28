"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface DiversificationGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "#34d399";
  if (score >= 40) return "#fbbf24";
  return "#f87171";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Bon";
  if (score >= 50) return "Moyen";
  if (score >= 30) return "Faible";
  return "Critique";
}

function getScoreGradient(score: number): [string, string] {
  if (score >= 70) return ["#34d399", "#06b6d4"];
  if (score >= 40) return ["#fbbf24", "#f59e0b"];
  return ["#f87171", "#ef4444"];
}

export function DiversificationGauge({ score, size = 200 }: DiversificationGaugeProps) {
  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v));
  const scoreRef = useRef<SVGTSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [score, motionScore]);

  useEffect(() => {
    const unsubscribe = displayScore.on("change", (v) => {
      if (scoreRef.current) {
        scoreRef.current.textContent = String(v);
      }
    });
    return unsubscribe;
  }, [displayScore]);

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const [gradStart, gradEnd] = getScoreGradient(score);

  const center = size / 2;
  const radius = (size - 24) / 2;

  // Arc goes from 135 deg to 405 deg (270 deg sweep)
  const startAngle = 135;
  const endAngle = 405;
  const sweepAngle = endAngle - startAngle;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(cx: number, cy: number, r: number, startA: number, endA: number) {
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const largeArcFlag = endA - startA <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  const bgArcPath = describeArc(center, center, radius, startAngle, endAngle);

  // Calculate the arc length for stroke-dasharray animation
  const totalArcLength = (sweepAngle / 360) * 2 * Math.PI * radius;
  const activeArcLength = (totalArcLength * score) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col items-center"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradStart} />
            <stop offset="100%" stopColor={gradEnd} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Active arc - uses stroke-dasharray for reliable animation */}
        <motion.path
          d={bgArcPath}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#glow)"
          strokeDasharray={totalArcLength}
          initial={{ strokeDashoffset: totalArcLength, opacity: 0 }}
          animate={{
            strokeDashoffset: totalArcLength - activeArcLength,
            opacity: 1,
          }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />

        {/* Score text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-sans"
          fill="white"
          fontSize="42"
          fontWeight="700"
        >
          <tspan ref={scoreRef}>0</tspan>
        </text>

        <text
          x={center}
          y={center + 24}
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontWeight="600"
        >
          {label}
        </text>

        <text
          x={center}
          y={center + 44}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize="11"
        >
          Score de diversification
        </text>
      </svg>
    </motion.div>
  );
}
