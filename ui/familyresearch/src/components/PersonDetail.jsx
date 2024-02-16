import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';

import { Box, Typography } from '@mui/material';


export default function PersonDetail({detailId, 
                                      title, 
                                      defaultFieldValue, 
                                      makeUpdate, 
                                      applyUpdate,
                                      textVariant='p',
                                      validate=()=>null}) {
    const [ fieldValue, setFieldValue ] = useState();    
    const [ error , setError ] = useState();

    const sanitisedDefault = defaultFieldValue || "";

    function handleEdit(fieldValue) {
        setFieldValue(fieldValue);
    }

    function handleCancelEdit() {
        setFieldValue(null);
        setError(null);
    }

    function handleSaveEdit(event) {
        event.preventDefault();
        const error = validate(fieldValue);
        if (error) {
            setError(error);
        } else { 
            const update = makeUpdate(fieldValue);
            applyUpdate(update);
            setError(null);
            setFieldValue(null);    
        }
    }


    // if (fieldValue != null)
    // {
    //     return (<div>
    //         <label htmlFor={detailId}>{title}:</label>
    //         <input name={detailId} value={fieldValue} onChange=/>

    //         <span className="validationError">{error}</span>
    //     </form></div>);
    // }
    // else
    // {

    //     return (<div>
    //         <span>{title}: </span>
    //         <span>{defaultFieldValue}</span> 
    //         <button onClick={}>Edit</button>  
    //         </div>
    //     );
    // }


    if (fieldValue != null) {
        return (
            <Box sx={{
                display: 'flex',
             
            }}>
                <form onSubmit={handleSaveEdit}>
                    <TextField 
                    name={detailId} 
                    id={detailId} 
                    label={title}
                    value={fieldValue} 
                    onChange={(event) => handleEdit(event.target.value)}
                    variant="standard"/>
                    <Button variant="text" size="small" type="submit"><DoneIcon/></Button>
                    <Button variant="text" size="small" type="button"  onClick={handleCancelEdit}><CancelIcon/  ></Button>
                </form>
            </Box>
        )

    } else {
        return (
            <Box sx={{
                display: 'flex',
                marginBottom: '20px'
            }}>
                <Typography variant={textVariant}>{ title ? `${title}: ${sanitisedDefault}` : sanitisedDefault }</Typography>
                <Button variant="text" size="small" onClick={() => handleEdit(sanitisedDefault)}><EditIcon/></Button>
            </Box>
            
        );
    }

}

