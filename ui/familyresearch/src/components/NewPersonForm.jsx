import { Form } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent,  TextField, DialogActions, Button} from '@mui/material';


export default function NewPersonForm({open, handleClose}) {

    return (
        <Dialog
          open={open}
          onClose={handleClose}
        >
          <Form method='POST'>
            <DialogTitle>New Person Name</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                required
                margin="dense"
                autoComplete="off"
                id="newPersonName"
                name="newPersonName"
                label="Full Name"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogActions>
          </Form>
        </Dialog>
    );
  }