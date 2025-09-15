

import React from 'react';
import 'react/jsx-runtime';

// A flexible props type for all SVG icons, allowing any standard SVG attribute.
type IconProps = React.SVGProps<SVGSVGElement>;

// Location for the app logos. The user can replace the logo files in the public directory.
const logoLightSrc = "/logolight.png";
const logoDarkSrc = "/logodark.png";

export const AppLogo: React.FC<{ className?: string }> = ({ className }) => (
    <>
        <img src={logoLightSrc} alt="MyNutriMate Logo" className={`dark:hidden ${className}`} />
        <img src={logoDarkSrc} alt="MyNutriMate Logo" className={`hidden dark:block ${className}`} />
    </>
);

// Location for the banner images.
const bannerLightSrc = "/bannerlight.png";
const bannerDarkSrc = "/bannerdark.png";

export const FooterBanner: React.FC<{ className?: string }> = ({ className }) => (
    <>
        <img src={bannerLightSrc} alt="Footer Banner" className={`dark:hidden ${className}`} />
        <img src={bannerDarkSrc} alt="Footer Banner" className={`hidden dark:block ${className}`} />
    </>
);

const sharedSvgProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export const UploadCloudIcon: React.FC<IconProps> = (props) => (
  <svg {...sharedSvgProps} {...props}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = (props) => (
  <svg {...sharedSvgProps} {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const RefreshCwIcon: React.FC<IconProps> = (props) => (
    <svg {...sharedSvgProps} {...props}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
    </svg>
);

export const EditIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>;

const IconBase: React.FC<IconProps> = ({ children, className, ...props }) => (
  <svg {...sharedSvgProps} className={className ?? "h-6 w-6"} {...props}>
    {children}
  </svg>
);

// --- Nutrient Icons (Updated) ---

// Calories
export const FlameIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M11.5 12.5c0 .55.19 1.05.53 1.47.33.42.76.76 1.25.97L12 20M12 4c-1.78 2.3-1.03 5.33.92 7.28.52.52.48 1.36-.08 1.72-.44.29-1.03.1-1.35-.31-.32-.42-.66-1.07-1.1-1.69-1.3-1.84-2.84-3.48-2.84-5.32A4.5 4.5 0 0 1 12 4Z"/><path d="M8.27 12.15c-.29-.4-.1-1.03.31-1.35.33-.26.83-.26 1.18-.02.43.3.82.88 1.14 1.45.32.57.65 1.22 1.1 1.69.56.56 1.4.6 1.88.12.56-.56.5-1.56-.12-2.04-1.95-1.52-2.4-4.21-1.2-6.32-2.5 1-4.5 4-4.5 6.5A4.5 4.5 0 0 0 8.27 12.15Z"/></IconBase>;
// Protein (Muscle Icon)
export const WeightIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></IconBase>;
// Carbs (Wheat Icon)
export const ZapIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M2 22v-6.17a3 3 0 0 1 .58-1.75l5.17-8.61a3 3 0 0 1 2.5-1.47h0a3 3 0 0 1 2.5 1.47l5.17 8.61a3 3 0 0 1 .58 1.75V22"/><path d="M9 13a3 3 0 0 1 6 0"/><path d="M9.5 7.5a3 3 0 0 1 5 0"/></IconBase>;
// Fat (Oil Drop Icon)
export const DropletsIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M15.8 21.3a8 8 0 0 1-5.6-5.6C8.8 13.2 12 2 12 2s3.2 11.2 1.8 13.7a8 8 0 0 1-5.6 5.6Z"/></IconBase>;
// Sugar (Cube Icon)
export const WindIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 10.5 16 18"/><path d="m8 18 4-7.5"/></IconBase>;
// Sodium (Salt Shaker Icon)
export const WavesIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M13.5 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M12.5 4.5a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/><path d="M10.5 12.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M18 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M16 6a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/><path d="M14 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M15 22H9a2 2 0 0 1-2-2v-4.34a1 1 0 0 1 .29-.7l2.42-2.42a1 1 0 0 1 1.42 0l2.58 2.58a1 1 0 0 0 1.42 0l2.42-2.42a1 1 0 0 1 .29-.7V20a2 2 0 0 1-2 2Z"/></IconBase>;

// Micronutrient Icons
export const LeafIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M11 20A7 7 0 0 1 7 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a4 4 0 1 0 4 4h1a3 3 0 0 0 3-3V9a1 1 0 0 0-1-1H4" /></IconBase>;
export const BoneIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M16.5 5c-1.38 0-2.5 1.12-2.5 2.5 0 .61.22 1.16.58 1.59L5.12 18.55c-.59.59-.59 1.54 0 2.12l.71.71c.59.59 1.54.59 2.12 0L18.41 10.92c.43.36.98.58 1.59.58 1.38 0 2.5-1.12 2.5-2.5S17.88 5 16.5 5z"/><path d="m8.5 16c-1.38 0-2.5-1.12-2.5-2.5S7.12 11 8.5 11s2.5 1.12 2.5 2.5S9.88 16 8.5 16z"/></IconBase>;
export const ShieldIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconBase>;
export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled, ...props }) => (
  <svg {...sharedSvgProps} fill={filled ? "currentColor" : "none"} stroke="currentColor" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
// New icon for Vitamin A
export const EyeIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></IconBase>;
// New icon for Vitamin C
export const CitrusIcon: React.FC<IconProps> = (props) => <IconBase {...props}><path d="M21.66 12.58A9 9 0 1 1 11.42 2.34"/><path d="M21.66 12.58A9 9 0 0 0 12.58 2.34"/><path d="M2.34 11.42A9 9 0 0 0 11.42 21.66"/><path d="M2.34 11.42A9 9 0 0 1 12.58 2.34"/><path d="M12 12 5.23 7.66"/><path d="M12 12 7.66 18.77"/><path d="M12 12 16.34 5.23"/><path d="M12 12 18.77 16.34"/></IconBase>;

// Main Nav Icons
export const HomeIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
export const CameraIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>;
export const BookOpenIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
export const UserIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
export const UsersIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
export const SaveIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
export const ArrowLeftIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
export const SunIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
export const MoonIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
export const LogOutIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
export const XIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
export const LightbulbIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-7 7c0 3.07 1.63 5.57 4 6.93V18h6v-2.07c2.37-1.36 4-3.86 4-6.93a7 7 0 0 0-7-7Z" />
</svg>;
export const CalendarDaysIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
export const TrendingUpIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
export const CheckCircleIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
export const AlertCircleIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;

// New AI Bot Icon
export const SparklesIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props} strokeWidth="1.5">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
    <path d="M18 6L17 3L16 6L13 7L16 8L17 11L18 8L21 7L18 6Z"/>
    <path d="M6 18L7 21L8 18L11 17L8 16L7 13L6 18Z"/>
</svg>;

export const PrintIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;

export const DownloadIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
export const PhoneIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
export const ClipboardIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
export const CheckIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><polyline points="20 6 9 17 4 12"/></svg>;
export const GlobeIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>;
export const UtensilsCrossedIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8-11.3 11.3-1.4-1.4-1.8-1.8a3 3 0 0 1 0-4.2L3.6 12l1.8 1.8a3 3 0 0 0 4.2 0L12 11.4l2.8 2.8a3 3 0 0 0 4.2 0l2.3-2.3Z" /><path d="m22 6-2.3 2.3a3 3 0 0 1-4.2 0L14.7 7.5l-1.8-1.8a3 3 0 0 0-4.2 0L6.4 8.1 4.6 6.3a3 3 0 0 1 0-4.2L6.9 2l1.8 1.8a3 3 0 0 0 4.2 0l2.3-2.3" /></svg>;
export const FileTextIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>;
export const PlusIcon: React.FC<IconProps> = (props) => (
  <svg {...sharedSvgProps} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
export const SendIcon: React.FC<IconProps> = (props) => (
  <svg {...sharedSvgProps} {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);
export const ShoppingCartIcon: React.FC<IconProps> = (props) => (
    <svg {...sharedSvgProps} {...props}>
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" />
    </svg>
);
export const FolderHeartIcon: React.FC<IconProps> = (props) => (
    <svg {...sharedSvgProps} {...props}>
        <path d="M11 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v1.5" />
        <path d="M21.29 14.7a2.43 2.43 0 0 0-2.65-.52c-.3.12-.57.3-.8.53l-.34.34-.35-.34a2.43 2.43 0 0 0-2.65-.52c-1.38.34-2.29 1.86-1.84 3.28.16.52.46.98.88 1.32l3.47 3.47a.5.5 0 0 0 .7 0l3.47-3.47c.42-.34.72-.8.88-1.32.45-1.42-.46-2.94-1.84-3.28Z" />
    </svg>
);
export const Volume2Icon: React.FC<IconProps> = (props) => (
    <svg {...sharedSvgProps} {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);
export const VolumeXIcon: React.FC<IconProps> = (props) => (
    <svg {...sharedSvgProps} {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="22" y1="9" x2="16" y2="15" />
        <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
);
export const ChevronDownIcon: React.FC<IconProps> = (props) => <svg {...sharedSvgProps} {...props}><path d="m6 9 6 6 6-6"/></svg>;
