interface AtomLogoProps {
  size?: number;
  className?: string;
}

export default function AtomLogo({ size = 48, className = '' }: AtomLogoProps) {
  const atomSize = `${size}px`;

  return (
    <div className={`atom-loader-shell ${className}`} style={{ ['--atom-size' as string]: atomSize }}>
      <div className="atom-loader-react" aria-hidden="true">
        <div className="atom-line atom-line-1" />
        <div className="atom-line atom-line-2" />
        <div className="atom-line atom-line-3" />
      </div>
    </div>
  );
}
