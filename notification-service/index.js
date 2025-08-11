const amqp = require("amqplib");

let connection, channel;
let retries = 5;
const delay = 3000;

async function start() {
  while (retries) {
    try {
      connection = await amqp.connect("amqp://rabbitmq");
      channel = await connection.createChannel();

      await channel.assertQueue("task_created");
      console.log("connected to notification, listening");

      channel.consume("task_created", (msg) => {
        const taskData = JSON.parse(msg.content.toString());
        console.log("Notification: New task:", taskData);
        channel.ack(msg);
      });

      break; // exit retry loop once connected
    } catch (error) {
      console.log("error on rabbit connection", error);
      retries--;
      console.log("Retries left:", retries);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  if (retries === 0) {
    console.error("Failed to connect to RabbitMQ, exiting...");
    process.exit(1);
  }
}

start();
