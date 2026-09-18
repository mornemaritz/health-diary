import  { Button } from "@mui/material";
import { solidAuth } from "../../services/solid-auth.service";

const Login: React.FC = () => {
  return(
          <Button variant="contained" onClick={solidAuth.login}>
        Login With Solid
      </Button>
  )  


}


export default Login;