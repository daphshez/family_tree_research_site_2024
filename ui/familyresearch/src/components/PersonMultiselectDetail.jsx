import { Fragment, useState } from 'react';


export default function PersonMultiselectDetail({detailId, 
                                      title, 
                                      choices,
                                      defaultFieldValue, 
                                      makeUpdate,
                                      applyUpdate}) 
{
    const [ fieldValue, setFieldValue ] = useState();  
    const [ isEditing, setIsEditing ] = useState(false);


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
        return (<div><form onSubmit={handleSaveEdit}>
            <span>{title}:</span>
            {
                choices.map((choice)=>(
                    <Fragment key={choice}>
                    <input type="radio" 
                           id={detailId + "-" + choice} 
                           name={detailId} 
                           value={choice}
                           checked={fieldValue === choice}
                           onChange={(e) => handleEdit(e.target.value)}
                           />
                    <label htmlFor={choice}>{choice}</label>
                    </Fragment>
                ))
            }
            <button type="button" onClick={() => handleEdit(null)}>Deselect</button>
            <button type="submit">Done</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
        </form></div>);
    }

    return  (<div>
        <span>{title}: </span>
        <span>{defaultFieldValue}</span> 
        <button onClick={() => handleEdit(defaultFieldValue)}>Edit</button>  
        </div>
    );

}