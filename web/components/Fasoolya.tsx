import Image from 'next/image';

interface FasoolyaProps {
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
  xl: 240,
};

export function Fasoolya({ 
  animated = false, 
  size = 'md', 
  message,
  className = '' 
}: FasoolyaProps) {
  const dimension = sizeMap[size];
  const src = animated ? '/fasoolya_animated.png' : '/fasoolya.png';

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <Image
        src={src}
        alt="Fasoolya - sNAKr mascot"
        width={dimension}
        height={dimension}
        className="object-contain"
        priority={animated}
      />
      {message && (
        <p className="text-center text-muted-foreground max-w-md">
          {message}
        </p>
      )}
    </div>
  );
}
