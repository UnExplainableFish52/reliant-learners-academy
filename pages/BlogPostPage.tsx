import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Add '.ts' to constants import to resolve module not found error.
import { BLOG_POSTS, FACULTY_MEMBERS, STUDENTS } from '../constants.ts';
import type { BlogPost, Comment, FacultyMember, Student } from '../types';
import { getItems } from '../services/dataService';

const CommentSection: React.FC<{ initialComments: Comment[] }> = ({ initialComments }) => {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [authorName, setAuthorName] = useState('');
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!authorName.trim() || !commentText.trim()) return;

        setIsSubmitting(true);
        
        const newComment: Comment = {
            id: Date.now(),
            authorName,
            text: commentText,
            timestamp: new Date().toISOString(),
            authorImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&color=fff`,
        };

        // Simulate network delay
        setTimeout(() => {
            setComments(prev => [newComment, ...prev]);
            setAuthorName('');
            setCommentText('');
            setIsSubmitting(false);
        }, 500);
    };

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="mt-12 border-t pt-8">
            <h3 className="text-2xl font-bold mb-6">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h3>
            
            <div className="bg-brand-beige p-6 rounded-lg mb-8">
                <h4 className="font-bold text-lg mb-4">Leave a Reply</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">Name</label>
                        <input 
                            type="text" 
                            id="authorName"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                        />
                    </div>
                     <div>
                        <label htmlFor="commentText" className="block text-sm font-medium text-gray-700">Comment</label>
                        <textarea 
                            id="commentText"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={4} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-red focus:border-brand-red bg-white"
                        />
                    </div>
                    <div className="text-right">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-brand-red text-white py-2 px-6 rounded-md font-semibold hover:bg-red-700 transition-colors disabled:bg-red-300"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-4">
                        <img 
                            src={comment.authorImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}&background=random&color=fff`} 
                            alt={comment.authorName} 
                            className="w-12 h-12 rounded-full bg-gray-200" 
                        />
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-brand-dark">{comment.authorName}</p>
                                <p className="text-xs text-gray-500">{timeSince(comment.timestamp)}</p>
                            </div>
                            <p className="text-gray-700 mt-2">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Sidebar: React.FC<{ post: BlogPost; author: FacultyMember | Student; allPosts: BlogPost[] }> = ({ post, author, allPosts }) => {
    const relatedPosts = allPosts
        .filter(p => p.id !== post.id && p.status === 'Published' && p.tags.some(tag => post.tags.includes(tag)))
        .slice(0, 3);
    
    const authorImageUrl = 'imageUrl' in author ? author.imageUrl : author.avatarUrl;
    const isFaculty = 'qualification' in author;

    return (
        <aside className="space-y-8">
            {/* Author Card */}
            <div className="bg-brand-beige p-6 rounded-lg text-center">
                <img src={authorImageUrl} alt={author.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-md" />
                <h3 className="font-bold text-xl text-brand-dark">{author.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                    {isFaculty ? author.qualification : `Student ID: ${author.studentId}`}
                </p>
                <p className="text-sm text-gray-700">
                    {isFaculty ? author.bio : `Enrolled in ${author.currentLevel}`}
                </p>
            </div>
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="font-bold text-xl text-brand-dark mb-4 border-b pb-2">Related Posts</h3>
                    <div className="space-y-4">
                        {relatedPosts.map(p => (
                            <ReactRouterDOM.Link key={p.id} to={`/blog/${p.id}`} className="flex items-center gap-4 group">
                                <img src={p.imageUrl} alt={p.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-sm leading-tight group-hover:text-brand-red transition-colors">{p.title}</h4>
                                     <p className="text-xs text-gray-500 mt-1">{new Date(p.publicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                </div>
                            </ReactRouterDOM.Link>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};

const BlogPostPage: React.FC = () => {
    const { postId } = ReactRouterDOM.useParams<{ postId: string }>();
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    
    const loadData = useCallback(() => {
        setAllPosts(getItems('blogs', BLOG_POSTS));
        setFaculty(getItems('faculty', FACULTY_MEMBERS));
        setStudents(getItems('students', STUDENTS));
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, [loadData]);

    const post = useMemo(() => allPosts.find(p => p.id === postId), [allPosts, postId]);
    
    const facultyMap = useMemo(() => new Map(faculty.map(f => [f.id, f])), [faculty]);
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);

    const author = useMemo(() => {
        if (!post) return null;
        return post.authorType === 'student'
            ? studentMap.get(post.authorId)
            : facultyMap.get(post.authorId);
    }, [post, facultyMap, studentMap]);


    if (!post || !author) {
        // This will show briefly while loading from localStorage, or if post is not found
        return (
            <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
                <h1 className="text-3xl font-bold">Post Not Found</h1>
                <p className="mt-4">The post you are looking for does not exist or has been moved.</p>
                <ReactRouterDOM.Link to="/blog" className="mt-6 inline-block bg-brand-red text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700">
                    Back to Blog
                </ReactRouterDOM.Link>
            </div>
        );
    }

    const authorImageUrl = 'imageUrl' in author ? author.imageUrl : author.avatarUrl;

    return (
        <div className="bg-white">
            <style>{`
            .prose h1, .prose h2, .prose h3 {
                color: #000000;
                font-weight: 800;
                margin-top: 1.5em;
                margin-bottom: 0.8em;
            }
            .prose p {
                line-height: 1.75;
                margin-bottom: 1.25em;
                color: #333333;
            }
            .prose a {
                color: #B22222;
                text-decoration: none;
                font-weight: 600;
            }
            .prose a:hover {
                text-decoration: underline;
            }
            .prose ul, .prose ol {
                padding-left: 1.5em;
                margin-bottom: 1.25em;
            }
            .prose li {
                margin-bottom: 0.5em;
            }
            .prose li > p {
                margin-bottom: 0.5em;
            }
            .prose blockquote {
                border-left-color: #B22222;
                color: #333333;
                font-style: italic;
            }
            `}</style>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-12 md:py-20">
                <div className="max-w-4xl mx-auto mb-8">
                    <ReactRouterDOM.Link to="/blog" className="text-brand-red font-semibold hover:underline mb-4 inline-block">&larr; Back to all posts</ReactRouterDOM.Link>
                    <p className="text-sm text-brand-red font-semibold">{post.tags.join(' / ')}</p>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-dark my-4 leading-tight">{post.title}</h1>
                    <div className="flex items-center text-sm text-gray-500">
                        <img src={authorImageUrl.replace('/400/400', '/100/100')} alt={author.name} className="w-12 h-12 rounded-full mr-4" />
                        <div>
                            <p className="font-semibold text-brand-dark">{author.name}</p>
                            <p>
                                {new Date(post.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.timeToRead} min read
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <img src={post.imageUrl} alt={post.title} className="w-full max-w-5xl mx-auto rounded-lg shadow-lg" />
                </div>
                
                <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    <article
                        className="lg:col-span-2 prose prose-lg max-w-none"
                        // In a production app, ensure this HTML content is sanitized
                        // to prevent XSS attacks if it comes from untrusted sources.
                        // Here, it's considered safe as it's managed by the admin.
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    
                    <div className="lg:col-span-1">
                        <Sidebar post={post} author={author} allPosts={allPosts} />
                    </div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <CommentSection initialComments={post.comments || []} />
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;