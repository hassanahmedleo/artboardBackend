const express = require("express");
const router = express.Router();
const League = require("../Models/League");
const Team = require("../Models/Teams");
const Schedule = require("../Models/Schedule");
const key = require("../Models/TeamsKey");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const config = require("config");
const AssignedPlayers = require("../Models/AssignedPLayers");
const Score = require("../Models/Score");
const User = require("../Models/User");
const Traderequest = require("../Models/TradeRequest");
const { response } = require("express");
const Teams = require("../Models/Teams");
const Players = require("../Models/Players")
const TransactionHistory = require("../Models/TransactionHistory")
const RecentPicks = require("../Models/RecentPick")

router.post(
    "/createleague",
    async (req, res) => {

        let newLeague = new League({
            LeagueName: req.body.leaguename,
            Numberofteams: req.body.numberofteams,
            managerid: req.body.userid,
            currentweek: 0,
            Winners: [],
            MatchupsScore: [],
            RecentScores: [],
            Losers: [],
            DraftAssist: [],
            DraftCompleted:false,
        });
        newLeague.save().then(
            (res1) => {
                console.log("response after adding league")
                res.send(res1)
            })
            .catch((err) => {
                console.log("Error while creating league", err)
                res.status(200).send("Error in Creating League Change leaguename")
            })
    }
);

router.get("/getdraftstatus/:leaguename" , async(req,res)=>{
    console.log("statusDraft");
    League.findOne({LeagueName:req.params.leaguename}).select({DraftCompleted:1}).then((resp)=>{
        console.log(resp)
        res.send(resp.DraftCompleted)
    }).catch((err)=>{
        console.log(err, "err statusDraft")
    })
})

router.put("/updatedraftstatus/:leaguename" , async(req,res)=>{
    League.findOneAndUpdate({LeagueName:req.params.leaguename} , {DraftCompleted:true}).then((response)=>{
        res.send("successfully updated")
    })
})

router.get('/getplayers', async (req, res) => {
    console.log("in get")
    Players.findOne().select({
        Players: 1
    }).then((re1) => {
        res.send(re1)
    })
    //console.log(Data)
})



router.get('/getleagueplayers/:leaguename', async (req, res) => {
    console.log("in get getleagueplayers", req.params.leaguename)
    League.findOne({ LeagueName: req.params.leaguename }).select({
        DraftPlayers: 1
    }).then((re1) => {
        console.log("re1 success")
        res.send(re1)
    }).catch((err) => {
        console.log(err)
    })
    //console.log(Data)
})


router.put("/updateDraftPlayers/:leaguename", async (req, res) => {
    // console.log(req.body);
    let arr = `DraftPlayers.${req.body.number}`
    League.findOneAndUpdate({ LeagueName: req.params.leaguename }, { $pull: { [arr]: { PlayerID: req.body.playerid } } })
        .then((res1) => {
            // console.log("DELETED" , res)
            res.send("success")
        }).catch((err) => {
            console.log("ERROR", err)
        })
})

router.put("/updatingDraftAssist/:leaguename/:currentvalue", async (req, res) => {
    // console.log(JSON.parse(req.params.currentvalue));
    let updated = await League.findOneAndUpdate({ LeagueName: req.params.leaguename }, { DraftAssist: JSON.parse(req.params.currentvalue) })
    //console.log(updated , "updatingDraftAssist")
    res.send("true")

})

router.get("/gettingDraftAssist/:leaguename", async (req, res) => {
    let data = await League.findOne({ LeagueName: req.params.leaguename }).select({ DraftAssist: 1 })
    console.log(data.DraftAssist)
    res.json(data.DraftAssist)
})

router.get('/getassignedplayers/:leaguename', async (req, res) => {
    console.log("getassignedplayers1")
    AssignedPlayers.find({ LeagueName: req.params.leaguename }).then((re1) => {
        console.log("getassignedplayers2")
        res.send(re1)
    }).catch((err) => {
        console.log(err)
    })
})

router.put("/putwinnersofweek/:leaguename", async (req, res) => {
    //console.log("In updating winmner",req.body.Losers)
    const Data = League.findOneAndUpdate({ LeagueName: req.params.leaguename }, {
        $push: { Winners: req.body.Winner, MatchupsScore: req.body.MatchupScore, Losers: req.body.Losers },

    }).then((res1) => {
        console.log("put winners of week")
        res.send(Data)
    })
        .catch((err) => {
            console.log(err);
        })
})


