import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";

import { useState } from "react";

export default function OverviewNote({content, applyUpdate}) {
    const [ fieldValue, setFieldValue ] = useState();    


    function handleStartEdit() {
        setFieldValue(content || "");
    }

    function handleCancelEdit() {
        setFieldValue(null);
    }

    function handleSaveEdit(event) {
        event.preventDefault();
        const update = {'overviewNote': fieldValue.trim()};
        applyUpdate(update);
        setFieldValue(null);
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
                <FormControl fullWidth>
                <TextField 
                name="overview-note" 
                multiline
                rows={10}
                autoComplete="off"
                id="overview-note"
                label="Overview Note"
                value={fieldValue} 
                onChange={(event) => setFieldValue(event.target.value)}
                sx={{ width: "100%"}}
                />
                </FormControl>
                </Box>
        </Box>
        </form>
        );
    }
    if (content) {
        return (
            <Box sx={{ marginBottom: '20px', display: 'flex', alignItems: 'center'}}>
                <Button variant="text" size="small" onClick={handleStartEdit}><EditIcon/></Button>
                <Box>
                <Typography variant="body" component="p" sx={{whiteSpace: 'pre-wrap'}}>{ content.replace("\n") }</Typography>
                </Box>
            </Box>
        ); 
    } else {
        return <Button onClick={handleStartEdit}>Add Overview</Button>
    }

   
}