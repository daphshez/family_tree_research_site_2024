import { Link } from "react-router-dom";
import CustomMarkdown from "../components/CustomMarkdown";

export default function PersonProjects({person}) {
    const projects = person.projects;

    if (projects && projects.length > 0) {

        return (<div>
            <header>In Projects</header>
            <ul>
            {
                projects.map(p => (
                    <li key={p.projectId}>
                        <Link to={`/projects/${p.projectId}`}>{p.projectDisplayName}</Link>
                        <ol>
                        {
                            p.notes.map(n => (
                                <li key={n.noteId}>
                                    <CustomMarkdown>{n.content}</CustomMarkdown>
                                </li>
                            ))
                        }
                        </ol>
                    </li>




                ))
            }
            </ul>

        </div>)
    };    

}