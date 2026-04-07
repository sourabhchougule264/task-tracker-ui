import React from 'react';
import { Box } from '@mui/material';

interface LogoProps {
    size?: number;
    showText?: boolean;
    textColor?: string;
    onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
                                       size = 40,
                                       showText = true,
                                       textColor = 'white',
                                       onClick
                                   }) => {
    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? {
                    opacity: 0.9,
                } : {},
            }}
        >
            {/* Logo Icon */}
            <Box
                sx={{
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* Using your specific Pulse Colors for the background gradient */}
                        <linearGradient id="pulseCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6554C0" />
                            <stop offset="100%" stopColor="#36B37E" />
                        </linearGradient>

                        {/* White gradient for the pulse line to make it pop against the background */}
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {/* Main Circle Background */}
                    <circle cx="50" cy="50" r="48" fill="url(#pulseCircleGradient)" />

                    {/* The Pulse Path - Re-scaled for 100x100 and centered */}
                    <path
                        d="M 20 50 h 12 l 6 -18 l 12 36 l 6 -18 h 12"
                        stroke="url(#lineGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    {/* Tracking Activity Dots (The "Tracker" elements) */}
                    <circle cx="75" cy="50" r="4" fill="white" opacity="0.8" />
                    <circle cx="85" cy="50" r="4" fill="white" opacity="0.5" />
                    <circle cx="93" cy="50" r="2" fill="white" opacity="0.2" />

                    {/* Subtle Grid lines to match the "Tracker/Jira" aesthetic */}
                    <line x1="20" y1="50" x2="80" y2="50" stroke="white" strokeWidth="0.5" opacity="0.2" />
                </svg>
            </Box>

            {/* Logo Text */}
            {showText && (
                <Box>
                    <Box
                        component="span"
                        sx={{
                            fontSize: size * 0.5,
                            fontWeight: 700,
                            color: textColor,
                            letterSpacing: '-0.5px',
                            display: 'block',
                            lineHeight: 1.2,
                        }}
                    >
                        Task Tracker
                    </Box>
                    <Box
                        component="span"
                        sx={{
                            fontSize: size * 0.25,
                            color: textColor,
                            opacity: 0.9,
                            display: 'block',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Project Management
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Logo;


