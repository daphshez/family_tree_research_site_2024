import { useState } from 'react';
import { InputLabel, Typography,  Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';


export default function PersonBooleanDetail({detailId, title, defaultFieldValue, makeUpdate, applyUpdate}) {


    const [ fieldValue, setFieldValue ] = useState(defaultFieldValue);  

    const handleEdit = (event, newValue) => {
        setFieldValue(newValue);
        applyUpdate(makeUpdate(newValue));
    };

    return ( 
      <Box sx={{
        marginBottom: '20px'
    }}>
        <InputLabel htmlFor="my-input">{ title }</InputLabel> 

        <ToggleButtonGroup
        value={fieldValue}
        exclusive
        onChange={handleEdit}
        aria-label="text alignment"
      >
        <ToggleButton value="yes" aria-label="yes">
          <CheckIcon />
        </ToggleButton>
        <ToggleButton value="no" aria-label="no">
          <CloseIcon />
        </ToggleButton>
        <ToggleButton value="unknown" aria-label="unknown">
          <QuestionMarkIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>

    




    //     <FormControlLabel control={<Checkbox 
    //                                name={detailId} 
    //                                checked={fieldValue === true} 
    //                                onChange={(e) => handleEdit(e.target.checked)}/>} label={title} />
        
        );

  
}