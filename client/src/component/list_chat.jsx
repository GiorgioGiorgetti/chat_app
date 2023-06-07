import { useEffect, useState } from "react";
import axios from "axios";

function list_chat({user,update_current_chat_id,list_chat}){
    

    const notificatino = (length)=>{
        if(length){
            return( <p>{length}</p> )
        }
    }
    const render_list = list_chat.map((x,y)=>{
        const to_Name = ()=>{
            if(x.users[0] == user.username){
                return x.users[1]
            }else{
                return x.users[0]
            }
        }
        return(
            <div className="user_list_cnt" key={y} onClick={()=>{
                update_current_chat_id({id:x._id, to_user: to_Name()});
            }}>
                <div>
                    {notificatino(x.notification)}
                    {to_Name()[0].toUpperCase()}
                </div>
                <h4>{to_Name()}</h4>
            </div>
        )
    })


    return(
        <div>
            {render_list}
        </div>
    )
}

export default list_chat;