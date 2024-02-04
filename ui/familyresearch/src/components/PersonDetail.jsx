import { useState } from 'react';


export default function PersonDetail({detailId, 
                                      title, 
                                      defaultFieldValue, 
                                      makeUpdate, 
                                      applyUpdate,
                                      validate=()=>null}) {
    const [ fieldValue, setFieldValue ] = useState();    
    const [ error , setError ] = useState();

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


    if (fieldValue != null)
    {
        return (<div><form onSubmit={handleSaveEdit}>
            <label htmlFor={detailId}>{title}:</label>
            <input name={detailId} value={fieldValue} onChange={(event) => handleEdit(event.target.value)}/>
            <button type="submit">Done</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
            <span className="validationError">{error}</span>
        </form></div>);
    }
    else
    {

        return (<div>
            <span>{title}: </span>
            <span>{defaultFieldValue}</span> 
            <button onClick={() => handleEdit(defaultFieldValue)}>Edit</button>  
            </div>
        );
    }

    return content;
}