router.put("/updateschedule", async (req, res) => {
    console.log("In updating schedule....", req.body.newteamname, req.body.leaguename, req.body.previousteam)
    try {
        let Data = await Schedule.find({ LeagueName: req.body.leaguename })
        let Schedule1 = JSON.parse(JSON.stringify(Data[0].Schedule))
        console.log(Schedule1, "Required sechedule")
        for (let i = 0; i < Schedule1.length; i++) {
            if (Schedule1[i].teamA && Schedule1[i].teamA == req.body.previousteam) {
                Schedule1[i].teamA = req.body.newteamname
            }
            else if (Schedule1[i].teamB && Schedule1[i].teamB == req.body.previousteam) {
                Schedule1[i].teamB = req.body.newteamname
            }
        }
        console.log(Schedule1, "After changing name")
        Schedule.findOneAndUpdate({ LeagueName: req.body.leaguename }, { Schedule: Schedule1 }).then(() => {
            console.log("Schedule updated")
        })
    }
    catch (error) {
        console.log("error==>", error)
    }
})


router.put("/updateleaguerecords", async (req, res) => {
    console.log("ddd", req.body.newteamname, req.body.leaguename, req.body.previousteam)
    try {

        let Data = await League.findOne({ LeagueName: req.body.leaguename }).select({ Winners: 1, RecentScores: 1, MatchupsScore: 1, Losers: 1 })
        let winners = Data.Winners;
        let recentscore = Data.RecentScores;
        let MatchupsScore = Data.MatchupsScore;
        let Losers = Data.Losers;

        for (let i = 0; i < winners.length; i++) {

            if (winners[i].WinnnerTeam == req.body.previousteam) {
                winners[i].teamA = req.body.newteamname
            }
        }

        for (let i = 0; i < Losers.length; i++) {

            if (Losers[i].LoserTeam == req.body.previousteam) {
                Losers[i].teamA = req.body.newteamname
            }
        }

        for (let i = 0; i < recentscore.length; i++) {

            if (recentscore[i].Team1 && recentscore[i].Team1 == req.body.previousteam) {
                recentscore[i].Team1 = req.body.newteamname
            }
            else if (recentscore[i].Team2 && recentscore[i].Team2 == req.body.previousteam) {
                recentscore[i].Team2 = req.body.newteamname
            }
        }

        for (let i = 0; i < MatchupsScore.length; i++) {

            if (MatchupsScore[i].Team1 && MatchupsScore[i].Team1 == req.body.previousteam) {
                MatchupsScore[i].Team1 = req.body.newteamname
            }
            else if (MatchupsScore[i].Team2 && MatchupsScore[i].Team2 == req.body.previousteam) {
                MatchupsScore[i].Team2 = req.body.newteamname
            }
        }

        League.findOneAndUpdate({ LeagueName: req.body.leaguename }, { Winners: winners, RecentScores: recentscore, MatchupsScore: MatchupsScore, Losers: Losers }).then((res1) => { res.send("success") })
        console.log("updateleaguerecords end")
    }
    catch (err) {
        console.log(err)
    }
})

router.get("/getnumberofWeeks/:Leaguename", async (req, res) => {
    Schedule.findOne({ LeagueName: req.params.Leaguename }).select({
        Schedule: 1
    }).then((schedule) => {
        console.log(schedule.Schedule.length - 1, "ddddddddddd");
        res.status(200).json(schedule.Schedule[schedule.Schedule.length - 1])
    }).catch((err) => {
        console.log(err)
    })
})



router.get("/getwinnersarray/:Leaguename", async (req, res) => {
    League.findOne({ LeagueName: req.params.Leaguename }).select({
        Winners: 1
    }).then((res1) => {
        console.log("winners array sent")
        res.status(200).json(res1)
    }).catch((err) => {
        console.log(err)
    })
})

router.get("/getMatchupsScore/:Leaguename", async (req, res) => {
    League.findOne({ LeagueName: req.params.Leaguename }).select({
        MatchupsScore: 1
    }).then((res1) => {
        console.log("winners array sent")
        res.status(200).json(res1)
    }).catch((err) => {
        console.log(err)
    })
})

router.put("/updatingWeek/:leaguename", async (req, res) => {
    //console.log("In updating week",req.body)
    const Data = League.findOneAndUpdate({ LeagueName: req.params.leaguename }, {
        currentweek: req.body.currentweek,
        RecentScores: req.body.RecentScores
    }).then(() => {

        console.log("Updated week")
    }).catch((err) => {
        console.log(err)
    })
})

router.post(
    "/savingschedule",
    async (req, res) => {
        let NewSchedule = new Schedule({
            LeagueName: req.body.LeagueName,
            Schedule: req.body.Schedule,
        });
        NewSchedule.save().then(
            (res1) => {
                console.log("response after adding league schedule")
                res.send(res1)
            })
            .catch((err) => {
                console.log("Error while saving schedule", err)
                res.status(200).send("Error in Creating League Change leaguename")
            })
    }
);

router.get("/getrecentscores/:leaguename", async (req, res) => {
    League.findOne({ LeagueName: req.params.leaguename }).select({
        RecentScores: 1
    })
        .then((data) => {
            // console.log( "IN get scores", data)
            res.status(200).send(data)
        })
        .catch((err) => {
            console.log(err)
        })
})


