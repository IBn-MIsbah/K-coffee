"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type MotionCardProps = {
  children: ReactNode;
  index: number;
};

export default function MotionCard({ children, index }: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : index * 0.04, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
