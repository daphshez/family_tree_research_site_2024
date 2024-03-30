import { useLoaderData } from 'react-router-dom';
import { getPerson, fullDisplayName } from '../backend';
import PersonDetails from '../components/PersonDetails';
import RelatedPeople from '../components/RelatedPeople';
import PersonProjects from '../components/PersonProjects';
import PersonLinks from '../components/PersonLinks';
import PersonTasks from '../components/PersonTasks';
import { Box, Typography } from '@mui/material';
import OverviewNote from '../components/OverviewNote';



export default function PersonPage() {
    const person = useLoaderData();


    return (      
        <Box sx={{
            display: 'flex',
            flexDirection: 'column'
        }}>
        <PersonDetails inputPerson={person}/>
        <PersonLinks person={person}/>
        <RelatedPeople person={person}/>
        <PersonTasks person={person}/>
        <PersonProjects person={person}/>

        </Box>);
}


export async function loader({request, params}) {
    const id = params.personId;
    return await getPerson(id);
}
