import { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, InputLabel} from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

export default function PersonMultiselectDetail({detailId, 
                                      title, 
                                      choices,
                                      defaultFieldValue, 
                                      makeUpdate,
                                      applyUpdate}) 
{
    const [ fieldValue, setFieldValue ] = useState(defaultFieldValue);  

    function handleEdit(event, newValue) {
        setFieldValue(newValue);
        applyUpdate(makeUpdate(newValue));
    }

    let choicesMap = null;
    if (Array.isArray(choices)) {
        choicesMap = {};
        choices.forEach(choice => {
            choicesMap[choice] = choice; 
        });
    } else {
        choicesMap = choices;
    }
    


    return (
        <Box sx={{
            marginBottom: '20px'
        }}>
            <InputLabel htmlFor={detailId}>{ title }</InputLabel> 

            <ToggleButtonGroup
                name={detailId}
                value={fieldValue}
                exclusive
                onChange={handleEdit}
            >
            <ToggleButton value="unknown"><QuestionMarkIcon/></ToggleButton>
            {
                Object.keys(choicesMap).map((choice) => (
                    <ToggleButton key={choice} value={choice}>
                         { choicesMap[choice] }
                    </ToggleButton>
                ))
            }
            </ToggleButtonGroup>
    </Box>);
   
    

}