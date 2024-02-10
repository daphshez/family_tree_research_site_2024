import { getProjectNotes } from "../backend";
import { useLoaderData, Link , useParams } from "react-router-dom";
import RouterMarkdown from "../components/RouterMarkdown";

export default function ProjectPage() {
    const notes = useLoaderData();
    const { projectId } = useParams();

    return (<>
        <div><Link to="createNote">New Note</Link></div>

        {
        notes.map((note)=> 
            <div key={note.noteId}>
                <RouterMarkdown>{ note.content }</RouterMarkdown>
                <Link to={`notes/${note.noteId}`}>Edit</Link><br/>
                <span>Created: {note.created}</span>&nbsp;
                <span>Last update: {note.lastUpdate}</span>
            </div>
        )
        }
    </>);
}

export function loader({request, params}) {
    return getProjectNotes(params.projectId);
}