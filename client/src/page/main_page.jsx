import '../index.css'
import '../app.css'
import Login from './login'
import Register from './register'
import App from './user_page'
import { createBrowserRouter, RouterProvider, redirect} from "react-router-dom";


export default function main_page(){

    const router = createBrowserRouter([
        {
          path: "/",
          element: <App/>,
        },
        {
          path:"/login",
          element:<Login/>
        },
        {
          path:"/register",
          element: <Register />
        }
    ]);
    


    return(
        
        <RouterProvider router={router} />

    )
}
  
