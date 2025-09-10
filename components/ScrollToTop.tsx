import { useEffect } from 'react';
// FIX: Changed import from react-router to react-router-dom for core hook.
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = ReactRouterDOM.useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;