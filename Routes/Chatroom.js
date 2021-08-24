const express = require("express");
const router = express.Router();
const Chatroom = require("../Models/smackroomchat")

router.post(
    "/registermessage",
    async (req, res) => {
        //check if shift exists
  try{
       let newMessage = new Chatroom({
        message1: req.body.Message,
        name1: req.body.Name,
        date1: req.body.Date,
        userid: req.body.userid,
        });
            newMessage
            .save()
            .then((newMessage) => res.json({ newMessage }))
            .catch((err) => console.log(err));
                }
            catch (err) {
              console.error(err.message);
              res.status(500).send("Server error");
            }
          }
        );


        router.get('/previousmessage', (req, res) => {
            Chatroom.find()
              .exec()
              .then((resp) => {
                res.send(resp)
              })
              .catch((err) => {
                res.send(err)
              })
          })


module.exports = router
    