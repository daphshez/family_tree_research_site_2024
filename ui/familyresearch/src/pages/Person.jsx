import { useLoaderData } from 'react-router-dom';
import { getPerson, fullDisplayName } from '../backend';
import PersonDetails from '../components/PersonDetails';
import RelatedPeople from '../components/RelatedPeople';
import PersonProjects from '../components/PersonProjects';


export default function PersonPage() {
    const person = useLoaderData();


    return (      
        <>
        <header>{fullDisplayName(person)}</header>
        <PersonDetails inputPerson={person}/>
        <RelatedPeople person={person}/>
        <PersonProjects person={person}/>

        </>);
}


export function loader({request, params}) {
    const id = params.personId;
    return getPerson(id);
}
