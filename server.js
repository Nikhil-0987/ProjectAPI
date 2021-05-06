const express = require('express');


const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const saltRound = 10;


const app = express();

app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://pali123:pali123@cluster0.hsdqc.mongodb.net/projectDB",{useNewUrlParser:true,useUnifiedTopology:true});
const advisorSchema = {
    advisorName:String,
    advisorPhotoURL:String
}
const userSchema = {
    Name:String,
    Email:String,
    Password:String
}

const bookingSchema = {
    advisorid : String,
    userid : String,
    BookingTime : String
}

const Advisor = mongoose.model("Advisor",advisorSchema);
const User = mongoose.model('User',userSchema);
const Book = mongoose.model('Book',bookingSchema);

app.post('/user/register/',(req,res)=>{
 bcrypt.hash(req.body.Password,saltRound,(err,hash)=>{
  const newUser = new User({
      Name:req.body.Name,
      Email:req.body.Email,
      Password:hash
  });
   newUser.save((err)=>{
      if(err){res.send("400_BAD_REQUEST")}
      else{res.send("200_OK")}
   })
 })


})

app.post("/user/login/",(req,res)=>{
    
    const Email = req.body.Email;
    const Password = req.body.Password;
     
   User.findOne({Email:Email},(err,foundUser)=>{if(foundUser){
       
       bcrypt.compare(Password,foundUser.Password,function(err,result){
           if(result === true){res.send(foundUser._id)}
           else{res.send("401_AUTHENTICATION_ERROR")}  
         })
       }
   else{res.send("400_BAD_REQUEST")}
     
   })  
        
 });

app.get("/user/:id/advisor",(req,res)=>{
   Advisor.find((err,foundUser)=>{
       if(err){res.send('404_BAD_REQUEST')}
       else{res.send(foundUser)}
   })
})


app.post('/user/:userid/advisor/:advisorid',(req,res)=>{

      const bookingTime = req.body.bookingTime;

      const newBT = new Book({
          advisorid : req.params.advisorid,
          userid : req.params.userid,
          BookingTime : bookingTime
      })


      newBT.save((err)=>{
        if(err){res.send("400_BAD_REQUEST")}
        else{res.send("200_OK")}
      }
   )
    })


app.get('/user/:id/advisor/booking',(req,res)=>{
 
    Book.find({userid:req.params.id},(err,foundOne)=>{

           let something = {};
           if(err){res.send('404_BAD_REQUEST')}
           else{
                Advisor.find({_id:foundOne[0].advisorid},(error,found)=>{
                    if(error){res.send('404_BAD_REQUEST HERE')}
                      else{
                          something = {...found[0]._doc}
                          something = {...something,'Booking Time':foundOne[0].BookingTime} 
                          something = {...something,'Booking ID' :foundOne[0]._id}
                          res.send(something);
                        }
                 })
           }
    })

})





app.post("/admin/advisor",(req,res)=>{
    const newAdvisor = new Advisor({
        advisorName:req.body.advisorName,
        advisorPhotoURL:req.body.advisorPhotoURL
    })

    newAdvisor.save((err)=>{
        if(err){res.send("400_BAD_REQUEST")}
        else{res.send("200_OK")}
    })
})




let port = process.env.PORT;
if(port=="" || port==null){port=8080}
app.listen(port,()=>{
    console.log('server has been started');
})