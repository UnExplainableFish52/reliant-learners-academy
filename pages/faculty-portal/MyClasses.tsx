import React, { useState, useEffect } from 'react';
import { STUDENTS, COURSE_MATERIALS, RECORDED_LECTURES } from '../../constants.ts';
import type { Student, CourseMaterial, RecordedLecture } from '../../types.ts';
import ResourceModal from '../../components/faculty-portal/UploadResourceModal.tsx';
import { useFaculty } from './hooks.ts';

const BASE_MATERIAL_IDS = new Set(COURSE_MATERIALS.map(m => m.id));
const BASE_LECTURE_IDS = new Set(RECORDED_LECTURES.map(l => l.id));

const MyClasses: React.FC = () => {
    const { facultyMember } = useFaculty();
    const [selectedPaper, setSelectedPaper] = useState(facultyMember.assignedPapers[0]);
    const [levelFilter, setLevelFilter] = useState('All');
    
    const [allStudents, setAllStudents] = useState<Student[]>([]);

    useEffect(() => {
        const storedStudents = localStorage.getItem('students');
        setAllStudents(storedStudents ? JSON.parse(storedStudents) : STUDENTS);
    }, []);

    const [materials, setMaterials] = useState<CourseMaterial[]>(() => {
        const savedMaterials = localStorage.getItem('customMaterials');
        const customMaterials: CourseMaterial[] = savedMaterials ? JSON.parse(savedMaterials) : [];
        const baseIds = new Set(COURSE_MATERIALS.map(m => m.id));
        const uniqueCustom = customMaterials.filter(m => !baseIds.has(m.id));
        return [...COURSE_MATERIALS, ...uniqueCustom];
    });
    const [lectures, setLectures] = useState<RecordedLecture[]>(() => {
        const savedLectures = localStorage.getItem('customLectures');
        const customLectures: RecordedLecture[] = savedLectures ? JSON.parse(savedLectures) : [];
        const baseIds = new Set(RECORDED_LECTURES.map(l => l.id));
        const uniqueCustom = customLectures.filter(l => !baseIds.has(l.id));
        return [...RECORDED_LECTURES, ...uniqueCustom];
    });

    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<CourseMaterial | RecordedLecture | null>(null);

    useEffect(() => {
        const customMaterials = materials.filter(m => !COURSE_MATERIALS.some(cm => cm.id === m.id));
        localStorage.setItem('customMaterials', JSON.stringify(customMaterials));
    }, [materials]);

    useEffect(() => {
        const customLectures = lectures.filter(l => !RECORDED_LECTURES.some(rl => rl.id === l.id));
        localStorage.setItem('customLectures', JSON.stringify(customLectures));
    }, [lectures]);


    const filteredStudents = allStudents.filter(student => 
        student.enrolledPapers.some(p => selectedPaper.startsWith(p))
    ).filter(student =>
        levelFilter === 'All' || student.currentLevel === levelFilter
    );
    
    const materialsForSelectedPaper = materials.filter(material => 
        material.paper === selectedPaper.split(':')[0].trim()
    );
    
    const lecturesForSelectedPaper = lectures.filter(lecture => 
        lecture.paper === selectedPaper.split(':')[0].trim()
    );

    const handleSaveResource = (resources: ((CourseMaterial | RecordedLecture) & { id?: number })[]) => {
        const newMaterials: CourseMaterial[] = [];
        const newLectures: RecordedLecture[] = [];

        resources.forEach(resource => {
            if (resource.id && resourceToEdit) { // Editing existing
                if ('videoUrl' in resource) {
                    setLectures(prev => prev.map(l => l.id === resource.id ? resource as RecordedLecture : l));
                } else {
                    setMaterials(prev => prev.map(m => m.id === resource.id ? resource as CourseMaterial : m));
                }
            } else { // Adding new
                const newResourceWithId = { ...resource, id: resource.id ?? Date.now() };
                if ('videoUrl' in newResourceWithId) {
                    newLectures.push(newResourceWithId as RecordedLecture);
                } else {
                    newMaterials.push(newResourceWithId as CourseMaterial);
                }
            }
        });

        if (newMaterials.length > 0) {
            setMaterials(prev => [...newMaterials, ...prev]);
        }
        if (newLectures.length > 0) {
            setLectures(prev => [...newLectures, ...prev]);
        }
        
        setIsResourceModalOpen(false);
        setResourceToEdit(null);
    };

    const handleDeleteMaterial = (id: number) => {
        if (window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
            setMaterials(prev => prev.filter(m => m.id !== id));
        }
    };
    
    const handleDeleteLecture = (id: number) => {
         if (window.confirm('Are you sure you want to delete this lecture? This action cannot be undone.')) {
            setLectures(prev => prev.filter(l => l.id !== id));
        }
    };

    const handleEditResource = (resource: CourseMaterial | RecordedLecture) => {
        setResourceToEdit(resource);
        setIsResourceModalOpen(true);
    };

    const handleAddNewClick = () => {
        setResourceToEdit(null);
        setIsResourceModalOpen(true);
    };

    if (!facultyMember) return null;

    return (
        <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-8">My Classes</h1>

            <div className="mb-6">
                <label htmlFor="paperSelect" className="block text-sm font-medium text-gray-700">Select a Paper to Manage</label>
                <select 
                    id="paperSelect"
                    value={selectedPaper}
                    onChange={(e) => setSelectedPaper(e.target.value)}
                    className="mt-1 block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm rounded-md shadow-sm bg-white"
                >
                    {facultyMember.assignedPapers.map(paper => <option key={paper} value={paper}>{paper}</option>)}
                </select>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-2xl font-bold text-brand-red mb-6">{selectedPaper}</h2>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enrolled Students */}
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg text-brand-dark">Enrolled Students ({filteredStudents.length})</h3>
                             <select
                                value={levelFilter}
                                onChange={e => setLevelFilter(e.target.value)}
                                className="block text-sm border-gray-300 focus:outline-none focus:ring-brand-red focus:border-brand-red rounded-md bg-white"
                            >
                                <option value="All">All Levels</option>
                                <option value="Applied Knowledge">Applied Knowledge</option>
                                <option value="Applied Skills">Applied Skills</option>
                                <option value="Strategic Professional">Strategic Professional</option>
                            </select>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                           {filteredStudents.length > 0 ? filteredStudents.map(student => (
                               <div key={student.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                                   <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-3" />
                                   <div>
                                       <p className="font-semibold text-gray-800">{student.name}</p>
                                       <p className="text-xs text-gray-500">{student.studentId} - {student.currentLevel}</p>
                                   </div>
                               </div>
                           )) : <p className="text-gray-500">No students match the current filters.</p>}
                        </div>
                    </div>

                    {/* Learning Resources */}
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                             <h3 className="font-bold text-lg text-brand-dark">Learning Resources</h3>
                             <button onClick={handleAddNewClick} className="bg-brand-red text-white font-semibold px-3 py-1 text-sm rounded-md hover:bg-red-700">
                                Upload New
                            </button>
                        </div>
                         <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {[...materialsForSelectedPaper, ...lecturesForSelectedPaper]
                                .sort((a, b) => new Date('videoUrl' in b ? b.date : b.uploadDate).getTime() - new Date('videoUrl' in a ? a.date : a.uploadDate).getTime())
                                .map(item => {
                                    const isBaseResource = 'videoUrl' in item ? BASE_LECTURE_IDS.has(item.id) : BASE_MATERIAL_IDS.has(item.id);
                                    return (
                                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                            <div>
                                                <p className="font-semibold text-gray-800">{'videoUrl' in item ? item.topic : item.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    Type: {'videoUrl' in item ? 'Recorded Lecture' : item.type} | Uploaded: {'videoUrl' in item ? item.date : item.uploadDate}
                                                </p>
                                            </div>
                                            <div className="space-x-2 flex-shrink-0">
                                                {isBaseResource ? (
                                                     <span className="text-xs text-gray-400 italic">Default Resource</span>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditResource(item)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                                                        <button onClick={() => 'videoUrl' in item ? handleDeleteLecture(item.id) : handleDeleteMaterial(item.id)} className="text-xs font-semibold text-brand-red hover:underline">Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            {[...materialsForSelectedPaper, ...lecturesForSelectedPaper].length === 0 && (
                                <p className="text-gray-500">No resources uploaded for this paper yet.</p>
                            )}
                         </div>
                    </div>
                 </div>
            </div>
            
            <ResourceModal 
                isOpen={isResourceModalOpen}
                onClose={() => {
                    setIsResourceModalOpen(false);
                    setResourceToEdit(null);
                }}
                onSave={handleSaveResource}
                paper={selectedPaper.split(':')[0].trim()}
                resourceToEdit={resourceToEdit}
            />
        </div>
    );
};

export default MyClasses;