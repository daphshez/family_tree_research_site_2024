import { useLoaderData } from 'react-router-dom';
import { getPerson, fullDisplayName } from '../backend';
import PersonDetails from '../components/PersonDetails';
import RelatedPeople from '../components/RelatedPeople';
import PersonProjects from '../components/PersonProjects';
import { Box } from '@mui/material';


export default function PersonPage() {
    const person = useLoaderData();


    return (      
        <Box sx={{
            display: 'flex',
            flexDirection: 'column'
        }}>
        <PersonDetails inputPerson={person}/>
        <RelatedPeople person={person}/>
        <PersonProjects person={person}/>

        </Box>);
}


export async function loader({request, params}) {
    const id = params.personId;
    return await getPerson(id);
}
