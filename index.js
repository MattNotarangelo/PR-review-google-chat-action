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

  const webhookUrl = core.getInput("webhook");

  console.log(github.context.eventName);
  console.log(github.context.payload);

  if (github.context.eventName !== "pull_request") {
    console.log("received" + github.context.eventName);
    return;
  }

  const message = {
    cardsV2: [
      {
        cardId: "unique-card-id",
        card: {
          header: {
            title: "New PR to review",
            subtitle: "@" + payload.context.payload.owner.login,
            imageUrl: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
            imageType: "CIRCLE",
            imageAltText: "Avatar",
          },
          sections: [
            {
              header: "Pull Request Details",
              collapsible: false,
              uncollapsibleWidgetsCount: 1,
              widgets: [
                {
                  decoratedText: {
                    startIcon: {
                      knownIcon: "DESCRIPTION",
                    },
                    text: github.context.payload.title,
                  },
                },
                {
                  decoratedText: {
                    icon: {
                      iconUrl: "https://cdn0.iconfinder.com/data/icons/octicons/1024/repo-512.png",
                    },
                    text: github.context.payload.repository,
                  },
                },
                {
                  decoratedText: {
                    icon: {
                      iconUrl: "https://cdn0.iconfinder.com/data/icons/octicons/1024/repo-forked-512.png",
                    },
                    text: github.context.payload.head.ref,
                  },
                },
                {
                  buttonList: {
                    buttons: [
                      {
                        text: "View on Github",
                        onClick: {
                          openLink: {
                            url: github.context.payload.url,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(message),
  })
    .then((response) => {
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
