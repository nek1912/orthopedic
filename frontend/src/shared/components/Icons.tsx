import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function JointIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}



export function SpineIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="9" y="3" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="8" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="13" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="18" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="6" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="11" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="16" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}



export function FractureIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M6 4C5 4 4 5 4 6.5C4 8 5.5 9 7 10L17 14C18.5 15 20 16 20 17.5C20 19 19 20 18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 9L10 12L13 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}



export function SportsMedicineIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}



export function ArthritisIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8V12L15 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  )
}



export function CheckupIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M12 21A9 9 0 1 0 12 3a9 9 0 0 0 0 18z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CalendarIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

export function ClockIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function UserIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function UsersIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 19C3 16.239 5.686 14 9 14C12.314 14 15 16.239 15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M17 13C19.761 13 22 14.916 22 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function ChartIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M4 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function SunIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 12H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function StarIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M12 2L14.4 8.6L21.6 9.2L16.2 13.8L17.8 21L12 17.2L6.2 21L7.8 13.8L2.4 9.2L9.6 8.6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

export function PhoneIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M5 4H9L11 9L8.5 10.5C9.57 12.67 11.33 14.43 13.5 15.5L15 13L20 15V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21C14.0993 20.763 10.4202 19.1065 7.65685 16.3431C4.8935 13.5798 3.23701 9.90074 3 6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function MapPinIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

export function SparkleIcon({ className = '', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
