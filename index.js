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

  const webhookUrl = "https://chat.googleapis.com/v1/spaces/AAAAxoPtGWE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=ziZrr97U_aONdw3yrZKKE2bgMf7ZMjwFyoG83oo6liQ&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD";

  console.log(github.context.eventName);
  console.log(github.context.payload);

  if (github.context.eventName === "pull_request") {
    const context = github.context.payload.pull_request;

    const message = {
      cardsV2: [
        {
          cardId: "unique-card-id",
          card: {
            header: {
              title: "New PR to review",
              subtitle: "@" + context.user.login,
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
                      text: context.title,
                    },
                  },
                  {
                    decoratedText: {
                      icon: {
                        iconUrl: "https://cdn0.iconfinder.com/data/icons/octicons/1024/repo-512.png",
                      },
                      text: github.context.payload.repository.name,
                    },
                  },
                  {
                    decoratedText: {
                      icon: {
                        iconUrl: "https://cdn0.iconfinder.com/data/icons/octicons/1024/repo-forked-512.png",
                      },
                      text: context.head.ref,
                    },
                  },
                  {
                    buttonList: {
                      buttons: [
                        {
                          text: "View on Github",
                          onClick: {
                            openLink: {
                              url: context.html_url,
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
      body: JSON.stringify({
        text: message,
        thread: {
          threadKey: github.context.pull_request["_links"].html.href
      }
      }),
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
  }

  if (github.context.eventName === "pull_request_review") {
    console.log("PR request sending")
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        text: "Approved",
        thread: {
          threadKey: github.context.pull_request["_links"].html.href
      }
      }),
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
  }
} catch (error) {
  core.setFailed(error.message);
}
