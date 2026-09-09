"use client";

import React from "react";

interface OfficialStampProps {
  companyName?: string;
  city?: string;
  color?: string;
  size?: number;
  rotation?: number;
  showSignature?: boolean;
}

export default function OfficialStamp({
  companyName = "SOFTMUSK INFO PVT. LTD.",
  city = "BELAGAVI, KARNATAKA",
  color = "#002b66", // Official Royal Navy
  size = 110,
  rotation = -4,
  showSignature = true,
}: OfficialStampProps) {
  const topText = companyName.toUpperCase().substring(0, 38);
  const bottomText = `• ${city.toUpperCase()} •`;

  // Dynamic font size based on company name length
  const isLong = topText.length > 24;
  const fSize = isLong ? (topText.length > 32 ? "5.5" : "6.2") : "7.2";
  const lSpacing = isLong ? "0.3" : "0.6";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${color}`,
        borderRadius: "50%",
        padding: "3px",
        boxSizing: "border-box",
        color: color,
        backgroundColor: "transparent",
        transform: `rotate(${rotation}deg)`,
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          border: `1.5px dashed ${color}`,
          borderRadius: "50%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Curved Top Text */}
        <svg viewBox="0 0 120 120" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <path id="curve-top-stamp" fill="none" d="M 15,60 A 45,45 0 0,1 105,60" />
          <text fontSize={fSize} fontWeight="bold" fill={color} letterSpacing={lSpacing}>
            <textPath href="#curve-top-stamp" startOffset="50%" textAnchor="middle">
              {topText}
            </textPath>
          </text>
        </svg>

        {/* Curved Bottom Text */}
        <svg viewBox="0 0 120 120" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          <path id="curve-bottom-stamp" fill="none" d="M 105,60 A 45,45 0 0,1 15,60" />
          <text fontSize="6.2" fontWeight="bold" fill={color} letterSpacing="0.8">
            <textPath href="#curve-bottom-stamp" startOffset="50%" textAnchor="middle">
              {bottomText}
            </textPath>
          </text>
        </svg>

        {/* Center Official Emblem / Signature Marker */}
        {showSignature && (
          <div
            style={{
              position: "absolute",
              width: "60%",
              height: "36%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-6deg)",
              opacity: 0.9,
            }}
          >
            {/* Elegant SVG signature path */}
            <svg viewBox="0 0 100 40" style={{ width: "100%", height: "100%" }}>
              <path
                d="M 5,25 Q 25,5 40,20 T 70,18 Q 85,10 95,22 M 25,32 Q 50,30 85,34"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Autho Sign Text */}
        <div
          style={{
            position: "absolute",
            bottom: "13px",
            fontSize: "6px",
            fontWeight: "bold",
            letterSpacing: "0.6px",
            color: color,
          }}
        >
          AUTHO. SIGN.
        </div>
      </div>
    </div>
  );
}
