import { Fragment, useState } from 'react';
import { Box, Typography, Button} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function PersonMultiselectDetail({detailId, 
                                      title, 
                                      choices,
                                      defaultFieldValue, 
                                      makeUpdate,
                                      applyUpdate}) 
{
    const [ fieldValue, setFieldValue ] = useState();  
    const [ isEditing, setIsEditing ] = useState(false);

    const sanitisedDefault = defaultFieldValue || "";

    function handleEdit(fieldValue) {
        setFieldValue(fieldValue);
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setFieldValue(null);
        setIsEditing(false);
    }


    function handleSaveEdit(event) {
        event.preventDefault();
        const update = makeUpdate(fieldValue);
        applyUpdate(update);
        setFieldValue(null);   
        setIsEditing(false); 
    }  
    
    if (isEditing) {
        return (
            <Box sx={{
                display: 'flex',
                marginBottom: '20px'
            }}>
                <form onSubmit={handleSaveEdit}>
                <FormControl>
                <RadioGroup row name={detailId}  >
                {
                    choices.map((choice)=>(
                        <FormControlLabel key={choice} value={choice} control={<Radio checked={fieldValue === choice}
                        onChange={(e) => handleEdit(e.target.value)}/>} label={choice}  />
                    ))
                }
                </RadioGroup>
                </FormControl>
                <Button variant="text" size="small" type="button" onClick={() => handleEdit(null)}><QuestionMarkIcon/></Button>
                <Button variant="text" size="small" type="submit"><DoneIcon/></Button>
                <Button variant="text" size="small" type="button"  onClick={handleCancelEdit}><CancelIcon/></Button>
        </form>
        </Box>);
    }

    return (
        <Box sx={{
            display: 'flex',
            marginBottom: '20px'
        }}>
            <Typography variant="p">{ title ? `${title}: ${sanitisedDefault}` : sanitisedDefault }</Typography>
            <Button variant="text" size="small" onClick={() => handleEdit(sanitisedDefault)}><EditIcon/></Button>
        </Box>
        
    );
    

}