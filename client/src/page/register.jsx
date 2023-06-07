import { useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";


const update = (state, action)=>{
    switch (action.type){
        case "username" :
            return {username: action.val, password : state.password, confirm_password: state.confirm_password}
        case "password" :
            return{username: state.username , password : action.val, confirm_password: state.confirm_password}
        case "Confirm Password":
            return{username: state.username , password : state.password, confirm_password: action.val}
    }
}


function Register (){

    const [data, funct_data] = useReducer(update,{username:null,password:null, confirm_password: null});
    const [res, resUpdate] = useState(null);

    const login_request = (e)=>{
        e.preventDefault();
        if(data.confirm_password == data.password){
            axios.post("http://localhost:5000/api/create_user",{
                username: data.username,
                password: data.password
            },{
                withCredentials: true
            }).then( res =>{
                resUpdate(res.data);
                console.log(res.data)
                if(res.data.status == true){
                    window.location = "/"
                }
            })
        }
    }
    
    return(
        <div className="log_page">
            <div className="container">
                <form onSubmit={login_request}>
                    <h1>Register</h1>
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
                        {
                            (()=>{
                                if(res != null){
                                    if(res.status == false && res.number == 1){
                                        return <div className='error'>{res.error}</div>
                                    }
                                }
                            })()
                        }

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
                    </label>
                    <label htmlFor="cnf_passwd"> 
                        Confirm the password :
                        <input 
                            type="password" 
                            id="cnf_passwd"
                            onChange={e=>{
                                funct_data({ type: "Confirm Password", val: e.target.value});
                            }}
                            required
                        />
                        {
                            (()=>{
                                if(data.confirm_password != data.password){
                                    return <div className='error'> passwords are not the same </div>
                                }
                            })()
                        }
                    </label>
                    <div className='submit_cnt'>
                        <button type="submit"> submit </button>
                        <div className='submit_text'>
                            <p>already a user?</p>
                            <Link to="/login">Login</Link>
                        </div>
                    </div>
                </form>
                
            </div>
        </div>
    )
};

export default Register;