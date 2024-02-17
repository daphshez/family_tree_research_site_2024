import { useState, useRef } from "react";
import { getNote, updateNote, createNewNote, fullDisplayName } from "../backend";
import { useLoaderData, Form, redirect, useParams } from "react-router-dom";
import NameAutocomplete from "../components/NameAutocomplete";
import CustomMarkdown from "../components/CustomMarkdown";
import { TextField, Paper, Button, Typography, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";


function PreviewCard({content}) {
    return (
        <Paper elevation={3} sx={{ minWidth: 400, marginTop: '30px', padding: '10px' }}>
            <Typography variant="caption">Preview</Typography>
            <CustomMarkdown>{content }</CustomMarkdown>
        </Paper>
    )
}



export default function NotePage()
{
    const params = useParams();
    const projectId = params.projectId;

    let defaultContent = "";
    if (params.noteId) {
        const savedNote = useLoaderData();
        defaultContent = savedNote.content;
    } 
    const [noteContent, setNoteContent] = useState(defaultContent);
    const [selection, setSelection] = useState([0, 0]);
    const textAreaRef = useRef();


    function handleChange(event) {
        setNoteContent(event.target.value);
    }

    function handleSelect(event) {
        setSelection([event.target.selectionStart, event.target.selectionEnd]);
    }

    function onNameAutocompleteSelect(person) {
        setNoteContent((noteContent) => {
            return noteContent.substring(0, selection[0]) + 
                  fullDisplayName(person) + "](/people/" + person.personId + ")" + noteContent.substring(selection[1]);
        })
        textAreaRef.current.focus();
    };

    const searching = selection[0] >= 2 && noteContent.substring(selection[0]-2, selection[0]) === "[@";

    return (
        <>

        <Paper>
        <Form method="post" >
            <TextField 
              multiline
              fullWidth
              minRows={10}
              minWidth={400}
              variant="filled" 
              label="Markdown"
              required
              name="noteContent" onChange={handleChange} onSelect={handleSelect} value={noteContent} ref={textAreaRef}/>

            <Button type="submit">Save</Button>
            <Button component={Link} to={`/projects/${projectId}`}>Cancel</Button>
        </Form>
        </Paper>


        <PreviewCard content={noteContent}/>

        {searching && <NameAutocomplete onSelect={onNameAutocompleteSelect}/>}
        

        </>
    )
}

export function loader({request, params}) {
    return getNote(params.projectId, params.noteId);
}

export async function action({request, params}) {
    const formData = await request.formData();
    const noteContent = formData.get("noteContent");
    if (params.noteId)
        updateNote(params.projectId, params.noteId, noteContent);
    else 
        createNewNote(params.projectId, noteContent);
    return redirect (`/projects/${params.projectId}`);

}