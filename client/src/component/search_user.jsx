import { useState, createContext, useEffect } from 'react'
import axios from 'axios';
function search({sug_class,sug_class_update,update_current_chat_id, user}){

    const [val,Update_val] = useState("");
    const [user_search, user_search_update] = useState([]);

    useEffect(()=>{
    },[sug_class])

    useEffect(()=>{
        if(val != ""){
            axios.get("http://localhost:5000/api/user/search/_"+ val, {withCredentials:true}).then(
                (r)=>{
                    user_search_update(r.data);
                }
            );
            sug_class_update("")
        }else{
            user_search_update([]);
        }

    }, [val]);





    return(
        <div className="search_user_cnt" >
            <input type="text" placeholder="@username" value={val} onChange={(e)=>{Update_val(e.target.value)}}/>
            <div className={'sug_cont ' +  sug_class}>
                {
                    user_search.map(x=>{
                        if(x.username != user.username){
                            return(
                                <div className="user_list_cnt"  key={x._id} onClick={()=>{
                                    update_current_chat_id({id: undefined, to_user: x.username}); 
                                    Update_val("");
                                }}>

                                    <div className="user_icon">{x.username[0].toUpperCase()}</div>
    
                                    <h2>{x.username}</h2>
    
                                </div>
                            )
                        }
                        
                    })
                }
            </div>
        </div>
    )
}

export default search;