const express = require("express");
const mongoose = require("mongoose");
const bodyPaser = require("body-parser");
const amqp = require("amqplib");

const app = express();
const port = 3001;

app.use(bodyPaser.json());

mongoose;
mongoose
  .connect("mongodb://mongo:27017/tasks")

  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDb connection error", err));

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", TaskSchema);

let channel, connection;
async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries) {
    try {
      connection = await amqp.connect("amqp://rabbitmq");
      channel = await connection.createChannel();

      await channel.assertQueue("task_created");
      console.log("connected to rabbitmq");
      break; // exit loop on success
    } catch (error) {
      console.log("error on rabbit connection", error);
      retries--;
      console.log("Retries", retries);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.status(200).json(tasks);
});
app.post("/tasks", async (req, res) => {
  const { title, description, userId } = req.body;
  try {
    const tasks = new Task({ title, description, userId });
    await tasks.save();
    const message = { taskId: tasks._id, userId, title };
    if (!channel) {
      return res.status(503).json({ error: "Rabbit MQ error" });
    }
    channel.sendToQueue("task_created", Buffer.from(JSON.stringify(message)));
    res.status(201).json({ tasks });
  } catch (err) {
    console.error("Error while saving", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Task app listening on port ${port}`);
  connectRabbitMQWithRetry();
});
