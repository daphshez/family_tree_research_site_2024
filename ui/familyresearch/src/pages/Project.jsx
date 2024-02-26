import { getProject } from "../backend";
import { useLoaderData, Link  } from "react-router-dom";
import CustomMarkdown from "../components/CustomMarkdown";
import { Card , CardContent, Fab, Typography, Box, Button, CardActions, Breadcrumbs } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

function NoteCard({note}) {
    return (
        <Card sx={{ minWidth: 400, marginBottom: '20px' }}>
            <CardContent>
                    <CustomMarkdown gutterBottom>
                    { note.content }
                    </CustomMarkdown>
                
            </CardContent>
            <CardActions sx={{ display: 'flex', alignItems: 'center'}}>
                    <Button component={Link} to={`notes/${note.noteId}`}>Edit</Button>
                    <Button component={Link} to={`notes/${note.noteId}?view`}>View</Button>
                    <Typography variant="body2" color="text.secondary" sx={{marginLeft: "auto!important"}}>Created {note.created}<br/>Updated {note.lastUpdate}</Typography>
            </CardActions>
        </Card>
    )
}

export default function ProjectPage() {
    const project = useLoaderData();
    const notes = Object.values(project.notes);

    return (<>
    <Box sx={{ display: 'flex' , justifyContent: 'space-between'}}>
        <Breadcrumbs aria-label="breadcrumb">
        <Link
            underline="hover"
            color="inherit"
            to="/projects">
            Projects
        </Link>
        <Typography color="text.primary">{project.projectDisplayName}</Typography>
        </Breadcrumbs>

        <Fab color="primary" aria-label="add" component={Link} to={`/projects/${project.projectId}/createNote`}><AddIcon /></Fab>

    </Box>
    {
            notes.map((note) => <NoteCard key={note.noteId} projectId={project.projectId} note={note} />)      
        }
    </>


     );
}

export function loader({request, params}) {
    return getProject(params.projectId);
}