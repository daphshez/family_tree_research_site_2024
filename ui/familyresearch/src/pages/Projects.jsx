import { listProjects, createNewProject } from "../backend";
import { useLoaderData, Link, Form , redirect} from "react-router-dom";

export default function ProjectsPage() {
  const projects = useLoaderData();

  return (<> 
         <ul className="list-group">
          {projects.map( (p) => (
                  <li key={p.projectId}>
                    <Link to={`/projects/${p.projectId}`}>{p.projectDisplayName}</Link></li>
          ) )}
          </ul>

          <Form method='POST'>
            <label htmlFor="newProjectName">New project name:</label>
            <input name="newProjectName" id="newProjectName"/>
            <button type="submit">Add</button>
        </Form>

         </>);

  }

  export function loader() {
    return listProjects();
 }  


 export async function action({ request, params }) {
  const formData = await request.formData();
  const name = formData.get("newProjectName");
  const newId = createNewProject(name);
  return redirect(`/projects/${newId}`);
}