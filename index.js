const express = require("express");
const cors = require("cors");

const app = express();
const connectMongoose = require("./model/db.model");
const User = require("./Schema/User.schema");

require("dotenv").config();
app.use(cors());
app.use(express.json());

connectMongoose();

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email, password });

    if (user) {
      return res.json({
        success: true,
        message: "Logged in successfully",
      });
    } 
    else {
      return res.json({
        success: false,
        message: "Validation Error",
      });
    }

  } catch (error) {
    return res.json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.json({
        success: false,
        message: "Email already exists !",
      });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    return res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
});

app.get("/", (req,res) => {
  res.json({
    message:"Your server is up in running"
  })
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running at PORT: ${PORT}`);
});
