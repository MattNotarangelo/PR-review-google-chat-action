import core from "@actions/core";
import github from "@actions/github";
import fetch from "node-fetch";

async function post(webhookUrl, message) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(message),
  });

  const json = await response.json();
  console.log(json);
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

  let webhookUrl = core.getInput("webhook");
  webhookUrl += "&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD";

  const threadKey = github.context.payload.repository.name + github.context.payload.number;
  console.log(threadKey);

  if (github.context.eventName === "pull_request") {
    const context = github.context.payload.pull_request;
    const id = github.context.payload.pull_request.id;

    const message = {
      thread: {
        threadKey: threadKey,
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
    await post(webhookUrl, message);
  }

  if (github.context.eventName === "pull_request_review") {
    const tagger = {
      text: "<users/all>",
      thread: {
        threadKey: github.context.payload.repository.name + github.context.payload.number,
      },
    };

    await post(webhookUrl, tagger);
  }
} catch (error) {
  core.setFailed(error.message);
}