router.get("/getallscores/:leaguename", async (req, res) => {
    League.findOne({ LeagueName: req.params.leaguename }).select({
        MatchupsScore: 1
    })
        .then((data) => {
            // console.log( "IN get scores", data)
            res.status(200).send(data)
        })
        .catch((err) => {
            console.log(err)
        })
})


router.get("/getalllosers/:leaguename", async (req, res) => {
    League.findOne({ LeagueName: req.params.leaguename }).select({
        Losers: 1
    })
        .then((data) => {
            res.status(200).send(data)
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get("/getallWinners/:leaguename", async (req, res) => {
    League.findOne({ LeagueName: req.params.leaguename }).select({
        Winners: 1
    })
        .then((data) => {
            res.status(200).send(data)
        })
        .catch((err) => {
            console.log(err)
        })
})



router.put("/updatingNumberofTransactions/:leaguename/", async (req, res) => {
    console.log("before find", req.params.leaguename)
    await Team.find({ LeagueName: req.params.leaguename }).then(async (teams) => {
        //console.log(teams)
        for (let t = 0; t < teams.length; t++) {
            await Team.findByIdAndUpdate(teams[t]._id, {
                Transactionsinthisweek: 0
            })
        }
        res.send("Transactionsinthisweek SET TO ZERO")
        console.log("Transactionsinthisweek SET TO ZERO")
    }).catch((err) => {
        console.log(err)
    })
})

router.post(
    "/createteam",
    async (req, res) => {
        console.log("in create team....................", req.body)
        League.find({ LeagueName: req.body.leaguename }).select({ Numberofteams: 1 })
            .then((data) => {
                if (data.length != 0) {
                    // console.log("Data in create team", data)
                    Team.find({ LeagueName: req.body.leaguename }).then((datat) => {
                        // console.log(datat.length, "datat.length==============.>")
                        // console.log(data[0].Numberofteams, "data.Numberofteams==============.>")
                        if (datat.length >= data[0].Numberofteams) {
                            res.send("League Already full")
                            return
                        }
                        else {
                            let Team1 = new Team({
                                UserID: req.body.userid,
                                LeagueName: req.body.leaguename,
                                TeamName: req.body.teamname,
                                Players: [],
                                Transactionsinthisweek: 0
                            });
                            Team1.save().then(
                                (res1) => {

                                    User.findByIdAndUpdate(
                                        { _id: req.body.userid },
                                        {
                                            Leaguename: req.body.leaguename,
                                            Teamname: req.body.teamname
                                        }
                                    )
                                        .then((issue) => {
                                            // console.log("data after team create" , issue);
                                            if (!issue) {
                                                console.log("error issue");
                                                return res.status(404).send("Issue Not Found");
                                            } else {
                                                // console.log("success res issue" , issue);
                                                let arr = {};
                                                jwt.sign({
                                                    id: issue._id,
                                                    username: issue.UserName,
                                                    email: issue.Email,
                                                    firstname: issue.FirstName,
                                                    lastname: issue.LastName,
                                                    leaguename: req.body.leaguename,
                                                    teamname: req.body.teamname,
                                                    isVerified: issue.isVerified,
                                                    image: issue.image,
                                                }, 'mysecrettoken', (err, token) => {
                                                    if (token) {
                                                        arr.type = "User";
                                                        arr.token = token;
                                                        // console.log("before sending response jwt in backend",arr)
                                                        return res.status(200).json({ msg: "League Joined Successfully", arr: arr })
                                                    }
                                                });
                                                // return res.status(200).json({msg:"Team created Successfully"})
                                            }
                                        })
                                        .catch((error) => {
                                            return res.send(error);
                                        });

                                })
                                .catch((err) => {
                                    console.log("Error while creating team", err);
                                    res.status(200).send("Error in Creating Team Change TeamName")
                                })
                        }
                    })
                }
                else {
                    res.send("League Not Exist")
                }
            }
            );
    }
)


router.get("/getmyplayers/:id", (req, res) => {
    Team.find({
        UserID: req.params.id,
    })
        .sort("id")
        .then((data) => {
            // console.log(data);
            res.send(data[0].Players)       // passing players from team model by assuming user only create one team in only one league
        })
        .catch((err) => {

            res.status(404).send(err.message);

        });
});


router.get("/getotherteamplayers/:teamname", (req, res) => {
    Team.findOne({
        TeamName: req.params.teamname,
    })
        .sort("id")
        .then((data) => {
            // console.log(data);
            res.send(data.Players)       // passing players from team model by assuming user only create one team in only one league
        })
        .catch((err) => {
            res.status(404).send(err.message);
        });
});






router.get("/currentweek/:leaguename", (req, res) => {
    League.findOne({
        LeagueName: req.params.leaguename,
    })
        .sort("id")
        .then((data) => {
            console.log(data.currentweek, "in getting current week");
            res.send(data)
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(404)
        });
});


// router.get("/currentweek/:leaguename", (req, res) => {
//     League.findOne({
//         LeagueName: req.params.leaguename,
//     })
//         .sort("id")
//         .then((data) => {
//             console.log(data.currentweek);
//             res.send(data)      
//         })
//         .catch((err) => {
//             console.log(err)
//             res.sendStatus(404)
//         });
// });




router.get("/getleagueSchedule/:leaguename", (req, res) => {
    Schedule.findOne({
        LeagueName: req.params.leaguename,
    })
        .sort("id")
        .then((data) => {
            console.log("get league schedule success")
            res.send(data)
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(404)
        });
});



router.get("/getcurrentmatchupinSchedule/:leaguename/:currentweek", (req, res) => {
    Schedule.findOne({
        LeagueName: req.params.leaguename,
    })
        .sort("id")
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(404)
        });
});



router.get("/getlastmatchupinSchedule/:leaguename/:currentweek", (req, res) => {
    Schedule.findOne({
        LeagueName: req.params.leaguename,
    })
        .sort("id")
        .then((fullschedule) => {
            console.log("fullschedule")
            res.send(fullschedule)

        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(404)
        });
});



////////////////////test api//////////////////


router.get("/testtoget", async (req, res) => {
    AssignedPlayers.find({ LeagueName: req.body.leaguename, Userid: { $ne: req.body.userid }, Playerposition: req.body.playerposition, TeamName: req.body.teamname })
        .then((data1) => {
            console.log("finding number of player per position")
            res.send(data1)
        }
        )
})




/////////////////////////


router.get("/getmyteam/:team/:league", async (req, res) => {
    console.log("in get my team", req.params);
    await Team.findOne({ LeagueName: req.params.league, TeamName: req.params.team })
        .then((data1) => {
            console.log("found my team", data1)
            res.json(data1)
        }
        ).catch((err) => {
            console.log(err, "in getmyteam");
        })
})

router.put("/recentpickadd",async(req,res)=>{
    console.log(req.body,"recentpickadd")
   RecentPicks.findOne({LeagueName:req.body.leaguename}).then((RecentPickresponse)=>{
       if(RecentPickresponse)
       {
        RecentPicks.findOneAndUpdate({LeagueName:req.body.leaguename},{Players:req.body.players}).then((res1)=>{
            console.log("successfullyupdated RecentPicks")
            res.send("successfullyupdated RecentPicks")
        }).catch((err)=>{
            console.log(err,"559")
        })
       }
       else{
        let newRecentPick =new RecentPicks({
            LeagueName:req.body.leaguename,
            Players:req.body.players
        })
        newRecentPick.save().then((res2)=>{
            console.log("successfullycreated RecentPicks")
            res.send("successfullycreated RecentPicks")
        }).catch((err)=>{
            console.log(err,"571")
        })
       }
   })
})

router.put("/addingplayerinteam", async (req, res) => {
    console.log(req.body.player.FirstName)
    AssignedPlayers.find({ LeagueName: req.body.leaguename, Playerid: req.body.player.PlayerID })
        .then((data) => {
            if (data.length == 0) {
                //console.log("Player is Not in assigned of that league")
                AssignedPlayers.find({ LeagueName: req.body.leaguename, Userid: { $ne: req.body.userid }, Playerposition: req.body.playerposition, TeamName: { $ne: req.body.teamname }, Playerteamname: req.body.playerteamname })
                    .then((data1) => {
                        //console.log(data1,"finding number of player per position")
                        if (data1.length == 0) {
                            try {
                                //console.log("in find one and update",req.body);
                                Team.findOneAndUpdate({ LeagueName: req.body.leaguename, TeamName: req.body.teamname }
                                    , { $push: { Players: req.body.player } })
                                    .then((data) => {
                                        //console.log("afterupdate", data);
                                        if (data == null) {
                                            return res.status(200).send("Error in drafting issue in lEAGUE OR IN TEAM")
                                            return;
                                        }
                                        else {
                                            let newAssign = new AssignedPlayers({
                                                LeagueName: req.body.leaguename,
                                                Playerid: req.body.player.PlayerID,
                                                Userid: req.body.userid,
                                                Playerposition: req.body.playerposition,
                                                TeamName: req.body.teamname,
                                                Playerteamname: req.body.playerteamname
                                            });
                                            newAssign.save().then((res1) => {
                                                
                                                //     AssignedPlayers.find({ LeagueName: req.body.leaguename, Userid: req.body.userid, Playerposition: req.body.playerposition, TeamName: req.body.teamname })
                                                //         .then((data1) => {
                                                //             //console.log(data1,"finding number of player per position")
                                                //             console.log("players added confirm")

                                                            res.send("players added confirm")
                                                //         }
                                                //         ).catch((err) => {
                                                //             console.log(err, "err1")
                                                //         })
                                                }
                                            ).catch((err) => {
                                                console.log(err, "err2")
                                            })
                                            //return res.send("player added confirm");
                                        }
                                        // const token = jwt.sign({userid: User._id}, jwtkey);
                                        // res.send({token});
                                    }).catch((err) => {
                                        console.log(err, "err3")
                                    })
                            }
                            catch (error) {
                                return res.send("Error while adding player")
                            }
                        }
                        else {
                            console.log("data1 else", req.body.playerid)
                            return res.status(200).send("Already drafted Players of this position group")
                        }
                    }).catch((err) => {
                        console.log(err, "err4")
                    })

                //res.send("Data is nujll")
            }
            else {
                console.log("already")
                return res.send("Already Drafted this position group")
            }
        })
        .catch((err) => {
            console.log(err, "err5")
        })
})



router.get("/getteams/:leaguename/:teamname", (req, res) => {
    //console.log("Leaguename in params1",req.params.leaguename)
    Team.find({ LeagueName: req.params.leaguename, TeamName: { $ne: req.params.teamname } }).then(
        (data) => {
            console.log("in get teams")
            res.send(data)
        }
    )
})


router.get("/getteamsforscore/:leaguename", (req, res) => {
    //console.log("Leaguename in params1",req.params.leaguename)
    Team.find({ LeagueName: req.params.leaguename }).then(
        (data) => {
            console.log("getteamsforscore1")
            res.send(data)
        }
    )
})




router.get("/getteamsforscore1/:leaguename", (req, res) => {
    //console.log("Leaguename in params1",req.params.leaguename)
    Team.find({ LeagueName: req.params.leaguename }).select({
        TeamName: 1
    }).then(
        (data) => {
            console.log("getteamsforscore2")
            res.send(data)
        }
    )
})



router.get("/getteamsfordrafting/:leaguename/:teamname", (req, res) => {
    Team.find({ LeagueName: req.params.leaguename }).then(
        (data) => {
            console.log("getteamsfordrafting")
            res.send(data)
        }
    )
})



router.get("/getleagueteams/:leaguename/:teamname", (req, res) => {
    // console.log("Leaguename in params2",req.params.leaguename)
    Team.find({ LeagueName: req.params.leaguename, TeamName: { $ne: req.params.teamname } }).then(
        (data) => {
            //console.log("get league teams",data)
            res.send(data)
        }
    )
})

router.get("/getallteamsbyleague/:leaguename", (req, res) => {
    //console.log("Leaguename in params2",req.params.leaguename)
    Team.find({ LeagueName: req.params.leaguename }).then(
        (data) => {
            //console.log("get league teams",data)
            res.send(data)
        }
    )
})

router.get("/numberofteams/:leaguename", (req, res) => {
    //console.log("Leaguename in params2",req.params.leaguename)
    League.findOne({ LeagueName: req.params.leaguename }).select({ Numberofteams: 1 }).then(
        (data) => {
            console.log("get league teamsxdvxvxv", data.Numberofteams)
            res.json(data.Numberofteams)
        }
    )
})

router.get("/getrecentpicks/:leaguename" , (req,res)=>{
    RecentPicks.findOne({LeagueName:req.params.leaguename}).select({Players:1}).then((res1)=>{
        res.send(res1.Players)
    })
    .catch((err)=>{
        console.log(err , "739")
        res.send("err")
    })
})


router.get("/getwinnersandlosersofleague/:leaguename", (req, res) => {

    League.findOne({ LeagueName: req.params.leaguename }).select({
        Winners: 1,
        Losers: 1
    }).then(
        (data) => {
            //console.log("get league winnersw and lossers",data)
            res.send(data)
        }
    )
})


router.post("/savingscore", (req, res) => {
    let score = new Score({
        LeagueName: "For all 2020",
        ScoreForTrading: req.body.ScoresForTrading
    })
    score.save().then((res) => {
        console.log("save score")
    }).catch((err) => {
        console.log(err)
    })
})

router.get("/gettopfourafterallweeks/:leaguename", (req, res) => {
    League.findOne({ LeagueName: req.params.leaguename }).select(
        { Winners: 1 }).then(
            (res1) => {
                let winners = res1.Winners
                console.log(res)
                winners.sort((a, b) => a.Score < b.Score ? 1 : a.Score > b.Score ? -1 : 0);
                res.json(winners)
            }).catch((err) => {
                console.log(err);
            })
})

router.post("/savingsPlayersArray", (req, res) => {
    let Player = new Players({ Players: req.body.Players })
    Player.save().then((res1) => {
        console.log("savingsPlayersArray1")
    }).catch((err) => {
        console.log(err);
    })
})




router.get("/gettradeoffer/:leaguename/:teamname/:id", async (req, res) => {
    // console.log("Leaguename in paramss", req.params.leaguename, req.params.teamname, req.params.id);
    let responsearray = [];

    let traderData = await Traderequest.find({ LeagueName: req.params.leaguename, Useridto: req.params.id, Teamnameto: req.params.teamname, UserVerification: false });
    //console.log("Traderdata 304",traderData);
    if (traderData.length > 0) {
        for (let i = 0; i < traderData.length; i++) {
            let teamData = await Team.find({ UserID: traderData[i].Useridfrom, TeamName: traderData[i].Teamnamefrom, LeagueName: traderData[i].LeagueName })
            if (teamData.length > 0) {
                for (let j = 0; j < teamData.length; j++) {
                    let temp = {}
                    temp.teamName = teamData[j].TeamName
                    temp.playerposition = traderData[i].PositionGroup
                    temp.traderequestid = traderData[i]._id
                    temp.players = [];
                    temp.Score = traderData[i].Score
                    teamData[j].Players.map((Player, index) => {
                        if (Player.Position == traderData[i].PositionGroup) {
                            temp.players.push(Player)
                        }
                    })
                    // console.log("temp-------------", temp)
                    responsearray.push(temp)
                }
            }
        }
    }
    //console.log('====================================>', responsearray)
    res.json(responsearray)
})
//    await Traderequest.find({LeagueName:req.params.leaguename,Useridto:req.params.id,Teamnameto:req.params.teamname}).then(
//         (data)=>{
//              console.log("find offers",data)

//         //     for(let i = 0; i < data.length; i++){
//         //         console.log('==============================',data[i])
//         //         console.log("id of from requests",data[i].Useridfrom,data[i].LeagueName,data[i].Teamnamefrom)
//         //         Team.find({LeagueName:data[i].LeagueName}).then((result) => console.log('#############################',result))
//         //         Team.findOne({UserID:data[i].Useridfrom}).then((data2)=>{console.log("Required team",data2);
//         //         console.log("2nd check of from requests",data[i].Useridfrom,data[i].LeagueName,data[i].Teamnamefrom)
//         //     })
//         // }

//              data.map(async (data1,index1)=> {

//                 console.log("id of from requests",data1.Useridfrom,data1.LeagueName,data1.Teamnamefrom)
//                await Team.find({UserID:data1.Useridfrom,TeamName:data1.Teamnamefrom,LeagueName:data1.LeagueName}).then((data2)=>{

//              //console.log("DATA2--------",data2)
//              for(let i = 0; i < data2.length; i++)
//              {

//                   let temp ={}
//                   temp.teamName = data2[i].TeamName
//                   temp.players = [];
//                  data2[i].Players.map((Player,index)=>{

//                      if(Player.Position==data1.PositionGroup)
//                      {
//                         temp.players.push(Player)

//                      }
//                  })
//                  console.log("temp-------------",temp)
//                  responsearray.push(temp)

//              }


//             // data2&&data2.Players.map((data3,index)=>{console.log("Data",data3)})
//             })

//             })
//              response.send(responsearray);

//         })





router.put("/confirmtrade/:requestid/", (req, res) => {
    console.log("before find", req.params.requestid)
    Traderequest.findByIdAndUpdate(
        { _id: req.params.requestid },
        {
            UserVerification: true
        }
    ).then((res1) => {
        console.log("after find in then")
        res.send(res1)
    }).catch((err) => { res.send(err) })
})





router.get("/getLeaguescoreforTrading/:LeagueName", (req, res) => {
    console.log("in getLeaguescoreforTrading..........")
    Score.findOne({ LeagueName: "For all 2020" }).then((res1) => {
        if (res1) {
            res.send(res1)
            console.log("res sent getLeaguescoreforTrading")
        }
        else {
            res.status(404).send("Not Found")
            console.log("res not sent getLeaguescoreforTrading")

        }
    })
})


router.get("/getleagues/", (req, res) => {
    console.log("getleague")
    League.find().select({ LeagueName: 1 }).then((res1) => {
        if (res1) {
            console.log("getleagues12")
            res.send(res1)
        }
        else {
            res.status(404).send("Not Found")
        }
    })
})





router.get("/getcommisioner/:id", (req, res) => {
    console.log(req.params.id)
    League.findOne({ managerid: req.params.id }).select({ managerid: 1 }).then((resp) => {
        if (resp) {
            res.send("true")
        }
        else {
            res.send("false")
        }
    })
})

router.get("/getmyteam/:id", (req, res) => {
    // console.log(req.params.id, " In get my teams")
    Team.findOne({ UserID: req.params.id }).then((resp) => {
        if (resp) {
            res.send(resp)
            //console.log(resp, "Response of getmyteams")
        }
        else {
            res.send("false")
        }
    }).catch((err) => {
        console.log(err)
    })
})

router.get("/getmyleague/:leaguename", (req, res) => {
    // console.log(req.params.leaguename, " In get my teams")
    League.findOne({ LeagueName: req.params.leaguename }).then((resp) => {
        if (resp) {
            console.log("Response of getmyleague")
            res.send(resp)
        }
        else {
            res.send("false")
        }
    }).catch((err) => {
        console.log(err)
    })
})

router.put("/updatingteam/:id", (req, res) => {
    // console.log(req.params.id, " In get my teams")
    // console.log(req.body.teamname, " In get my teams")
    Team.findOneAndUpdate({ UserID: req.params.id }, {
        TeamName: req.body.teamname
    }).then((resp) => {
        if (resp) {
            res.send(resp)
            //console.log(resp,"Response of getmyteams")
        }
        else {
            res.send("false")
        }
    }).catch((err) => {
        console.log(err)
    })
})




router.get("/gettradepropsalforcommisioner/:leaguename", (req, res) => {
    console.log(req.params.leaguename, "get commisioner")
    Traderequest.find({ LeagueName: req.params.leaguename, UserVerification: true }).then((resp) => {
        if (resp) {
            res.send(resp)
        }
        else {
            res.send("no response from api")
        }
    })
})


router.get("/checkwhetherdrafted/:leaguename", async (req, res) => {
   // console.log(req.params.leaguename, "check drafted")
    await League.findOne({ LeagueName: req.params.leaguename }).select({ DraftAssist: 1 })
        .then((resp) => {
            if (resp.DraftAssist) {
                let isdrafted = false;
                if (resp.DraftAssist.length>0) {
                    isdrafted = true
                }
               // console.log(req.params.leaguename, "check drafted2 1")
                res.send(isdrafted)
            }
            else {
                console.log("no data in (resp.DraftAssist.length>0)");
            }
        }).catch((err) => {
            console.log(err, "error");
        })
})

router.get("/checkwhetherdraftedandgetassign/:leaguename", async (req, res) => {
  //  console.log(req.params.leaguename, "check drafted22")
    let resp;
    resp = await League.findOne({ LeagueName: req.params.leaguename }).select({ DraftAssist: 1 })
    console.log(resp, "resp")
    if (resp.DraftAssist.length > 0) {
        let isdrafted = false;
        console.log(":resp", resp.DraftAssist[0].currentRound && resp.DraftAssist.length > 0)
        if (resp.DraftAssist.length > 0) {
            await AssignedPlayers.find({ LeagueName: req.params.leaguename }).then((re1) => {
                // console.log("getassignedplayers2")
                res.send(re1)
            }).catch((err) => {
                console.log(err)
            })
        }
        else {
           // console.log("else check drafted2")
            res.send(isdrafted)
        }
      //  console.log(req.params.leaguename, "check drafted2")
    }
    else {
        console.log("no data");
        res.send("no data")
    }

})




router.post("/postingtraderequest", async (req, res) => {
    Traderequest.find({ LeagueName: req.body.leaguename, Teamnameto: req.body.teamnameto, PositionGroup: req.body.positiongroup }).then((data) => {
        if (data.length > 0) {
            res.send("You have Already sent a request")
        }
        else {
            Team.findOne({ LeagueName: req.body.leaguename, TeamName: req.body.teamnamefrom }).then((team1) => {
                if (team1.Transactionsinthisweek < 3) {
                    let traderequest = new Traderequest({
                        LeagueName: req.body.leaguename,
                        Useridfrom: req.body.useridfrom,
                        Useridto: req.body.useridto,
                        Teamnamefrom: req.body.teamnamefrom,
                        Teamnameto: req.body.teamnameto,
                        PositionGroup: req.body.positiongroup,
                        UserVerification: req.body.userverification,
                        Score: req.body.Score
                    });
                    traderequest.save()
                    res.send("Request Sent Successfully")
                }
                else {
                    res.send("Already Made three transactions this week")
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    })
})


router.put("/updatingnumberoftransaction/:leaguename/:teamname", async (req, res) => {

    Team.findOneAndUpdate({ LeagueName: req.params.leaguename, TeamName: req.params.teamname },
        {
            $inc: { Transactionsinthisweek: 1 },

        }).then((res1) => {
            res.send(res1)
        })
        .catch((err) => {
            console.log(err);
        })
})


router.get("/getmatchesofweek/:leaguename/:week", async (req, res) => {
    console.log(req.params, "matches of week");
    let requiredmatches_Score = [];
    Schedule.findOne({ LeagueName: req.params.leaguename }).then((sschedule) => {
        // console.log(sschedule , "sschedule");
        const RequiredMatches = sschedule.Schedule.filter(match => match.week == req.params.week);
        let requiredmatches = JSON.parse(JSON.stringify(RequiredMatches))
        League.findOne({ LeagueName: req.params.leaguename }).select({ MatchupsScore: 1 }).then((matchesPlayed) => {
            console.log(requiredmatches.length - 1, "req");
            for (let match = 0; match <= requiredmatches.length - 1; match++) {
                for (let score_match = 0; score_match <= matchesPlayed.MatchupsScore.length - 1; score_match++) {
                    if (matchesPlayed.MatchupsScore[score_match].Team1 == requiredmatches[match].teamA && matchesPlayed.MatchupsScore[score_match].Team2 == requiredmatches[match].teamB && matchesPlayed.MatchupsScore[score_match].week == requiredmatches[match].week) {
                        requiredmatches_Score.push(matchesPlayed.MatchupsScore[score_match])
                    }
                }
            }
            res.json(requiredmatches_Score)
        })
    })
})



router.post("/savinghistory", async (req, res) => {
    //console.log(req.body , "savinghistory")
    let history = new TransactionHistory({
        PositionGroup: req.body.PositionGroup,
        from: req.body.Teamnamefrom,
        to: req.body.Teamnameto,
        LeagueName: req.body.LeagueName
    })
    history.save().then((history) => {
        console.log(history)
        res.send(history)
    })
})

router.get("/gettinghistory/:leaguename", async (req, res) => {
    //console.log(req.body , "savinghistory")
    TransactionHistory.find({ LeagueName: req.params.leaguename }).then((histories) => {
        console.log("histories");
        res.json(histories)
    })
})

router.get("/gettopgroups", async (req, res) => {
    Score.findOne().select({ ScoreForTrading: 1 }).then((scores) => {
        var topValues = scores.ScoreForTrading.sort((a, b) => b.Total - a.Total).slice(0, 5);
        console.log(topValues);
        res.json(topValues)
    })
})


router.put("/updatingtradeRequest", async (req, res) => {
    console.log(req.body)
    await Traderequest.updateMany({ LeagueName: req.body.leaguename, Teamnamefrom: req.body.previousteam }, {
        Teamnamefrom: req.body.newteamname
    }).then(async (res1) => {
        console.log(res1, "updatemany1")
        await Traderequest.updateMany({ LeagueName: req.body.leaguename, Teamnameto: req.body.previousteam }, {
            Teamnameto: req.body.newteamname
        }).then((reqs) => {
            console.log(reqs, "updatemany1")
            res.send("success")
        }).catch((err) => {
            console.log(err, "err1")
        })
    }).catch((err) => {
        console.log(err, "err2")
    })
})



router.put("/updatetradehistory", async (req, res) => {
    console.log(req.body, "updatetradehistory")
    await TransactionHistory.updateMany({ LeagueName: req.body.leaguename, from: req.body.previousteam }, {
        from: req.body.newteamname
    }).then(async (res1) => {
        console.log(res1, "updatemany1")
        await TransactionHistory.updateMany({ LeagueName: req.body.leaguename, to: req.body.previousteam }, {
            to: req.body.newteamname
        }).then((reqs) => {
            console.log(reqs, "updatemany1")
            res.send("success")
        }).catch((err) => {
            console.log(err, "err1")
        })
    }).catch((err) => {
        console.log(err, "err2")
    })
})






router.put("/Tradingplayers/:leaguename/:Teamnamefrom/:Teamnameto/:positiongroup", async (req, res) => {
    console.log(req.params.leaguename, req.params.Teamnamefrom, req.params.Teamnameto, req.params.positiongroup, "sss")
    let resp1positiongroup = [];
    let resp1fullteam = [];
    let resp2positiongroup = [];
    let resp2fullteam = [];
    let fularray = [];
    let Team1removedPG = [];
    let Team2removedPG = [];
    try {
        await Team.findOne({ LeagueName: req.params.leaguename, TeamName: req.params.Teamnamefrom }).then((resp1) => {
            resp1fullteam = resp1.Players;
            player1 = resp1.Players.filter((p) => (p.Position == req.params.positiongroup))
            fularray.push(player1)
            resp1positiongroup = player1
        })
        await Team.findOne({ LeagueName: req.params.leaguename, TeamName: req.params.Teamnameto }).then((resp2) => {
            resp2fullteam = resp2.Players
            player2 = resp2.Players.filter((p) => (p.Position == req.params.positiongroup))
            resp2positiongroup = player2
        })
        Team1removedPG = await resp1fullteam.filter((p) => (p.Position != req.params.positiongroup))
        for (i = 0; i < resp2positiongroup.length; i++) {
            Team1removedPG.push(resp2positiongroup[i])
        }
        Team2removedPG = await resp2fullteam.filter((p) => (p.Position != req.params.positiongroup))
        for (i = 0; i < resp1positiongroup.length; i++) {
            Team2removedPG.push(resp1positiongroup[i])
        }
        await Team.findOneAndUpdate({ LeagueName: req.params.leaguename, TeamName: req.params.Teamnamefrom }, { Players: Team1removedPG }).then((resp1) => { console.log("UPDATE SUCCESSFULLY1") })
        await Team.findOneAndUpdate({ LeagueName: req.params.leaguename, TeamName: req.params.Teamnameto }, { Players: Team2removedPG }).then((respo) => { console.log("UPDATE SUCCESSFULLY2") })
        res.send("Api run successfully")
    }
    catch (err) {
        console.log("err", err)
    }
})

router.delete("/Deletingtraderequestafterapproval/:id", async (req, res) => {
    console.log("InDeletingtraderequestafterapproval")
    console.log(req.params.id)
    try {
        Traderequest.findByIdAndDelete(req.params.id)
            .then((data) => {
                // console.log("afterupdate", data);
                res.send("confirm deleted proposal");
                // const token = jwt.sign({userid: User._id}, jwtkey);
                // res.send({token});
            })
    } catch (error) {
        res.send("error while updating")
    }
})





module.exports = router

