import { Link } from "react-router-dom";
import CustomMarkdown from "../components/CustomMarkdown";
import { Box, Typography, Card, CardContent, CardActions, Button, Link as MuiLink } from "@mui/material";
import { nicerDate } from "../utils";

function NoteCard({note, project}) {
    return (
        <Card sx={{ minWidth: 400, marginBottom: '20px' }}>
            <CardContent>
            <MuiLink sx={{paddingBottom: '10px', display: 'block', textAlign: 'right'}} component={Link} to={`/projects/${project.projectId}`}>Project: {project.projectDisplayName}</MuiLink>
                    <CustomMarkdown gutterBottom>
                    { note.content }
                    </CustomMarkdown>
                
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Button component={Link} to={`/projects/${project.projectId}/notes/${note.noteId}`}>Edit</Button>
                    <Typography variant="body2" color="text.secondary">Created {nicerDate(note.created)}<br/>Updated {nicerDate(note.lastUpdate)}</Typography>
            </CardActions>
        </Card>
    )
}

export default function PersonProjects({person}) {
    const projects = person.projects;

    if (projects && projects.length > 0) {
        return (
            <>
            <Box sx={{marginBottom: '20px'}}><Typography variant="h6">Notes</Typography></Box>
            { projects.map(p => (<div key={p.projectId}>{
                p.notes.map(n => <NoteCard key={n.noteId} note={n} project={p} />)
            }</div>)) }
            </>
        );
    }
    
}