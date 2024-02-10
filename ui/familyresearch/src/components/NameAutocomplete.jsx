import { useState, useEffect } from "react";
import { searchPeople,fullDisplayName } from "../backend";

export default function NameAutocomplete({onSelect}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    function handleSearch(event) {
        setSearchTerm(event.target.value);
    }

    useEffect(() => {
        if (searchTerm.length >= 3) {
            const people = searchPeople(searchTerm, 5);
            setSuggestions(people);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm]);



    return (
        <>
        @<input name="searchTerm" value={searchTerm} onChange={handleSearch}></input>
        <ul>
            {
                suggestions.map((person) => <li key={person.personId}>
                    <button value={person.personId} onClick={()=>onSelect(person)}>{fullDisplayName(person)}</button></li>)   
            }
        </ul>
    </>
    );
}