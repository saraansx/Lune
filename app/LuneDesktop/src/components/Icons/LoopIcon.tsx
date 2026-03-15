export const LoopIcon = ({ size = 24, color = "currentColor", showOne = false }: { size?: number, color?: string, showOne?: boolean }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative' }}>
        <path d="M17 1l4 4-4 4"></path>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
        <path d="M7 23l-4-4 4-4"></path>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        {showOne && (
            <text 
                x="12" y="13" 
                fontSize="12" 
                fontWeight="900" 
                fill={color} 
                stroke="none" 
                textAnchor="middle"
                style={{ dominantBaseline: 'middle' }}
            >1</text>
        )}
    </svg>
);
