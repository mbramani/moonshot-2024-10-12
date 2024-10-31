import { useEffect, useState } from 'react';

interface WindowSize {
    width: number;
    height: number;
}

const getWindowSize = (): WindowSize => ({
    width: window.innerWidth,
    height: window.innerHeight,
});

export function useResize(): WindowSize {
    const [windowSize, setWindowSize] = useState<WindowSize>(() =>
        typeof window !== 'undefined'
            ? getWindowSize()
            : { width: 0, height: 0 }
    );

    useEffect(() => {
        const handleResize = () => {
            setWindowSize(getWindowSize());
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowSize;
}
