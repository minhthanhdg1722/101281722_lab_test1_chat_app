const express = require("express")
const userModel = require("../models/User.js")
const app = express()

app.post('/login', async(req, res) => {
    const errors = validateResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
        
    }
    const { email, password } = req.body;


    try {
        let user = await userModel.findOne({
          email
        });
        if (!user)
          return res.status(400).json({
            message: "User Not Exist"
          });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({
            message: "Incorrect Password !"
          });
  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token
            });
          }
        );
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });
      }
})