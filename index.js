import core from "@actions/core";
import github from "@actions/github";
import fetch from "node-fetch";

try {
  // // `who-to-greet` input defined in action metadata file
  // const nameToGreet = core.getInput("who-to-greet");
  // console.log(`Hello ${nameToGreet}!`);
  // const time = new Date().toTimeString();
  // core.setOutput("time", time);

  // // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2);
  // console.log(`The event payload: ${payload}`);

  const webhookUrl = `https://chat.googleapis.com/v1/spaces/AAAAxoPtGWE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=ziZrr97U_aONdw3yrZKKE2bgMf7ZMjwFyoG83oo6liQ&messageId=${github.context.payload.}`;

  const message = {
    text: `blah blah blah ${github.context.payload.head_commit.author.username}`,
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(message),
  })
    .then((response) => {

      const payload = JSON.stringify(github.context.payload, undefined, 2)
      console.log(`Kevins event payload: ${payload}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log("Message sent successfully!");
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
} catch (error) {
  core.setFailed(error.message);
}
