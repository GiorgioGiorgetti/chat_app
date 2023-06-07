import menu_icon from '../assets/menu.png'

export default function nav({current_chat_id, side_nav_hide_update}){
    
    return(
        <div className="nav">
            <div className='menu_cnt' onClick={()=>{side_nav_hide_update("")}}>
                <img src={menu_icon} alt="" />
            </div>
            <div className='chat_name'>{
            (()=>{return(
                <div>
                    <h4>{current_chat_id.to_user}</h4>
                    {(()=>{
                        if(current_chat_id.to_user){
                            
                            return (<div className='nav_cnt_div'>{current_chat_id.to_user[0].toUpperCase()}</div>)
                        }
                    })()}</div>
            )})()
            }</div>
        </div>
    )
}