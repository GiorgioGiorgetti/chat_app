import { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

const update = (state, action)=>{
    switch (action.type){
        case "username" :
            return {username: action.val, password : state.password}
        case "password" :
            return{username: state.username , password : action.val}
    }
}


function login (){

    const [data, funct_data] = useReducer(update,{username:null,password:null});
    const [response, update_res] = useState(null)
    const navigate = useNavigate();


    const login_request = (e)=>{
        e.preventDefault();
        

        axios.post("http://localhost:5000/api/login",{
            username: data.username,
            password: data.password
        },{
            withCredentials: true
        }).then( res =>{

            if(res.status = true){
                window.location = "/"
            }
        })
    }
    
    const error_fnc = (val)=>{
        if(response){
            if(response.status == false){
                switch (response.number){
                    case 1:
                        if(val == 1){
                            return <div className='error'>{response.error}</div>
                        }else{
                            return null
                        }
                    case 2:
                        if(val == 2){
                            return <div className='error'>{response.error}</div>
                        }else{
                            return null
                        }
                }
            }
        }
    }
    
    return(
        
        <div className='log_page'>
            <div className="container">
                <form onSubmit={login_request}>
                    <h1>Login</h1>
                    <label htmlFor="username"> 
                        Username :

                        <input 
                            type="text" 
                            id="username" 
                            placeholder="@user"
                            onChange={e=>{
                                funct_data({ type: "username", val: e.target.value});
                            }}
                            required
                        />
                        {error_fnc(1) }


                    </label>
                    <label htmlFor="passwd"> 
                        Password :
                        <input 
                            type="password" 
                            id="passwd"
                            onChange={e=>{
                                funct_data({ type: "password", val: e.target.value});
                            }}
                            required
                        />
                        {error_fnc(2) }
                    </label>
                    <div className='submit_cnt'>
                        <button type="submit"> submit </button>
                        <div className='submit_text'>
                            <p>not already a user?</p>
                            <Link to="/register">Create a new user</Link>
                        </div>
                    </div>
                </form>
                
            </div>
        </div>
    )
};

export default login;