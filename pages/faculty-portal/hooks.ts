import * as ReactRouterDOM from 'react-router-dom';
import type { FacultyMember } from '../../types.ts';

export function useFaculty() {
    return ReactRouterDOM.useOutletContext<{ facultyMember: FacultyMember }>();
}
