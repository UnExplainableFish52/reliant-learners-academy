import React from 'react';
// FIX: Consolidating all react-router-dom imports to resolve module export errors.
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import CoursesPage from './pages/CoursesPage.tsx';
import AdmissionsPage from './pages/AdmissionsPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import GalleryPage from './pages/GalleryPage.tsx';
import FAQPage from './pages/FAQPage.tsx';
import StudentPortalPage from './pages/StudentPortalPage.tsx';
import FacultyPortalPage from './pages/FacultyPortalPage.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import CourseDetailPage from './pages/CourseDetailPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AdminPortalPage from './pages/AdminPortalPage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogPostPage from './pages/BlogPostPage.tsx';
import FeeStructurePage from './pages/FeeStructurePage.tsx';
import VlogsPage from './pages/VlogsPage.tsx';
import DeploymentGuidePage from './pages/DeploymentGuidePage.tsx';

const MainLayout = () => (
    <>
        <Header />
        <main className="flex-grow">
            <ReactRouterDOM.Outlet />
        </main>
        <Footer />
    </>
);


const App: React.FC = () => {
    return (
        <ReactRouterDOM.HashRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
                 <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route element={<MainLayout />}>
                        <ReactRouterDOM.Route path="/" element={<HomePage />} />
                        <ReactRouterDOM.Route path="/about" element={<AboutPage />} />
                        <ReactRouterDOM.Route path="/courses" element={<CoursesPage />} />
                        <ReactRouterDOM.Route path="/courses/:courseId" element={<CourseDetailPage />} />
                        <ReactRouterDOM.Route path="/admissions" element={<AdmissionsPage />} />
                        {/* Add route for the new Fee Structure page. */}
                        <ReactRouterDOM.Route path="/fees" element={<FeeStructurePage />} />
                        <ReactRouterDOM.Route path="/gallery" element={<GalleryPage />} />
                        <ReactRouterDOM.Route path="/faq" element={<FAQPage />} />
                        <ReactRouterDOM.Route path="/blog" element={<BlogPage />} />
                        <ReactRouterDOM.Route path="/blog/:postId" element={<BlogPostPage />} />
                        <ReactRouterDOM.Route path="/vlogs" element={<VlogsPage />} />
                        <ReactRouterDOM.Route path="/contact" element={<ContactPage />} />
                    </ReactRouterDOM.Route>
                    
                    <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
                    <ReactRouterDOM.Route path="/student-portal/*" element={<StudentPortalPage />} />
                    <ReactRouterDOM.Route path="/faculty-portal/*" element={<FacultyPortalPage />} />
                    <ReactRouterDOM.Route path="/admin-portal/*" element={<AdminPortalPage />} />
                    <ReactRouterDOM.Route path="/deployment-guide" element={<DeploymentGuidePage />} />
                </ReactRouterDOM.Routes>
            </div>
        </ReactRouterDOM.HashRouter>
    );
};

export default App;