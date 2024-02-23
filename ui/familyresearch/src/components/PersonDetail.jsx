import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputLabel from "@mui/material/InputLabel";
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl'
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';

import { Box, Typography } from '@mui/material';


export default function PersonDetail({detailId, 
                                      title, 
                                      defaultFieldValue, 
                                      defaultNote,
                                      makeUpdate, 
                                      applyUpdate,
                                      textVariant='p',
                                      validate=()=>null}) {
    const [ fieldValue, setFieldValue ] = useState();    
    const [ noteValue, setNoteValue ] = useState();
    const [ error , setError ] = useState();

    const sanitisedDefault = defaultFieldValue || "";
    const sanitisedNote = defaultNote || "";

    function handleStartEdit() {
        setFieldValue(sanitisedDefault);
        setNoteValue(sanitisedNote);
    }


    function handleCancelEdit() {
        setFieldValue(null);
        setNoteValue(null);
        setError(null);
    }

    function handleSaveEdit(event) {
        event.preventDefault();
        const error = validate(fieldValue);
        if (error) {
            setError(error);
        } else { 
            const update = makeUpdate(fieldValue, noteValue.trim().length > 0 ? noteValue.trim(): null);
            applyUpdate(update);
            setError(null);
            setFieldValue(null); 
            setNoteValue(null);   
        }
    }



    if (fieldValue != null) {
        return (
            <form onSubmit={handleSaveEdit}>
            <Box sx={{display: 'flex'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <Button variant="text" sx={{ minWidth: 0}} size="small" type="submit"><DoneIcon/></Button>
                        <Button variant="text" sx={{ minWidth: 0}} size="small" type="button"  onClick={handleCancelEdit}><CancelIcon/  ></Button>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: '1'}}>
                    <TextField 
                    name={detailId} 
                    autoComplete="off"
                    id={detailId} 
                    label={title}
                    value={fieldValue} 
                    onChange={(event) => setFieldValue(event.target.value.trim())}
                    sx={{ marginBottom: '10px'}}/>

                    <FormControl fullWidth>
                    <TextField 
                    name={`${detailId}-note`} 
                    multiline
                    rows={3}
                    autoComplete="off"
                    id={`${detailId}-note`} 
                    label="Note"
                    value={noteValue} 
                    onChange={(event) => setNoteValue(event.target.value)}
                    sx={{ width: "100%"}}
                    />
                    </FormControl>
                    </Box>
            </Box>
            </form>
        )

    } else {
        return (
            <Box sx={{ marginBottom: '20px'}}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Button variant="text" sx={{ minWidth: 0}} size="small" onClick={handleStartEdit}><EditIcon/></Button>
                    <Box>
                   {title && <InputLabel>{ title }&nbsp;</InputLabel> }
                    <Typography variant={textVariant}>{ sanitisedDefault }</Typography>
                    </Box>
                </Box>
                <Typography variant="body2" component="p" sx={{marginLeft: '34px'}}>
                    { sanitisedNote }
                </Typography>
            </Box>
                    );

    }

}

