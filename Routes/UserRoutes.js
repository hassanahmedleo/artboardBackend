const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const key = require("../Models/TeamsKey")
const Players = require("../Models/PlayersNcaa")
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const config = require("config");
//import jwt_decode from "jwt-decode";
const mongoose = require('mongoose');
const multer = require('multer');

const path = require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(__dirname, '../Images', "direc")
        cb(null, path.join(__dirname, '../Images'));
    },
    filename: function (req, file, cb) {
        // cb(null, new Date().toISOString()+file.originalname)
        //console.log(file ,"filessssssssssssssss");
        cb(null, new mongoose.Types.ObjectId() + file.originalname);
    }
});


const upload = multer({
    storage: storage
});



router.post(
    "/registeruser", upload.single('image'),
    async (req, res) => {
         console.log(req.body , req.file , "data in register");
        let data = JSON.parse(req.body.user)
        let arr = {};
        console.log(req.body);
        console.log(req.file, data, "files")

        try {
            //check if user exists
            User.findOne({ Email: data.email }).then((person) => {
                if (person) {
                    return res.status(400).json({ email: "Email already exists!" });
                } else {
                    let newPerson = new User({
                        UserName: data.username,
                        Email: data.email,
                        FirstName: data.firstname,
                        LastName: data.lastname,
                        Password: data.password,
                        Leaguename: '',
                        Teamname: '',
                        isVerified: false,
                        image: req.file
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPerson.Password, salt, (err, hash) => {
                            if (err) throw err;
                            newPerson.Password = hash;
                            newPerson
                                .save()
                                .then((ress) => {
                                    // console.log("RESPONSE AFTER SAVING DATA INJ DB" , ress)
                                    const payload = {

                                        id: ress._id,
                                        username: ress.UserName,
                                        email: ress.Email,
                                        firstname: ress.FirstName,
                                        lastname: ress.LastName,
                                        leaguename: ress.Leaguename,
                                        teamname: ress.Teamname

                                    };
                                    jwt.sign(payload, 'mysecrettoken', (err, token) => {
                                        if (token) {
                                            arr.type = "User";
                                            arr.token = token;
                                            // console.log("before sending response jwt in backend",arr)
                                            return res.send(arr);
                                        }
                                    });
                                })
                                .catch((err) => console.log(err,));
                        });
                    });
                }
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);


router.post("/sendemail/:token", async (req, res) => {
    console.log("nodemailer api from front end" , req.params.token)
    let message = req.params.token;
    let token = jwt.decode(req.params.token);
    let email = token.email;
    // create reusable transporter object using the default SMTP transport
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            service: "gmail", // true for 465, false for other ports

            ignoreTLS: false,
            secure: false,
            auth: {
                user: "hassanahmedleo786@gmail.com", // generated ethereal user
                pass: "hassangujjar@comsat", // generated ethereal password
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
            },
        });

        // https://artboardbackend.herokuapp.com/api/User/verify/${message}
        //http://localhost:3000

       
       
        const mesage = {
            from: "hassanahmedleo786@gmail.com", // sender address
            to: email, // list of receivers
            subject: "art board email verification", // Subject line
            html: `<p><a href="https://artboardbackend.herokuapp.com/api/User/verify/${message}">Click here to verify</a></p>`, // plain text body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mesage);

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        res.send("Email Sent");
    }
    catch (err) {
        console.log("IN CATCH--------------", err)
        res.send("error")
    }
});


router.put("/updatingteam/:id", async (req, res) => {
    // console.log(req.params.id," UsEr ROUTES In get my teams")
    // console.log(req.body.teamname," In get my teams")
    let arr = {};
    let resp = await User.findByIdAndUpdate({ _id: req.params.id }, {
        Teamname: req.body.teamname
    })
    console.log("in them")
    let obj = resp;
    obj.teamname = req.body.teamname
    console.log(obj, req.body.teamname)
    const payload = {
        id: obj._id,
        username: obj.UserName,
        email: obj.Email,
        firstname: obj.FirstName,
        lastname: obj.LastName,
        leaguename: obj.Leaguename,
        teamname: req.body.teamname
    };
    jwt.sign(payload, 'mysecrettoken', (err, token) => {

        if (token) {

            arr.type = "User";
            arr.token = token;
            // console.log("before sending response jwt in backend",arr)
            return res.send(arr);
        }
    });
    //console.log(resp,"Response of getmyteams")
})



router.get("/verify/:token", verify);

router.get("/isemailverified/:uid",  (req, res) => {
    User.findById(req.params.uid).then((person1) => {
        console.log(person1.isVerified, "isemailverified")
        res.status(200).json({verify:person1.isVerified})
    }).catch((err) => {
        console.log(err);
        res.status(400).send("error in finding isverify");

    })
})


router.post(
    "/login",
    async (req, res) => {
        let arr = {};
        const { email, password } = req.body;
        console.log("reqest.body", req.body)
        try {
            //check for user
            User.findOne({ Email: email }).then((person1) => {

                if (!person1) {
                    return res.status(400).json({
                        errors: [{ msg: "Invalid Username or Password" }],
                    });
                }
                else if (person1.isVerified == false) {
                    return res.status(400).json({
                        errors: [{ msg: "Verify your email through link which is sent to your email" }],
                    }
                    )
                }
                else {

                    bcrypt.compare(password, person1.Password).then((isMatch) => {
                        if (isMatch) {

                            const payload = {
                                id: person1._id,
                                username: person1.UserName,
                                email: person1.Email,
                                firstname: person1.FirstName,
                                lastname: person1.LastName,
                                leaguename: person1.Leaguename,
                                teamname: person1.Teamname,
                                image: person1.image
                            };
                            //Sign Token
                            jwt.sign(payload, 'mysecrettoken', (err, token) => {
                                // if (err) throw err;
                                if (token) {
                                    arr.type = "User";
                                    arr.token = token;
                                    return res.send(arr);
                                }
                            });
                        } else {
                            return res.status(400).json({ errors: [{ msg: "Invalid Username or Password" }] });
                        }
                    });
                }
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);




async function verify(req, res) {
    console.log("sdvsdvdsvsdd");
    if (!req.params.token) return res.status(400).json({ message: 'We were unable to find a user for this token.' });
 
    try {
        //const token = await Token.findOne({ token: req.params.token });
        // if (!token)
        // 	return res.status(400).json({
        // 		0message: 'We were unable to find a valid token. Your token may have expired.',
        // 	});
        console.log("token in verify function", req.params.token)
        const data = jwt.decode(req.params.token);
        console.log("after decode", data.id)

        User.findByIdAndUpdate(data.id, { isVerified: true })
            .then((resp) => {
                console.log("resp before redirecting",resp)
                // res.send("Email verified Log in to your account")
                //https://616fe0357338c4115c64be4b--artboard-st.netlify.app
               res.redirect('https://616fe0357338c4115c64be4b--artboard-st.netlify.app/joinleague/' + req.params.token)
              //  res.redirect('http://localhost:3001/joinleague/' + req.params.token)
            }).catch((err)=>{
                return res.status(400).json({ message: 'We were unable to find a user for this token.' });
            })
    } catch (error) {
        console.log(error);
          res.status(500).json({ message: error.message, status: 'failed' });
    }
}


// router.post("postingplayer", async(req,res) => {
//     let key1 = new key({
//         Teams: req.body.team,
//     }) 
//     Players.save().then(()=>{console.log("saved key" , req.body)})
// })


router.post("savingteamkey", async (req, res) => {
    let key1 = new key({
        key: req.body.key,
    });
    key1.save().then(() => { console.log("saved key", req.body.key) })
})

module.exports = router
