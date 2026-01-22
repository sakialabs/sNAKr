import Image from 'next/image';
import Link from 'next/link';

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

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.png"
        alt="sNAKr Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
      {showText && (
        <span className={`font-bold ${text} text-foreground`}>
          sNAKr
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
