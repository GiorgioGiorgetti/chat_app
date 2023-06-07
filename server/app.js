require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { Socket } = require('socket.io');
const { connect } = require('http2');
const { Console } = require('console');


const app = express();
const httpServer = require("http").createServer(app);
const port = 5000;



app.use(cors({
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: ['http://localhost:5173']
}));
app.use(express.json());
app.use(cookieParser());
/* const Socket_io = new WebSocket("locahost:3030"); */
mongoose.connect('mongodb://127.0.0.1:27017/chat_2').then(()=> console.log("connected")).catch(error => handleError(error));


app.get("/api",(req,res)=>{
    res.send({test:"ciao"})
});


//users
const user_schema = new mongoose.Schema({
    username: String,
    password: String,
    chat: [String]
});
const user_model = new mongoose.model("users", user_schema);

//chat
const messages_schema = new mongoose.Schema({
    from: String,
    message: String,
    date: Date
})
const chat_schema = new mongoose.Schema({
    users: [String],
    messages:[messages_schema]
})
const messages_model = new mongoose.model("messages",messages_schema);
const chat_model = new mongoose.model("chats",chat_schema);



app.post("/api/login",async (req,res)=>{

    const {username, password} = req.body;
    if(username && password){
        const user_obj = await user_model.find({username: username});

        if(user_obj.length == 0){
            res.send({status: false, error:"user doesent exist", number: 1});
        }else{
            if(bcrypt.compareSync(password,user_obj[0].password)){

                const cookie = jwt.sign({ username: username, id: user_obj[0]._id }, process.env.ACESS_TOKEN);
                res.cookie("chat_user",cookie,{httpOnly: true, sameSite:"strict", overwrite: true})
                res.send({status: true, id:user_obj[0]._id,});

            }else{
                res.send({status:false, error:"wrong password", number: 2});
            }
        }
    }else{
        res.send({status: false, error:"miss_configuration",number: 0})
    }
});



app.post("/api/create_user", async(req,res)=>{
    const {username, password} = req.body;
    if(username && password){
        const user_obj = await user_model.find({username: username});
        if(user_obj.length == 0){
            
            const new_user = new user_model({
                username: username,
                password: bcrypt.hashSync(password, 10),
            });
            const cookie = jwt.sign({ username: username, id: new_user._id }, process.env.ACESS_TOKEN);

            await new_user.save();
            res.cookie("chat_user",cookie,{httpOnly: true, sameSite:"strict", overwrite: true})
            res.send({status: true, id: new_user._id});
        }else{
            res.send({status: false, error:"user already exist", number: 1})
        }
    }else{
        res.send({status: false, error:"miss_configuration", number: 0});
    }
    
});


//middleware
app.use("/api/user",async(req,res,nex)=>{
    const token = req.cookies.chat_user;

    if(!token){
        res.redirect("http://localhost:5173/login");
    }else{
        jwt.verify(token, process.env.ACESS_TOKEN,(err, user)=>{
            if(err){
                res.redirect("http://localhost:5173/login");
            }else{
                req.user = user;
                nex();
            }
        })
    }
})

app.get("/api/user/user_info", async(req,res)=>{

    const {id} = req.user;
    const find = await user_model.findById(id);
    const obj =  {...find._doc};
    
    delete obj.password;
    delete obj.__v

    res.send(obj);
});


app.get("/api/user/search/:val", async(req,res)=>{
    const val = req.params.val.substring(1);
    if(val){
        const regex = new RegExp(val)
        const user = await user_model.find({"username" : {$regex: regex}}).select(["username","_id"]).limit(5);

        res.send(user)
    }else{
        res.send([])
    }
});

app.post("/api/user/search_chats", async(req,res)=>{
    const chat = req.body.chat;
    if(chat){
        if(chat.length != 0){

            const chat_req = await chat_model.find({ _id: { $in: chat } }).select("users");
            res.send(chat_req)
        }else{
            res.send([])
        }
    }else{
        res.send([])
    }
});

app.post("/api/user/get_messages", async(req,res)=>{

    const {chat_id, from_user,to_user} = req.body;
    const recover_chat = async()=>{
        const serch = await chat_model.find({users:from_user});
        return serch.filter(x=>{
            if((x.users[0] == to_user || x.users[1] == to_user) && x.users.length == 2){
                return x
            }
        })
    }

    const chat_obj= {
        _id: null,
        users:[],
        messages: []
    }

    if(!chat_id){
        const rec = await recover_chat();
        if(rec.length != 0){
            
            const rec_c = await chat_model.findById(rec[0]._id);
            chat_obj._id = rec[0]._id;
            chat_obj.messages = rec_c.messages;
            chat_obj.users = rec_c.users;
            
        }else{
            //new chat
            const new_chat = new chat_model({
                users:[from_user,to_user],
                messages: []
            });
            await new_chat.save();

            //update users
            await user_model.findOneAndUpdate({username:from_user},{$push: {chat: new_chat.id}})
            await user_model.findOneAndUpdate({username:to_user},{$push: {chat: new_chat.id}})

            chat_obj._id = new_chat._id;
            chat_obj.messages = new_chat.messages,
            chat_obj.users = new_chat.users

        }
    }else{
        const rec = await chat_model.findById(chat_id);
        if(rec.length != 0){
            chat_obj._id = rec._id;
            chat_obj.messages = rec.messages;
            chat_obj.users = rec.users;
        }
    }

    res.send(chat_obj);
})




//MESSAGE APP
const io = require("socket.io")(httpServer,{
    cors:{
        origin: "http://localhost:5173"
    }
});

const current_users = {}
io.on("connection", socket => {
    console.log("connected")

    socket.on("join", (user) =>{
        current_users[user.user] = socket.id;
        console.log("users=>",current_users)
    });

    socket.on("send_message", async (data) =>{
        if(data){

            const from_user = data.from;
            const chat_id = data.chat_id;
            const to = data.to;
            console.log("========>=>==>==>=>", from_user)
            
            

            const new_message = new messages_model({
                from: from_user,
                message: data.message,
            });

            const t = await chat_model.findByIdAndUpdate(chat_id,{$push:{"messages": new_message}});
            console.log(current_users[to])
            if(current_users[to]){
                socket.to(current_users[to]).emit("receive_message", new_message);
            }
        }
    });

}); 


httpServer.listen(port, ()=>{console.log("listenint on port: " + port)});