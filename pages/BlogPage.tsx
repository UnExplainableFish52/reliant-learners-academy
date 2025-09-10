import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Add '.ts' to constants import and include all necessary constants.
import { BLOG_POSTS, FACULTY_MEMBERS, STUDENTS } from '../constants.ts';
import type { BlogPost, FacultyMember, Student } from '../types';
import { getItems } from '../services/dataService';


const PostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    const [faculty, setFaculty] = useState<FacultyMember[]>(() => getItems('faculty', FACULTY_MEMBERS));
    const [students, setStudents] = useState<Student[]>(() => getItems('students', STUDENTS));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'faculty') setFaculty(getItems('faculty', FACULTY_MEMBERS));
            if (e.key === 'students') setStudents(getItems('students', STUDENTS));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const facultyMap = new Map(faculty.map(f => [f.id, f]));
    const studentMap = new Map(students.map(s => [s.id, s]));

    const author = post.authorType === 'student'
        ? studentMap.get(post.authorId)
        : facultyMap.get(post.authorId);
    
    const authorName = author ? author.name : 'Learners Academy';
    const authorImageUrl = author ? ('imageUrl' in author ? author.imageUrl : author.avatarUrl) : '';

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <ReactRouterDOM.Link to={`/blog/${post.id}`} className="block overflow-hidden">
                <img src={post.imageUrl.replace('/1200/800', '/800/600')} alt={post.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
            </ReactRouterDOM.Link>
            <div className="p-6 flex flex-col flex-grow">
                <div>
                    <p className="text-sm text-brand-red font-semibold">{post.tags.join(' / ')}</p>
                    <h2 className="text-xl font-bold mt-2 mb-3 group-hover:text-brand-red transition-colors min-h-[3.5rem] line-clamp-2">
                        <ReactRouterDOM.Link to={`/blog/${post.id}`}>{post.title}</ReactRouterDOM.Link>
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 flex-grow">{post.excerpt}</p>
                </div>
                <div className="mt-auto pt-6">
                    <div className="border-t pt-4 flex items-center">
                        {author && <img src={authorImageUrl.replace('/400/400', '/100/100')} alt={authorName} className="w-10 h-10 rounded-full mr-3" />}
                        <div>
                            <p className="font-semibold text-sm">{authorName}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(post.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.timeToRead} min read
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const FeaturedPost: React.FC<{ post: BlogPost }> = ({ post }) => {
    const [faculty, setFaculty] = useState<FacultyMember[]>(() => getItems('faculty', FACULTY_MEMBERS));
    const [students, setStudents] = useState<Student[]>(() => getItems('students', STUDENTS));

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'faculty') setFaculty(getItems('faculty', FACULTY_MEMBERS));
            if (e.key === 'students') setStudents(getItems('students', STUDENTS));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    const facultyMap = new Map(faculty.map(f => [f.id, f]));
    const studentMap = new Map(students.map(s => [s.id, s]));

    const author = post.authorType === 'student'
        ? studentMap.get(post.authorId)
        : facultyMap.get(post.authorId);

    const authorName = author ? author.name : 'Learners Academy';
    const authorImageUrl = author ? ('imageUrl' in author ? author.imageUrl : author.avatarUrl) : '';

    return (
        <section className="mb-12 md:mb-20">
            <div className="grid md:grid-cols-2 gap-8 items-center bg-brand-beige p-6 sm:p-8 rounded-lg shadow-lg">
                <div className="overflow-hidden rounded-md">
                    <ReactRouterDOM.Link to={`/blog/${post.id}`}>
                        <img src={post.imageUrl} alt={post.title} className="w-full object-cover transform hover:scale-105 transition-transform duration-500" />
                    </ReactRouterDOM.Link>
                </div>
                <div>
                    <p className="text-brand-red font-bold uppercase tracking-wider mb-2">Featured Post</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-dark hover:text-brand-red transition-colors">
                        <ReactRouterDOM.Link to={`/blog/${post.id}`}>{post.title}</ReactRouterDOM.Link>
                    </h2>
                    <p className="text-gray-600 my-4">{post.excerpt}</p>
                    <div className="flex items-center">
                        {author && <img src={authorImageUrl.replace('/400/400', '/100/100')} alt={authorName} className="w-12 h-12 rounded-full mr-4" />}
                        <div>
                            <p className="font-semibold">{authorName}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(post.publicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · {post.timeToRead} min read
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


const BlogPage: React.FC = () => {
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [activeTag, setActiveTag] = useState<string>('All');

    const loadPosts = useCallback(() => {
        setAllPosts(getItems('blogs', BLOG_POSTS));
    }, []);

    useEffect(() => {
        loadPosts(); // Initial load

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'blogs') {
                loadPosts();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadPosts]);

    const publishedPosts = useMemo(() => allPosts.filter(p => p.status === 'Published'), [allPosts]);
    const featuredPost = useMemo(() => publishedPosts.find(p => p.isFeatured), [publishedPosts]);
    const regularPosts = useMemo(() => publishedPosts.filter(p => !p.isFeatured), [publishedPosts]);

    const allTags = useMemo(() => ['All', ...Array.from(new Set(publishedPosts.flatMap(p => p.tags)))], [publishedPosts]);
    
    const filteredPosts = useMemo(() => {
        if (activeTag === 'All') return regularPosts;
        return regularPosts.filter(p => p.tags.includes(activeTag));
    }, [activeTag, regularPosts]);


    return (
        <div className="bg-white">
            <div className="bg-brand-dark text-white py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold">Learners Academy Blog</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto">Insights, tips, and career advice from our ACCA experts.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                {featuredPost && <FeaturedPost post={featuredPost} />}

                <div className="mb-12">
                     <h2 className="text-2xl font-bold text-center mb-6">Latest Posts</h2>
                     <div className="flex justify-center flex-wrap gap-2 md:gap-4">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-2 text-sm rounded-full font-semibold transition-colors duration-300 ${
                                    activeTag === tag
                                        ? 'bg-brand-red text-white shadow-md'
                                        : 'bg-gray-200 text-brand-dark hover:bg-gray-300'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
            </div>
        </div>
    );
};
// FIX: Added default export to the BlogPage component.
export default BlogPage;