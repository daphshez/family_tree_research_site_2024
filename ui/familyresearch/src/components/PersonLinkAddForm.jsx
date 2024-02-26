import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function PersonLinkAddForm({open, handleClose, applyUpdate}) {

    function onSubmit(event) {
        event.preventDefault();

        const fd = new FormData(event.target);
        const url = fd.get("url");
        const description = fd.get("description");

        applyUpdate(url, description);
        handleClose();
    }


    return (
        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            component: 'form',
            onSubmit: onSubmit
          }}
        >
            <DialogTitle>Add Link</DialogTitle>
            <DialogContent sx={{display: 'flex', flexDirection: 'column' }}>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 400 }}>
                <TextField 
                    name='url'
                    autoComplete="off"
                    id='url'
                    label='URL'
                    sx={{ marginBottom: '10px'}}/>
            </FormControl>

            <FormControl variant="standard" sx={{ m: 1, minWidth: 400 }}>
                <TextField 
                    name='description'
                    id='description'
                    label='Description'
                    sx={{ marginBottom: '10px'}}/>
            </FormControl>

            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogActions>
        </Dialog>
    );
  }