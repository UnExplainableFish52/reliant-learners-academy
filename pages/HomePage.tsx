import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Add missing constant imports.
import { COURSES, TESTIMONIALS, BLOG_POSTS, FACULTY_MEMBERS, HERO_SLIDES, STUDENTS, HIGH_ACHIEVERS } from '../constants.ts';
import PopupNotificationManager from '../components/PopupNotification.tsx';
import AnimatedSection from '../components/AnimatedSection.tsx';
import type { BlogPost, FacultyMember, Student, Testimonial, HighAchiever, HeroSlide } from '../types.ts';
import { getItems } from '../services/dataService.ts';

const Hero = () => {
    const [slides, setSlides] = useState<HeroSlide[]>(() => getItems('banners', HERO_SLIDES));
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'banners') {
                setSlides(getItems('banners', HERO_SLIDES));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (slides.length === 0) return null;

    const currentSlide = slides[currentIndex];

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = useCallback(() => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, slides.length]);
    
    useEffect(() => {
        const timer = setTimeout(goToNext, 7000);
        return () => clearTimeout(timer);
    }, [currentIndex, slides.length, goToNext]);

    return (
        <>
            <style>{`
                @keyframes hero-fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hero-content-container > * {
                    opacity: 0; /* Start invisible */
                    animation: hero-fade-in-up 0.8s ease-out forwards;
                }
                /* Staggered delays */
                .hero-content-container > h1 {
                    animation-delay: 0.2s;
                }
                .hero-content-container > p {
                    animation-delay: 0.4s;
                }
                .hero-content-container > div {
                    animation-delay: 0.6s;
                }
            `}</style>
            <div className="relative bg-brand-dark h-[60vh] md:h-[70vh] w-full group">
                {/* Background Images */}
                <div className="w-full h-full">
                    {slides.map((slide, slideIndex) => (
                         <div key={slideIndex} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${slideIndex === currentIndex ? 'opacity-50' : 'opacity-0'}`}>
                            <img src={slide.url} alt={slide.alt} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                     <div key={currentIndex} className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-16 text-center text-white hero-content-container">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
                            {currentSlide.title.main}<br/> <span className="text-red-400">{currentSlide.title.highlighted}</span>
                        </h1>
                        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-200">
                            {currentSlide.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            {currentSlide.buttons.map((button) => (
                                <ReactRouterDOM.Link 
                                    key={button.to + button.text} 
                                    to={button.to} 
                                    className={`${
                                        button.variant === 'primary' 
                                            ? 'bg-brand-red text-white hover:bg-red-700' 
                                            : 'bg-white text-brand-dark hover:bg-gray-200'
                                    } px-8 py-3 rounded-md font-semibold transition-transform hover:scale-105 shadow-lg`}
                                >
                                    {button.text}
                                </ReactRouterDOM.Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button onClick={goToPrevious} className="absolute top-1/2 left-5 transform -translate-y-1/2 p-2 bg-black bg-opacity-30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-50 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goToNext} className="absolute top-1/2 right-5 transform -translate-y-1/2 p-2 bg-black bg-opacity-30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-50 z-10">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {slides.map((_, slideIndex) => (
                        <button key={slideIndex} onClick={() => setCurrentIndex(slideIndex)} className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === slideIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}></button>
                    ))}
                </div>
            </div>
        </>
    );
};


const WhyChooseUs = () => {
    const features = [
        {
            icon: (
                <div className="relative w-24 h-24 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <radialGradient id="grad-faculty" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
                                <stop offset="0%" stop-color="#F8D7DA" />
                                <stop offset="100%" stop-color="#B22222" />
                            </radialGradient>
                            <filter id="shadow-3d" x="-50%" y="-50%" width="200%" height="200%">
                               <feDropShadow dx="4" dy="6" stdDeviation="5" flood-color="#B22222" flood-opacity="0.2"/>
                            </filter>
                        </defs>
                        <g filter="url(#shadow-3d)">
                            <circle cx="50" cy="50" r="45" fill="url(#grad-faculty)" />
                            {/* Stylized graduation cap */}
                            <path d="M50 35 L25 50 L50 65 L75 50 Z M25 52 V 62 L50 75 L75 62 V 52 L50 65 Z" fill="#fff" opacity="0.9"/>
                        </g>
                    </svg>
                </div>
            ),
            title: 'Expert Faculty',
            description: 'Learn from seasoned ACCA-certified professionals who bring real-world experience and personalized mentorship to every class.'
        },
        {
            icon: (
                 <div className="relative w-24 h-24 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <radialGradient id="grad-passrate" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
                                <stop offset="0%" stop-color="#d4edda"/>
                                <stop offset="100%" stop-color="#28a745"/>
                            </radialGradient>
                        </defs>
                        <g filter="url(#shadow-3d)">
                            <circle cx="50" cy="50" r="45" fill="url(#grad-passrate)" />
                            {/* Upward chart icon */}
                            <path d="M30 75 L45 55 L55 65 L70 40" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M60 40 L70 40 L70 50" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                    </svg>
                </div>
            ),
            title: 'Proven Pass Rates',
            description: 'Join an academy with a track record of excellence, consistently achieving pass rates that surpass global averages.'
        },
        {
            icon: (
                <div className="relative w-24 h-24 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <radialGradient id="grad-resources" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
                                <stop offset="0%" stop-color="#d1ecf1"/>
                                <stop offset="100%" stop-color="#17a2b8"/>
                            </radialGradient>
                        </defs>
                        <g filter="url(#shadow-3d)">
                             <circle cx="50" cy="50" r="45" fill="url(#grad-resources)" />
                             {/* Book/document icon */}
                             <path d="M30 25 h40 a5 5 0 0 1 5 5 v40 a5 5 0 0 1 -5 5 h-40 a5 5 0 0 1 -5 -5 v-40 a5 5 0 0 1 5 -5z M35 40 h30 M35 55 h30 M35 70 h20" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round"/>
                        </g>
                    </svg>
                </div>
            ),
            title: 'Cutting-Edge Resources',
            description: 'Access our exclusive digital library, including comprehensive study notes, extensive mock exams, and an AI-powered progress tracker.'
        },
        {
            icon: (
                <div className="relative w-24 h-24 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <radialGradient id="grad-support" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
                                <stop offset="0%" stop-color="#fff3cd"/>
                                <stop offset="100%" stop-color="#ffc107"/>
                            </radialGradient>
                        </defs>
                        <g filter="url(#shadow-3d)">
                            <circle cx="50" cy="50" r="45" fill="url(#grad-support)" />
                            {/* Briefcase icon */}
                            <path d="M25 40 h50 v30 h-50z" fill="#fff" stroke="#ffc107" strokeWidth="2" rx="5"/>
                            <path d="M40 40 v-10 a10 5 0 0 1 20 0 v10" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round"/>
                        </g>
                    </svg>
                </div>
            ),
            title: 'Career-Focused Support',
            description: 'Benefit from dedicated career counseling, internship placements, and networking events that connect you with top employers.'
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-brand-dark leading-tight">
                        Why Choose <span className="text-brand-red">Reliant Learners</span>?
                    </h2>
                    <p className="text-gray-600 mt-4 max-w-3xl mx-auto text-lg">
                        We don't just teach. We build careers, foster connections, and pave your path to success in the world of finance.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {features.map(feature => (
                        <div key={feature.title} className="group p-6 bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-b-4 border-transparent hover:border-brand-red">
                            {feature.icon}
                            <h3 className="text-xl font-bold mt-6 mb-2 text-brand-dark">{feature.title}</h3>
                            <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const StatCounter = ({ end, duration = 2000, label, suffix = '' }: { end: number; duration?: number; label: string; suffix?: string; }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let start = 0;
        const endValue = end;
        if (start === endValue) return;

        const totalFrames = Math.round(duration / (1000 / 60));
        const increment = (endValue - start) / totalFrames;

        let currentFrame = 0;
        let animationFrameId: number;

        const counter = () => {
            currentFrame += 1;
            const newCount = Math.round(start + (increment * currentFrame));
            
            if (currentFrame < totalFrames) {
                setCount(newCount);
                animationFrameId = requestAnimationFrame(counter);
            } else {
                setCount(endValue);
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animationFrameId = requestAnimationFrame(counter);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (countRef.current) {
            observer.observe(countRef.current);
        }
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
        }

    }, [end, duration]);

    return (
        <div className="text-center">
            <span ref={countRef} className="text-4xl md:text-5xl font-black text-brand-red">
                {count.toLocaleString()}{suffix}
            </span>
            <p className="mt-2 text-lg text-gray-300">{label}</p>
        </div>
    );
};

const OutstandingStudents = () => {
    const [highAchievers, setHighAchievers] = useState<HighAchiever[]>(() => getItems('highAchievers', HIGH_ACHIEVERS));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'highAchievers') {
                setHighAchievers(getItems('highAchievers', HIGH_ACHIEVERS));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (highAchievers.length === 0) return null;

    return (
        <div className="mt-16 text-center">
            <style>{`
                @keyframes fade-in-scale-up-student {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .student-card {
                    opacity: 0;
                    animation: fade-in-scale-up-student 0.6s ease-out forwards;
                }
            `}</style>
            <h3 className="text-3xl font-bold text-white mb-8">Meet Our High Achievers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8">
                {highAchievers.map((student, index) => (
                    <div
                        key={student.id}
                        className="student-card flex flex-col items-center"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-brand-red object-cover shadow-lg transform transition-transform hover:scale-110"
                        />
                        <p className="mt-4 font-bold text-white text-lg">{student.name}</p>
                        <p className="text-sm text-red-300 text-center">{student.achievement}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ProvenRecords = () => (
    <section className="py-12 md:py-20 bg-brand-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Our Proven Records</h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Decades of dedication, reflected in numbers.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
                <StatCounter end={95} suffix="%" label="High Pass Rate" />
                <StatCounter end={5000} suffix="+" label="Successful Alumni" />
                <StatCounter end={10} suffix="+" label="Years of Excellence" />
                <StatCounter end={98} suffix="%" label="Student Satisfaction" />
            </div>
            <OutstandingStudents />
        </div>
    </section>
);


const ACCAPrograms = () => (
     <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Your Pathway to ACCA Qualification</h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">We provide a clear, structured path from foundational knowledge to professional expertise, ensuring you are exam-ready at every stage.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {COURSES.map(course => (
                    <div key={course.id} className="bg-brand-beige p-8 rounded-lg shadow-lg flex flex-col">
                        <h3 className="text-2xl font-bold text-brand-red mb-4">{course.title}</h3>
                        <p className="text-gray-600 mb-6 flex-grow text-base">{course.description}</p>
                        <div className="border-t pt-4 space-y-2">
                             <p><strong>Duration:</strong> {course.duration}</p>
                             <p><strong>Eligibility:</strong> {course.eligibility}</p>
                        </div>
                        <ReactRouterDOM.Link to={`/courses/${course.id}`} className="mt-6 font-semibold text-brand-red hover:text-brand-dark self-start">Learn More &rarr;</ReactRouterDOM.Link>
                    </div>
                ))}
            </div>
        </div>
    </section>
);


const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getItems('testimonials', TESTIMONIALS));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'testimonials') {
                setTestimonials(getItems('testimonials', TESTIMONIALS));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (testimonials.length === 0) {
        return null;
    }
    
    return (
     <section className="py-12 md:py-20 bg-brand-beige">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">What Our Students Say</h2>
                <p className="text-gray-600 mt-2">Real stories from our successful alumni.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 pt-12">
                {testimonials.map(t => (
                    <div key={t.id} className="bg-white p-8 rounded-lg text-center shadow-lg relative">
                        <img src={t.imageUrl} alt={t.name} className="w-24 h-24 rounded-full mx-auto absolute -top-12 left-1/2 -translate-x-1/2 border-4 border-white shadow-md" />
                        <div className="mt-14">
                             <p className="text-gray-700 italic mb-4 text-lg">"{t.quote}"</p>
                            <p className="font-bold text-lg text-brand-dark">{t.name}</p>
                            <p className="text-brand-red font-semibold">{t.program}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

const LatestBlogPosts = () => {
    const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    
    const facultyMap = new Map(faculty.map(f => [f.id, f]));
    const studentMap = new Map(students.map(s => [s.id, s]));
    
    const loadPosts = useCallback(() => {
        const blogContent = getItems('blogs', BLOG_POSTS);
        const facultyData = getItems('faculty', FACULTY_MEMBERS);
        const studentData = getItems('students', STUDENTS);

        setFaculty(facultyData);
        setStudents(studentData);
        
        const published = blogContent.filter(p => p.status === 'Published');
        setLatestPosts(published.slice(0, 3));
    }, []);

    useEffect(() => {
        loadPosts(); // Initial load

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'blogs' || event.key === 'faculty' || event.key === 'students') {
                loadPosts();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadPosts]);


    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">From Our Blog</h2>
                    <p className="text-gray-600 mt-2">Get the latest insights, tips, and news from our experts.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latestPosts.map(post => {
                        const author = post.authorType === 'student'
                            ? studentMap.get(post.authorId)
                            : facultyMap.get(post.authorId);
                        const authorName = author ? author.name : 'Learners Academy';
                        const authorImageUrl = author ? ('imageUrl' in author ? author.imageUrl : author.avatarUrl) : '';

                        return (
                            <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group">
                                <img src={post.imageUrl.replace('/1200/800', '/800/600')} alt={post.title} className="w-full h-56 object-cover" />
                                <div className="p-6 flex flex-col flex-grow">
                                    <div>
                                        <p className="text-sm text-brand-red font-semibold">{post.tags.join(', ')}</p>
                                        <h3 className="text-xl font-bold mt-2 mb-3 group-hover:text-brand-red transition-colors min-h-[3.5rem] line-clamp-2">{post.title}</h3>
                                        <p className="text-gray-600 text-base line-clamp-3">{post.excerpt}</p>
                                    </div>
                                    <div className="mt-auto pt-6">
                                        <div className="border-t pt-4 flex items-center">
                                            {author && <img src={authorImageUrl.replace('/400/400', '/100/100')} alt={authorName} className="w-10 h-10 rounded-full mr-3" />}
                                            <div>
                                                <p className="font-semibold text-sm">{authorName}</p>
                                                <p className="text-xs text-gray-500">{new Date(post.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <ReactRouterDOM.Link to={`/blog/${post.id}`} className="mt-4 font-semibold text-brand-red self-start block">Read More &rarr;</ReactRouterDOM.Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-12">
                    <ReactRouterDOM.Link to="/blog" className="bg-brand-dark text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-80 transition-transform hover:scale-105 shadow-lg">View All Posts</ReactRouterDOM.Link>
                </div>
            </div>
        </section>
    );
};

const CallToAction = () => (
    <section className="bg-brand-red text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-16 text-center">
            <h2 className="text-3xl font-bold mb-2">Ready to Start Your ACCA Journey?</h2>
            <p className="mb-6 max-w-2xl mx-auto text-lg">Join hundreds of successful students who chose Reliant Learners Academy for their professional accounting career. Apply today to secure your spot for the next intake.</p>
            <ReactRouterDOM.Link to="/admissions" className="bg-white text-brand-red px-10 py-3 rounded-md font-bold hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg">Apply Now</ReactRouterDOM.Link>
        </div>
    </section>
);


const HomePage: React.FC = () => {
    return (
        <div>
            <Hero />
            <AnimatedSection><WhyChooseUs /></AnimatedSection>
            <AnimatedSection><ProvenRecords /></AnimatedSection>
            <AnimatedSection><ACCAPrograms /></AnimatedSection>
            <AnimatedSection><Testimonials /></AnimatedSection>
            <AnimatedSection><LatestBlogPosts /></AnimatedSection>
            <AnimatedSection><CallToAction /></AnimatedSection>
            <PopupNotificationManager />
        </div>
    );
};

export default HomePage;