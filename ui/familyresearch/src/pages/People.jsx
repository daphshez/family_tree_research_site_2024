import { listPeople } from "../backend"
import { Link, redirect } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import { createNewPerson, fullDisplayName } from "../backend";

import  NewPersonForm  from "../components/NewPersonForm"

export default function PeoplePage() {
    const people = useLoaderData();

    return (<> 
           <ul className="list-group">
            {people.map( (person) => (
                    <li key={person.personId}><Link to={`/people/${person.personId}`}
                    key={person.personId}>{fullDisplayName(person)}</Link></li>
            ) )}
            </ul>
           <NewPersonForm/>
           </>);

}

export function loader() {
   return listPeople();
}

export async function action({ request, params }) {
        const formData = await request.formData();
        const name = formData.get("newPersonName");
        const newId = createNewPerson(name);
        return redirect(`/people/${newId}`);
}