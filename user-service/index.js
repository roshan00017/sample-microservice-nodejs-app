const express = require("express");
const mongoose = require("mongoose");
const bodyPaser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyPaser.json());

mongoose;
mongoose
  .connect("mongodb://mongo:27017/users")

  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDb connection error", err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", UserSchema);

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error("Error while saving", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`User app listening on port ${port}`);
});
