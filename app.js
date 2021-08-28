var express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
var Chatroom = require("./Routes/Chatroom");
var User = require("./Routes/UserRoutes");
var League = require ("./Routes/LeagueRoutes")
app.use(cors());
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
//const conn = require("./Config/db");
app.use("/api/Chatroom", Chatroom);
app.use("/api/User" , User);
app.use("/api/League" , League);
app.use('/Images', express.static('Images'));


const mongoose = require("mongoose");

//Server Config



io.on("connection", socket => {
    console.log("a user connected :D");

    socket.on("chat message", (msg) => {
      console.log("mess",msg.message);
      console.log("mess",msg.name);
      const message1 = msg.message;
      const name1 = msg.name;
      const date1 = msg.date;
      const uid1 = msg.uid
      io.emit("chat message",{message1,name1,date1,uid1});
    });

    socket.on("Players added", (data) => {

      //console.log("player added",data);
      let teams =data.teams.map((data, index)=>{
        if(data.active){
          return {
            ...data,
            active: false,
            isPlayed:true,
          }
        }else{
          return data
        }
      })

    //console.log(teams)
    let playedUser = teams.filter(team=> team.isPlayed === true)
    //console.log(playedUser)
    let unPlayed = teams.filter(team => team.isPlayed === false)
    //console.log(unPlayed)
    let playingPlayer = unPlayed.map((team, index)=> {
      if(index === 0){
        return {
          ...team,
          active: true,
          isPlayed:false,
        }
      }
      else{
        return {
          ...team,
          active:false,
          isPlayed:false,
        }
      }
      })

      let currentRound=data.currentRound;
      let totalRounds = data.totalRounds;
      let totalTeams=data.totalTeams;

      if(data.totalTeams==playedUser.length)
      {
        currentRound++; 
        let nextroundteam = data.teams.map((team, index)=> {return{...team, active:false,isPlayed:false}})
        io.emit("player added",{teams: nextroundteam,totalRounds,currentRound,totalTeams});
      }
      else
      {
        io.emit("player added",{teams: [...playedUser,...playingPlayer ],totalRounds,currentRound,totalTeams});
      }
      //console.log([...playedUser,...playingPlayer ])
  });


  socket.on("Initialize_waiting_for_others" , (data) => {
    // console.log(data , "Initialize_waiting_for_others");
    io.emit("waiting_for_others","10");
  }) 

  socket.on("waiting_for_others" , (data) => {
    // console.log(data , "waiting_for_others");
    io.emit("waiting_for_others",data);
  })

  socket.on("initialize", (data) => {
    //console.log("player added",data);
    //console.log("mess of player added1",data.teams);
    //console.log(".........................................................")
   let teams =data.teams.map((data, index)=>{
     if(index === 0)
     {
       return {
         ...data,
         active: true,
         isPlayed:false,
       }
     }
     else{
       return {
         ...data,
         active:false,
         isPlayed:false,
       }
     }

   })

   let totalRounds = data.totalRounds;
   let currentRound=data.currentRound;
   let totalTeams=data.totalTeams;
   

   io.emit("initializeDone",{teams,totalRounds,currentRound,totalTeams});
   io.emit("initializeDone1",{teams,totalRounds,currentRound,totalTeams});
  //  console.log(".........................................................")
  }); 
})


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.clear();
  console.log(`server running on port ${port}`);
});




var conn = mongoose
	.connect("mongodb+srv://hassan:hassan@cluster0.tibmk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Connected to mongoDB!"))
	.catch((err) => console.log("Could not connect to mongoDB... \n", err));
	// mongodb+srv://USER1:USER1@cluster0.xkczw.mongodb.net/ShiftCalender?retryWrites=true&w=majority http://localhost:2707/sportDB






//DB Config