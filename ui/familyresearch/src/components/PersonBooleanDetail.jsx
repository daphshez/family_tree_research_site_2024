import { useState } from 'react';
import { Box, Typography, Button, Checkbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';



export default function PersonDetail({detailId, title, defaultFieldValue, makeUpdate, applyUpdate}) {

    const [ fieldValue, setFieldValue ] = useState(defaultFieldValue);  
    

    function handleEdit(newValue) {
        setFieldValue(newValue  );
        applyUpdate( makeUpdate(newValue));
    }



    return ( <Box sx={{
                display: 'flex',
                marginBottom: '20px'
                }}>
        <FormControlLabel control={<Checkbox 
                                   name={detailId} 
                                   checked={fieldValue === true} 
                                   onChange={(e) => handleEdit(e.target.checked)}/>} label={title} />
        </Box>);

  
}