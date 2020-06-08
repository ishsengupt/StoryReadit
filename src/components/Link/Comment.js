import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Link, withRouter } from "react-router-dom";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import FirebaseContext from "../../firebase/context";

function Comment(props, highlight, index, showCount, history) {
  const [commentText, setCommentText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { firebase, user } = React.useContext(FirebaseContext);
  const otherRef = firebase.db.collection("links");
  const highlightCheck = props.highlight;
  const [cats, setCats] = React.useState([]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    //console.log(highlightCheck);
    const voteRef = firebase.db.collection("links").doc(props.comment.linkId);
    voteRef.get().then(doc => {
      if (doc.exists) {
        const voteId = props.comment.id;
        let votestr = `str${voteId}`;
        const previousVotes = doc.data()[votestr];
        setCount(previousVotes);
        setCats(doc.data()[props.comment.id]);
      }
    });
  }, [highlight]);

  function handleLoading() {
    setLoading(false);
  }

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) mounted.current = true;
    else {
      const voteRef = firebase.db.collection("links").doc(props.comment.linkId);
      voteRef.get().then(doc => {
        if (doc.exists) {
          setCats(doc.data()[props.comment.id]);
        }
      });
    }
  });

  function isolateComments() {
    const voteRef = firebase.db.collection("links").doc(props.comment.linkId);

    voteRef.get().then(doc => {
      if (doc.exists) {
        const test = factorial(
          props.comment.parentId,
          props.comment.id,
          doc.data().comments,
          doc.data().comments.length
        );
        //console.log(test);
        props.highlightComments(test);
      }
    });
  }

  function factorial(pid, id, doc, arrlength) {
    var newId;
    var oldId;

    if (pid == null) {
      return `${id}`;
    }

    for (var i = 0; i < arrlength; i++) {
      if (doc[i].created == pid) {
        newId = doc[i].parentId;
        oldId = doc[i].id;
        break;
      }
    }

    return `${id} ` + factorial(newId, oldId, doc, arrlength);
  }

  function handleVote() {
    if (!user) {
      history.push("/login");
    } else {
      const voteRef = firebase.db.collection("links").doc(props.comment.linkId);
      voteRef.get().then(doc => {
        if (doc.exists) {
          const voteId = props.comment.id;
          let votestr = `str${voteId}`;
          const previousVotes = doc.data()[votestr];
          const newVote = previousVotes + 1;
          setCount(newVote);
          voteRef.update({ [`${votestr}`]: newVote });
        }
      });
    }
  }

  return (
    <>
      {cats == 1 ? (
        <div
          className="panel panel-default flex__start comment-margin"
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            left: 0,
            border: "1px solid #343536",
            borderRadius: "3px",
            transform: `translateX(-10px)`,
            paddingBottom: "15px"
          }}
        >
          <div className="flex items-center">
            <div className="flex__column__center padding-items">
              <div className="vote-button" onClick={handleVote}>
                <i className="las la-arrow-up"></i>
              </div>
              <div className="vote-number">{count} </div>
              <div className="vote-button" onClick={handleVote}>
                <i className="las la-arrow-down"></i>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <p className="comment-author font__small">
              <Link
                to={`/user/${props.comment.postedBy.name}`}
                className="no-underlines"
              >
                {props.comment.postedBy.name}
              </Link>{" "}
              {distanceInWordsToNow(props.comment.id)}
            </p>
            <p className="item__desc">{props.comment.text}</p>
            {loading && (
              <>
                <div className="flex__column text-areas ">
                  <textarea
                    className="link__area"
                    onChange={event => setCommentText(event.target.value)}
                    value={commentText}
                    placeholder="Reply with your story..."
                    rows="6"
                    cols="60"
                  />

                  <div className="bottom__flex__container">
                    <div className="flex__row border-right">
                      <i class="las la-bookmark header-margin "></i>
                      <i class="las la-exclamation-circle header-margin"></i>
                      <i
                        class="las la-share header-margin"
                        onClick={handleLoading}
                      ></i>
                      <div className="blue-text">Markdown mode</div>
                    </div>

                    <button
                      className="grey-button"
                      onClick={() => {
                        props.handleNestedComment(
                          commentText,
                          props.comment.created
                        );
                        setLoading(false);
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </>
            )}
            <div>
              {!loading && (
                <div className="flex__row__starts">
                  <button
                    className="message-button"
                    onClick={() => isolateComments()}
                  >
                    Focus
                  </button>
                  <button
                    className="message-button"
                    onClick={() => setLoading(true)}
                  >
                    Save
                  </button>
                  <button
                    className="message-button"
                    onClick={() => setLoading(true)}
                  >
                    <i className="lar la-comment-alt"></i>
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel panel-default flex__start comment-margin">
          <div className="flex items-center">
            <div className="flex__column__center padding-items">
              <div className="vote-button" onClick={handleVote}>
                <i className="las la-arrow-up"></i>
              </div>
              <div className="vote-number">{count} </div>
              <div className="vote-button" onClick={handleVote}>
                <i className="las la-arrow-down"></i>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <p className="comment-author font__small">
              <Link
                to={`/user/${props.comment.postedBy.name}`}
                className="no-underlines"
              >
                {props.comment.postedBy.name}
              </Link>{" "}
              {distanceInWordsToNow(props.comment.id)}
            </p>
            <p className="item__desc">{props.comment.text}</p>
            {loading && (
              <>
                <div className="flex__column text-areas ">
                  <textarea
                    className="link__area"
                    onChange={event => setCommentText(event.target.value)}
                    value={commentText}
                    placeholder="Reply with your story..."
                    rows="6"
                    cols="60"
                  />

                  <div className="bottom__flex__container">
                    <div className="flex__row border-right">
                      <i class="las la-bookmark header-margin "></i>
                      <i class="las la-exclamation-circle header-margin"></i>
                      <i
                        class="las la-share header-margin"
                        onClick={handleLoading}
                      ></i>
                      <div className="blue-text">Markdown mode</div>
                    </div>

                    <button
                      className="grey-button"
                      onClick={() => {
                        props.handleNestedComment(
                          commentText,
                          props.comment.created
                        );
                        setLoading(false);
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </>
            )}
            <div>
              {!loading && (
                <div className="flex__row__starts">
                  <button
                    className="message-button"
                    onClick={() => isolateComments()}
                  >
                    Focus
                  </button>
                  <button
                    className="message-button"
                    onClick={() => setLoading(true)}
                  >
                    Save
                  </button>
                  <button
                    className="message-button"
                    onClick={() => setLoading(true)}
                  >
                    <i className="lar la-comment-alt"></i>
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Comment;
