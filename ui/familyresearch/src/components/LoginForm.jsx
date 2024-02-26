import {Box, TextField, Typography, Button} from "@mui/material";
import {Form, redirect} from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { login } from "../backend";

import { useState } from "react";

export default function LoginForm()
{
    const [showPassword, setShowPassword] = useState(false);

    function toggleShowPassword() {
        setShowPassword((old) => !old);
    }

    return (<Box
        component={Form}
        method="POST"
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
        noValidate
        autoComplete="off"
      >
        <Typography variant="h4">Login to Family Research</Typography>
         <TextField id="email" label="Email" variant="standard" name="email" />
         <Box sx={{display: 'flex', alignItems: 'end'}}>
             <TextField id="password" name="password" label="Password" type={showPassword || "password"} variant="standard" sx={{ flexGrow: '1'}}/>
             <Button size="small" type="button"  onClick={toggleShowPassword}   >
             {
                showPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>
             }
             </Button>
            
         </Box>

        
         <Button variant="contained" sx={{ marginTop: '20px'}} type="submit">Login</Button>


        </Box>);
}


export async function action({ request, params }) {
    const data = await request.formData();
    login(data.get('email'), data.get('password'));
    return redirect('/');
}