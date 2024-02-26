import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Button from "@mui/material/Button";
import RemoveCircleOutlineSharpIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import AddIcon from '@mui/icons-material/Add';
import PersonLinkAddForm from "./PersonLinkAddForm";
import { addLink as addLinkToBackend, removeLink as removeLinkFromBackend} from "../backend";

export default function PersonLinks({ person }) {
    const [personId, setPersonId] = useState(person.personId);
    const [isFormOpen, setFormOpen] = useState(false);
    const [links, setLinks] = useState(person.links || []);

    if (person.personId != personId) {
        setPersonId(person.personId);
        setLinks(person.links || []);
    }

    function remove(linkId) {
        setLinks((links) => (links.filter((o) => o.linkId != linkId)));
        removeLinkFromBackend(person.personId, linkId);
    }


    function add(url, description) {
        addLinkToBackend(person.personId, url, description).then(
            linkId => {
                console.log("refreshing")
                setLinks(oldLinks => [...oldLinks, {linkId, url, description}])
            });
    }

    return (
        <Box sx={{
            marginBottom: '20px'
        }}>
        <Typography variant="h6">Links</Typography>
        <List>
          
        { 
            links.map( 
                (link) => (
                    <ListItem 
                        disablePadding key={link.linkId}
                        secondaryAction={
                            <Button color="error" variant="text" size="small" onClick={()=>remove(link.linkId)}><RemoveCircleOutlineSharpIcon/></Button>   
                        }>
                            <ListItemButton 
                            component="a"
                            href={link.url}>{link.description} 
                            </ListItemButton>
                    </ListItem>
                    
                )
            ) } 

            <ListItem disablePadding>
                <ListItemButton onClick={() => setFormOpen(true)}><AddIcon/></ListItemButton>
            </ListItem>
        </List> 

        <PersonLinkAddForm open={isFormOpen} handleClose={() => setFormOpen(false)} applyUpdate={(url, desc) => add(url, desc)}/>
       
    </Box>);
}