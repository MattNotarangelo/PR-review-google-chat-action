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
}

function getChangesRequestedDetails() {
  return [
    {
      decoratedText: {
        icon: {
              iconUrl: "https://www.greatmanagers.com.au/wp-content/uploads/2018/03/talktohand_trans.png"
          },
        text: "There are changes requested"
      }
    }
  ]; 
}

function getChangesApprovedDetails() {
  return [
    {
      decoratedText: {
        icon: {
              iconUrl: "https://t4.ftcdn.net/jpg/03/23/71/91/360_F_323719173_LcDYRnQuNiaBrRmRzsY4u6JWjj4IjvRv.jpg"
          },
        text: "This PR has been approved!"
      }
    }
  ]; 
}

function getCommentsMadeDetails() {
  return [
    {
      decoratedText: {
        icon: {
              iconUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnhXOc5yM0M3h9Gujc1ecDjL-A7rSg5E-gghPXmZOaDkoWHNzwStavkrrVrc2Dack180k&usqp=CAU"
          },
        text: "There are new comments on your PR"
      }
    }
  ]; 
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

  const threadKey = github.context.payload.repository.name + github.context.ref;

  console.log(github);
  console.log(github.context.payload.review)
  
  if (github.context.eventName === "pull_request") {
    const context = github.context.payload.pull_request;

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
    let widget = getCommentsMadeDetails();
    switch(github.context.payload.review.state) {
      case "changes_requested":
        widget = getChangesRequestedDetails();
        break;
      case "approved":
        widget = getChangesApprovedDetails();
        break;
      default:
        break;
    }


    let tagger = {
      cardsV2: [
        {
          cardId: "unique-card-id",
          card: {
            sections: [
              {
                header: "Pull Request Details",
                collapsible: false,
                uncollapsibleWidgetsCount: 1,
                widgets: widget
              }
            ]
          }
        }
      ]
    }

    tagger = {
      ...tagger,
      thread: {
        threadKey: threadKey
      }
    };

    await post(webhookUrl, tagger);
  }
} catch (error) {
  core.setFailed(error.message);
}


