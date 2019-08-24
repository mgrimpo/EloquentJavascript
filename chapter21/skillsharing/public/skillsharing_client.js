function handleAction(state, action) {
  if (action.type == "setUser") {
    localStorage.setItem("userName", action.user);
    return Object.assign({}, state, {user: action.user});
  } else if (action.type == "setTalks") {
    return Object.assign({}, state, {talks: action.talks});
  } else if (action.type == "newTalk") {
    fetchOK(talkURL(action.title), {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        presenter: state.user,
        summary: action.summary
      })
    }).catch(reportError);
  } else if (action.type == "deleteTalk") {
    fetchOK(talkURL(action.talk), {method: "DELETE"})
      .catch(reportError);
  } else if (action.type == "newComment") {
    fetchOK(talkURL(action.talk) + "/comments", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        author: state.user,
        message: action.message
      })
    }).catch(reportError);
  }
  return state;
}

function fetchOK(url, options) {
  urlWithSlash = url.startsWith("/") ? url  : "/" + url ;
  return fetch(`http://localhost:8000${urlWithSlash}`, options).then(response => {
    if (response.status < 400) return response;
    else throw new Error(response.statusText);
  });
}

function talkURL(title) {
  return "talks/" + encodeURIComponent(title);
}

function reportError(error) {
  alert(String(error));
}

function renderUserField(name, dispatch) {
  return elt("label", {}, "Your name: ", elt("input", {
    type: "text",
    value: name,
    onchange(event) {
      dispatch({type: "setUser", user: event.target.value});
    }
  }));
}

function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) Object.assign(dom, props);
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}
class TalkComponent {
  constructor(talk, dispatch) {
    this.talk = talk;
    this.dispatch = dispatch;
    this.commentsComponent = new CommentsComponent(talk.comments, dispatch);
    this.dom = this.renderTalk(this.talk);
  }
  renderTalk(talk) {
    let dispatch = this.dispatch; // Use closure instead of instance variable, because Javascript.
    return elt(
        "section", {className: "talk"},
        elt("h2", null, talk.title, " ", elt("button", {
          type: "button",
          onclick() {
            dispatch({type: "deleteTalk", talk: talk.title});
          }
        }, "Delete")),
        elt("div", null, "by ",
            elt("strong", null, talk.presenter)),
        elt("p", null, talk.summary),
        this.commentsComponent.dom,
        elt("form", {
              onsubmit(event) {
                event.preventDefault();
                let form = event.target;
                dispatch({
                  type: "newComment",
                  talk: talk.title,
                  message: form.elements.comment.value
                })
                form.reset();
              }
            }, elt("input", {type: "text", name: "comment"}), " ",
            elt("button", {type: "submit"}, "Add comment")));
  }

  syncState(talk) {
    if (this.talk !== talk) {
      this.commentsComponent.syncState(talk.comments);
      //FIXME: other parts of the dom besides the comments need to be updated
      this.talk = talk;
    }
  }
}

class CommentsComponent {
  constructor(comments, dispatch) {
    this.dispatch = dispatch;
    this.dom = this.renderComments(comments);
  }

  syncState(comments) {
    this.dom.innerHTML = "";
    comments.map(renderComment).forEach(node => this.dom.appendChild(node));
  }

  renderComments(comments) {
    let dispatch = this.dispatch;
    return elt("div", null,
        ...comments.map(renderComment),
    )
  }

}

function renderComment(comment) {
  return elt("p", {className: "comment"},
             elt("strong", null, comment.author),
             ": ", comment.message);
}

function renderTalkForm(dispatch) {
  let title = elt("input", {type: "text"});
  let summary = elt("input", {type: "text"});
  return elt("form", {
    onsubmit(event) {
      event.preventDefault();
      dispatch({type: "newTalk",
                title: title.value,
                summary: summary.value});
      event.target.reset();
    }
  }, elt("h3", null, "Submit a Talk"),
     elt("label", null, "Title: ", title),
     elt("label", null, "Summary: ", summary),
     elt("button", {type: "submit"}, "Submit"));
}

async function pollTalks(update) {
  let tag = undefined;
  for (;;) {
    let response;
    try {
      response = await fetchOK("/talks", {
        headers: tag && {"If-None-Match": tag,
                         "Prefer": "wait=90"}
      });
    } catch (e) {
      console.log("Request failed: " + e);
      await new Promise(resolve => setTimeout(resolve, 500));
      continue;
    }
    if (response.status == 304) continue;
    tag = response.headers.get("ETag");
    update(await response.json());
  }
}

var SkillShareApp = class SkillShareApp {
  constructor(state, dispatch) {
    this.dispatch = dispatch;
    this.talkDOM = elt("div", {className: "talks"});
    this.talkMap = new Map();
    this.dom = elt("div", null,
                   renderUserField(state.user, dispatch),
                   this.talkDOM,
                   renderTalkForm(dispatch));
    this.syncState(state);
  }

  syncState(state) {
    if (state.talks != this.talks) {
      this.removeDeletedTalks(state);
      for (let talk of state.talks) {
          if (this.talkMap.has(talk.title)){
            this.talkMap.get(talk.title).syncState(talk)
          }
          else {
            this.addTalk(talk);
          }
      }
      this.talks = state.talks;
    }
  }

  // Check whether some old talks are not present in the new state and remove them accordingly
  removeDeletedTalks(state) {
    for (let key of this.talkMap.keys()) {
      let currentTitles = state.talks.map(talk => talk.title);
      if (!(currentTitles.includes(key))) {
        this.deleteTalk(key);
      }
    }
  }

  deleteTalk(talkTitle){
    this.talkDOM.removeChild(this.talkMap.get(talkTitle).dom);
    this.talkMap.delete(talkTitle);
  }
  addTalk(talk){
    let talkComponent = new TalkComponent(talk, this.dispatch);
    this.talkDOM.appendChild(talkComponent.dom);
    this.talkMap.set(talk.title, talkComponent);
  }
}

function runApp() {
  let user = localStorage.getItem("userName") || "Anon";
  let state, app;
  function dispatch(action) {
    state = handleAction(state, action);
    app.syncState(state);
  }

  pollTalks(talks => {
    if (!app) {
      state = {user, talks};
      app = new SkillShareApp(state, dispatch);
      document.body.appendChild(app.dom);
    } else {
      dispatch({type: "setTalks", talks});
    }
  }).catch(reportError);
}

runApp();
