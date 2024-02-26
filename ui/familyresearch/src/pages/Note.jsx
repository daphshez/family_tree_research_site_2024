import { useState, useRef, useEffect } from "react";
import { getNote, updateNote, createNewNote, fullDisplayName, searchPeople } from "../backend";
import { useLoaderData, Form, useSearchParams, useParams, redirect } from "react-router-dom";
import CustomMarkdown from "../components/CustomMarkdown";
import { TextField, Paper, Button, Typography, Box, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

function PreviewCard({content, preview, projectId}) {
    return (
        <Paper elevation={3} sx={{ minWidth: 400, padding: '10px' }}>
            { preview && <><Typography variant="caption">Preview</Typography><br/></> }
            <CustomMarkdown>{content }</CustomMarkdown>
            { !preview && <Button component={Link} to="">Edit</Button>}
            { !preview && <Button component={Link} to={`/projects/${projectId}`}>Back to project</Button>}
        </Paper>
    )
}


export default function NotePage()
{
    const params = useParams();
    const projectId = params.projectId;

    const [query] = useSearchParams();
    const edit = !query.has("view");


    let defaultContent = "";
    if (params.noteId) {
        const savedNote = useLoaderData();
        defaultContent = savedNote.content;
    } 
    const [note, setNote] = useState({
      content: defaultContent,
      search: null
    });
   const [suggestions, setSuggestions] = useState([]);


    const textAreaRef = useRef();

    function stopSearch(newContent = null) {
        if (note.search != null || newContent != null) {
            setNote((old) => ({content: newContent ? newContent : old.content, search: null}));
            setSuggestions([]);
        }
    }

    function onKeyDown(event) {
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown":
                stopSearch();
        }
    }


    function handleChange(event) {
        const newNoteContent = event.target.value;
        const selectionStart = event.target.selectionStart;

        if (note.search) {
            if (selectionStart < note.search.start ||   // probably back spaced to remove the search starting charachters 
                newNoteContent.substring(selectionStart, selectionStart-1) === "\n" || 
                newNoteContent.substring(selectionStart, selectionStart-1) === "]"
                ) {
                stopSearch(newNoteContent);
            }
            else {
                setNote((old) => ({content: newNoteContent, 
                                   search: {start: old.search.start, end: selectionStart, term: newNoteContent.substring(old.search.start, selectionStart)}}));
            }
        } else {    // we haven't been searching; we need to check whether the last two charachters are "[@"
            if (selectionStart >= 2 && 
                newNoteContent.substring(selectionStart - 2, selectionStart) == "[@")
            {
                setNote({content: newNoteContent,  search: {start: selectionStart, end: selectionStart, term: ""}});
            } 
            else {
                stopSearch(newNoteContent);
            }
        }
    }

    useEffect(() => {
        if (note.search) {
            searchPeople(note.search.term, 5).then((people) => setSuggestions(people));
        } 
    }, [note]);



    function onNameAutocompleteSelect(person) {
        setNote((old) => {
            const prefix = old.content.substring(0, old.search.start);
            const link = fullDisplayName(person) + "](/people/" + person.personId + ")";
            const suffix = old.content.substring(old.search.end);
            return {
            content:  prefix + link + suffix,
            search: null
            }
        });
        setSuggestions([]);
    };


    return (
        <>

        { edit && (
        <Paper sx={{ marginBottom: "30px"}}>
        <Form method="post" >
            <TextField 
              multiline
              fullWidth
              rows={25}
              variant="filled" 
              label="Markdown"
              required
              name="noteContent" 
              onChange={handleChange} 
              onMouseDown={() => stopSearch()}
              onKeyDown={onKeyDown}
              value={note.content} 
              ref={textAreaRef}/>

            <Box sx={{display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid gray'}}>
            { suggestions.map(
                (person) =>  <MuiLink 
                              key={person.personId} 
                              color="secondary" 
                              variant="body2" 
                              onClick={() => onNameAutocompleteSelect(person)}
                              sx={{paddingRight: '10px', cursor: 'pointer'}}>@{fullDisplayName(person)}</MuiLink>
            ) }
            </Box>
            <Button type="submit">Save</Button>
        </Form>
        </Paper>)
    }
      
        <PreviewCard content={note.content} preview={edit} projectId={params.projectId}/>




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
    return redirect (`/projects/${params.projectId}/notes/${params.noteId}?view`);
}