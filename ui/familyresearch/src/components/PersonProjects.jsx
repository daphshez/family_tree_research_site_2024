import { Link } from "react-router-dom";
import RouterMarkdown from "../components/RouterMarkdown";

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
                                    <RouterMarkdown components={{
                                        a(props) {
                                            const {node, href, ...rest} = props
                                            if (href.startsWith("/")) {
                                                return <Link to={href} {...rest} />
                                            }
                                        }
                                    }}>{n.content}</RouterMarkdown>
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