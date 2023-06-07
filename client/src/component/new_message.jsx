import { useEffect, useState } from "react"

export default function new_message({current_chat,update_current_chat, socket, user}){
    const [input_val, val_update] = useState("");

    const send_message = ()=>{

        if(current_chat.users){
            const message = input_val;
            const chat_id = current_chat._id;
            const to_name = ()=>{
                let name = current_chat.users[0];
                if(name == user.username){
                    name = current_chat.users[1];
                }
                return name
            }
            socket.emit("send_message",{message:message, chat_id:chat_id, from: user.username, to: to_name()})

            const message_obj = {
                message : message,
                from: user.username
            }
            const current_chat_copy = {...current_chat};
            current_chat_copy.messages.push(message_obj)
            update_current_chat(current_chat_copy);
        }
        val_update("")
    }
    
    return(
        <div className="form_cnt">
            <form className="container_form" onSubmit={(e)=>{
                e.preventDefault();
                send_message();
            }}>
                <input type="text" name=" message" value={input_val} onChange={(e)=>{val_update(e.target.value)}}/>
                <button type="submit">Send</button>
            </form>
        </div>
    )
}