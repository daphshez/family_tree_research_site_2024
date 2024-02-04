import { useState } from 'react';



export default function PersonDetail({detailId, title, defaultFieldValue, makeUpdate, applyUpdate}) {
    
    const [ fieldValue, setFieldValue ] = useState();  
    

    function handleEdit(fieldValue) {
        setFieldValue(fieldValue);
    }

    function handleCancelEdit() {
        setFieldValue(null);
    }


    function handleSaveEdit(event) {
        event.preventDefault();
        const update = makeUpdate(fieldValue);
        applyUpdate(update);
        setFieldValue(null);    
    }


    var content = undefined;
    if (fieldValue != null)
    {
        content = (<div><form onSubmit={handleSaveEdit}>
            <label htmlFor={detailId}>{title}: </label>
            <input 
                type="checkbox"
                name={detailId}
                onChange={(event) => handleEdit(event.target.checked)}
                checked={fieldValue === true} />
            <button type="submit">Done</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
        </form></div>);
    }
    else
    {

        content =  (<div>
            <span>{title}: </span>
            <span>{defaultFieldValue ? 'Yes': 'No'}</span> 
            <button onClick={() => handleEdit(defaultFieldValue)}>Edit</button>  
            </div>
        );
    }

    return content;


}