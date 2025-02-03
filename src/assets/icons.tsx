// Define the props interface for the component
interface IconProps {
    className?: string;
}

function ProfileIcon(props: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={props.className}
        >
            <path d="M18 20a6 6 0 0 0-12 0"/>
            <circle cx="12" cy="10" r="4"/>
            <circle cx="12" cy="12" r="10"/>
        </svg>
    );
}

function PlayIcon(props: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={props.className}
        >
            <polygon points="6 3 20 12 6 21 6 3"/>
        </svg>
    );
}

function StopIcon(props: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={props.className}
        >
            <rect width="18" height="18" x="3" y="3" rx="2"/>
        </svg>
    );
}

export {
    ProfileIcon,
    PlayIcon,
    StopIcon
} 
