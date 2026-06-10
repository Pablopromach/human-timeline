interface Props {
  size?: number
  className?: string
}

export default function HumanTimelineIcon({ size = 18, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left vertical of H */}
      <line
        x1="5" y1="4" x2="5" y2="20"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Right vertical of H */}
      <line
        x1="19" y1="4" x2="19" y2="20"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Crossbar — timeline */}
      <line
        x1="5" y1="12" x2="19" y2="12"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />
      {/* Life dot 1 */}
      <circle cx="9.5" cy="12" r="1.6" fill="white" fillOpacity="0.95" />
      {/* Life dot 2 */}
      <circle cx="14.5" cy="12" r="1.6" fill="white" fillOpacity="0.95" />
    </svg>
  )
}
