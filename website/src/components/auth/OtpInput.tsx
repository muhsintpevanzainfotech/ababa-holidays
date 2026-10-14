import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onComplete?: (code: string) => void | Promise<void>;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  onComplete,
  autoFocus = false,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);


  useEffect(() => {
    const arr = value.split("").slice(0, length);
    const padded = [...arr, ...Array(length - arr.length).fill("")];
    setDigits(padded);
  }, [value, length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      // Cleared input
      const newDigits = [...digits];
      newDigits[idx] = "";
      setDigits(newDigits);
      const combined = newDigits.join("");
      onChange(combined);
      return;
    }

    // Take the last entered character if multiple typed
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = char;
    setDigits(newDigits);

    const combined = newDigits.join("");
    onChange(combined);

    if (combined.length === length && onComplete) {
      onComplete(combined);
    }

    // Auto focus next
    if (idx < length - 1 && char) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasteData) {
      const arr = pasteData.split("");
      const padded = [...arr, ...Array(length - arr.length).fill("")];
      setDigits(padded);
      const combined = padded.join("");
      onChange(combined);

      const focusIdx = Math.min(pasteData.length, length - 1);
      inputsRef.current[focusIdx]?.focus();

      if (pasteData.length === length && onComplete) {
        onComplete(pasteData);
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 my-2">
      {Array.from({ length }).map((_, idx) => {
        const isFilled = Boolean(digits[idx]);
        return (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <input
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[idx] || ""}
              disabled={disabled}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border-2 transition-all duration-200 outline-none shadow-sm ${
                isFilled
                  ? "bg-accent/10 border-accent text-foreground shadow-accent/20"
                  : "bg-background/80 border-border/80 text-foreground focus:border-accent focus:bg-background focus:ring-4 focus:ring-accent/15"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default OtpInput;
