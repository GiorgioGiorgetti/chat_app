import { useState, createContext, useEffect } from 'react'
import axios from 'axios';
import io from 'socket.io-client'
import Search from '../component/search_user';
import List_chat from '../component/list_chat';
import Chat_list from '../component/chat_list';
import New_message from '../component/new_message';
import Nav from '../component/nav';


export const user_context = createContext(null);
const socket = io.connect("http://localhost:5000");


function App(){
    
    const [user,user_update] = useState("");
    const [list_chat, list_chat_update] = useState([])
    const [current_chat_id, update_current_chat_id] = useState("");
    const[current_chat,update_current_chat] = useState("");
    const [sug_class, sug_class_update] = useState("");

    const [side_nav_hide, side_nav_hide_update] = useState("hide_left");

    useEffect(()=>{
        axios.get("http://localhost:5000/api/user/user_info",{withCredentials:true}).then((r)=>{
            user_update(r.data)
        }).catch(()=>{window.location = "/login"})
    },[])

    useEffect(()=>{
        socket.emit("join",{user: user.username})
    },[user,current_chat_id])

    useEffect(()=>{
        axios.post("http://localhost:5000/api/user/search_chats",{
            chat: user.chat
        },{withCredentials:true}).then(r=>{
            list_chat_update(r.data);

        })
    },[user]);

    useEffect(()=>{
        if(current_chat_id != ""){

            side_nav_hide_update("hide_left")

            axios.post("http://localhost:5000/api/user/get_messages",{
                chat_id: current_chat_id.id,
                from_user: user.username,
                to_user: current_chat_id.to_user
            },{withCredentials:true}).then(
            (r)=> {
                update_current_chat(r.data)

                //update the chat list 
                const id = r.data._id;
                const c = user.chat.filter(x=>{

                    if(x == id){
                        return x;
                    }
                });
                if(c.length == 0){
                    const old_user_obj = user;
                    old_user_obj.chat.push(r.data._id)
                    user_update(old_user_obj);
                    list_chat_update([...list_chat, r.data])
                }

                //remove the notification
                list_chat.filter((x,y)=>{
                    if(current_chat_id.id == x._id){
                        const list_chat_copy = [...list_chat];
                        delete list_chat[y].notification
                    }
                })
            });

                
        }
    },[current_chat_id])


    return(
        <div className='user_page_cnt' onClick={()=>{sug_class_update("hide")}}>
            <section className={'side_nav_section ' + side_nav_hide}>
                <Search sug_class_update={sug_class_update} sug_class={sug_class} update_current_chat_id={update_current_chat_id} user={user}/>
                <List_chat list_chat={list_chat} user={user} update_current_chat_id={update_current_chat_id}/>
            </section>
            <section className='body_section'>
                <Nav current_chat_id={current_chat_id}  side_nav_hide_update={side_nav_hide_update}/>
                <Chat_list list_chat={list_chat} list_chat_update={list_chat_update} socket={socket} current_chat={current_chat} update_current_chat={update_current_chat} user={user}/>
                <New_message user={user} socket={socket} current_chat={current_chat} update_current_chat={update_current_chat}/>
            </section>
        </div> 
    )
}

export default App;