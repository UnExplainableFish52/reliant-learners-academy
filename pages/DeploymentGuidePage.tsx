import React from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Corrected import from ACADEMY_LOGO_URL to DEFAULT_ACADEMY_LOGO_URL.
import { DEFAULT_ACADEMY_LOGO_URL, ACADEMY_NAME } from '../constants.ts';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm my-4">
        <code>{children}</code>
    </pre>
);

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="mb-8">
        <div className="flex items-center mb-4">
            <div className="bg-brand-red text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl flex-shrink-0">
                {number}
            </div>
            <h2 className="text-2xl font-bold text-brand-dark ml-4">{title}</h2>
        </div>
        <div className="pl-14 border-l-2 border-gray-200 ml-5">
            <div className="ml-6 space-y-4 text-gray-700">
                {children}
            </div>
        </div>
    </div>
);

const DeploymentGuidePage: React.FC = () => {
    return (
        <div className="bg-brand-beige min-h-screen font-sans">
            <header className="bg-white shadow-md p-4">
                <div className="container mx-auto flex items-center gap-4">
                    {/* FIX: Used the correct constant name DEFAULT_ACADEMY_LOGO_URL. */}
                    <img src={DEFAULT_ACADEMY_LOGO_URL} alt="Academy Logo" className="h-12 w-auto" />
                    <div>
                        <h1 className="text-xl font-bold text-brand-dark">{ACADEMY_NAME}</h1>
                        <p className="text-sm text-gray-600">Deployment Guide</p>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="bg-white p-6 md:p-10 rounded-lg shadow-xl max-w-4xl mx-auto">
                    <h1 className="text-4xl font-black text-brand-dark text-center mb-4">Let's Get Your Website Online!</h1>
                    <p className="text-center text-gray-600 mb-12">Follow these steps to deploy your website to the internet for free. This process typically takes about 10-15 minutes.</p>

                    <Step number={1} title="Prerequisites">
                        <p>Before we start, make sure you have the following:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Git:</strong> A version control system. If you don't have it, <a href="https://git-scm.com/downloads" target="_blank" rel="noopener noreferrer" className="text-brand-red font-semibold hover:underline">download it here</a>.</li>
                            <li><strong>A GitHub Account:</strong> If you don't have one, <a href="https://github.com/join" target="_blank" rel="noopener noreferrer" className="text-brand-red font-semibold hover:underline">sign up for free</a>.</li>
                        </ul>
                    </Step>

                    <Step number={2} title="Get Your Code on GitHub">
                        <p>First, we need to upload your project code to a GitHub repository. Open a terminal or command prompt in your project's main directory and run these commands one by one.</p>
                        <p>1. Initialize a new Git repository:</p>
                        <CodeBlock>{`git init -b main`}</CodeBlock>
                        <p>2. Add all the files to be tracked:</p>
                        <CodeBlock>{`git add .`}</CodeBlock>
                        <p>3. Create your first commit (a snapshot of your code):</p>
                        <CodeBlock>{`git commit -m "Initial commit"`}</CodeBlock>
                        <p>4. Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-brand-red font-semibold hover:underline">GitHub and create a new repository</a>. You can name it whatever you like (e.g., "learners-academy-website"). Make it <strong>public</strong> and do <strong>not</strong> initialize it with a README or .gitignore file.</p>
                        <p>5. After creating it, GitHub will show you commands to "push an existing repository from the command line". Copy those commands and run them in your terminal. They will look similar to this:</p>
                        <CodeBlock>{`git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main`}</CodeBlock>
                        <p>Once this is done, your code will be safely stored on GitHub!</p>
                    </Step>

                    <Step number={3} title="Deploy with Vercel">
                        <p>Vercel is a platform that makes it incredibly easy to host modern web applications.</p>
                        <ol className="list-decimal list-inside space-y-3">
                            <li>Go to <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="text-brand-red font-semibold hover:underline">Vercel and sign up</a> using your GitHub account. It's free.</li>
                            <li>After signing up, you'll be on your dashboard. Click <strong>"Add New... &gt; Project"</strong>.</li>
                            <li>Vercel will ask to connect to your GitHub. Grant it access, then find and select the repository you just created (e.g., "learners-academy-website") and click <strong>"Import"</strong>.</li>
                            <li>On the configuration screen, Vercel will automatically detect that this is a Vite project. You shouldn't need to change any settings.</li>
                            <li>Simply click the <strong>"Deploy"</strong> button.</li>
                        </ol>
                        <p>That's it! Vercel will build and deploy your site. After a minute or two, it will provide you with a public URL (like <code>your-project.vercel.app</code>) where your website is live!</p>
                    </Step>

                    <div className="mt-12 pt-8 border-t">
                        <h2 className="text-2xl font-bold text-center text-brand-dark">Important: Next Steps</h2>
                        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
                            <p><strong className="font-bold">About Your Data:</strong> Your website is now online, but it still uses your browser's `localStorage`. This means each visitor will have their own separate data. An admin adding a new course on one computer won't see it on another.</p>
                            <p className="mt-2">Our next major task is to replace this with a central online database so that all data is shared and synchronized for everyone. This will make your admin, student, and faculty portals fully functional.</p>
                        </div>
                         <div className="text-center mt-8">
                             <ReactRouterDOM.Link to="/" className="bg-brand-dark text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-80 transition-transform hover:scale-105 shadow-lg">
                                &larr; Back to Home
                            </ReactRouterDOM.Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeploymentGuidePage;