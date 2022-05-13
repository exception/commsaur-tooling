import React from 'react';

type Props = {
    onClick: () => void;
};

function DownloadIcon({ onClick }: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 ml-2 text-gray-500 hover:text-gray-600 cursor-pointer hover:scale-[.98]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            onClick={onClick}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
        </svg>
    );
}

export default React.memo(DownloadIcon);
