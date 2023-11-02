import core from "@actions/core";
import github from "@actions/github";
import fetch from "node-fetch";

function post(webhookUrl, message) {
  console.log(webhookUrl+"&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD");
  fetch(webhookUrl+"&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD",{
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
}

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

  if (github.context.eventName === "pull_request") {
    const context = github.context.payload.pull_request;
    const id = github.context.payload.pull_request.id;

    const message = {
      thread: {
        theadKey: id
      },
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
    post(webhookUrl, message);
    
    const tagger = {
      "text": "<users/all>",
      thread: {
        theadKey: id
      },
    }
    post(webhookUrl, tagger);
  }
} catch (error) {
  core.setFailed(error.message);
}
