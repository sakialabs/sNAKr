'use client'

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32, text: 'text-lg' },
  md: { width: 48, height: 48, text: 'text-xl' },
  lg: { width: 64, height: 64, text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, href = '/', className = '' }: LogoProps) {
  const { width, height, text } = sizeMap[size];
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        animate={isShaking ? {
          rotate: [0, -5, 5, -5, 5, 0],
          transition: { duration: 0.5 }
        } : {}}
      >
        <Image
          src="/logo.png"
          alt="sNAKr Logo"
          width={width}
          height={height}
          priority
          className="object-contain"
        />
      </motion.div>
      {showText && (
        <span className={`font-bold ${text} text-foreground`}>
          sNAKr
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity" onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
}
