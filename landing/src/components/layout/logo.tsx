import { cn } from '@/lib/utils';

interface LogoProps {
  iconClassName?: string;
  wordmarkClassName?: string;
  className?: string;
  href?: string;
  noLink?: boolean;
}

export default function Logo({
  iconClassName,
  wordmarkClassName,
  className,
  href = '/',
  noLink = false,
}: LogoProps) {
  const Element = noLink ? 'div' : 'a';

  return (
    <Element
      href={href}
      className={cn(
        'flex items-center gap-1.75 text-xl font-medium',
        className,
      )}
    >
      <img
        src="/logo.png"
        alt="Pabrik Startup"
        className={cn('w-7 h-7 object-contain rounded-md', iconClassName)}
      />
      <span className={cn('', wordmarkClassName)}>Pabrik Startup</span>
    </Element>
  );
}
