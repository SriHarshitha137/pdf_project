interface IconProps {
  d: string | string[];
  size?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Icon({
  d,
  size = 20,
  stroke = "currentColor",
  fill = "none",
  strokeWidth = 1.8,
  className,
  style,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {Array.isArray(d)
        ? d.map((path, i) => <path key={i} d={path} />)
        : <path d={d} />}
    </svg>
  );
}
