import { useEffect, useRef } from "react";
import axios from "axios";

export default function chat_list({current_chat,user, socket, update_current_chat, list_chat_update, list_chat}){
    
    const bottomRef = useRef(null);
    
    let arr = current_chat.messages;
    if(current_chat.messages == undefined){
        arr = []
    }


    useEffect(() => {
        socket.on('receive_message', (data) => {
            if(current_chat.users != undefined){
                if(data.from == current_chat.users[0] || data.from == current_chat.users[1]){
                    const current_chat_copy = {...current_chat};
                    current_chat_copy.messages.push(data)
                    update_current_chat(current_chat_copy);
                }else{
                    const filter = list_chat.filter((x,y)=>{
                        if(x.users[0] == data.from || x.users[1] == data.from){
                            const list_chat_copy = [...list_chat];
                            if(!list_chat_copy[y].notification){
                                list_chat_copy[y].notification  = 1
                            }else{
                                list_chat_copy[y].notification ++
                            }
                            list_chat_update(list_chat_copy)
                            return y;
                        }
                    });
                    
                    if(filter.length == 0){
                        axios.get("http://localhost:5000/api/user/user_info",{withCredentials:true}).then(
                        (r)=>{ 
                            axios.post("http://localhost:5000/api/user/search_chats",{
                                chat: r.data.chat
                            },{withCredentials:true}).then(r=>{
                                list_chat_update(r.data);

                            })
                        })
                    }
                }
            }else{
                const filter = list_chat.filter((x,y)=>{
                    if(x.users[0] == data.from || x.users[1] == data.from){
                        const list_chat_copy = [...list_chat];
                        if(!list_chat_copy[y].notification){
                            list_chat_copy[y].notification  = 1;
                        }else{
                            list_chat_copy[y].notification ++
                        }
                        list_chat_update(list_chat_copy)
                        return y;
                    }
                });
                
                if(filter.length == 0){
                    // new caht
                    axios.get("http://localhost:5000/api/user/user_info",{withCredentials:true}).then(
                    (r)=>{ 
                        axios.post("http://localhost:5000/api/user/search_chats",{
                            chat: r.data.chat
                        },{withCredentials:true}).then(r=>{
                            list_chat_update(r.data);
                        })
                    })
                }
            }

            
            
        });
    
        // Remove event listener on component unmount
        return () => socket.off('receive_message');
    }, [socket,current_chat,list_chat]);

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [current_chat]);

    return( 
        <div className="chat_list_cnt_div">
            {
                (()=>{
                    
                    if(arr.length!= 0){
                        return arr.map((x,y)=>{
                            if(x.from == user.username){
                                return (<div className="sended" key={y}> {x.message}</div>)
                            }else{
                                return (<div className="recive" key={y}> {x.message}</div>)
                            }
                        })
                    }else{
                        return(
                            <div className="message_empty_chat">
                                <h1>start chat ;)</h1>
                                <p>
                                    search for other person on the <br />
                                    left navigation bar end start to chat
                                </p>
                            </div>
                        )
                    }
                })()
            }
            <div ref={bottomRef} />
        </div>
    )
}