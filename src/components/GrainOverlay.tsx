"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function GrainOverlay() {
  const { grainEnabled } = useApp();

  if (!grainEnabled) return null;

  return <div className="grainy-overlay" aria-hidden="true" />;
}
