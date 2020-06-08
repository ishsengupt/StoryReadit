import React from "react";
import FirebaseContext from "../../firebase/context";
import LinkItem from "./LinkItem";
import CommentsContainer from "./CommentsContainer";

function LinkDetail(props) {
  const { firebase, user } = React.useContext(FirebaseContext);
  const [link, setLink] = React.useState(null);
  const [commentText, setCommentText] = React.useState("");
  const [highlight, setHighlight] = React.useState(1);
  const linkId = props.match.params.linkId;
  const [error, setError] = React.useState("");
  const linkRef = firebase.db.collection("links").doc(linkId);

  React.useEffect(() => {
    getLink();
  }, []);

  function getLink() {
    linkRef.get().then(doc => {
      setLink({ ...doc.data(), id: doc.id });
    });
  }

  function handleAddComment() {
    if (!user) {
      props.history.push("/login");
    } else {
      if (commentText.split(" ").length > 100) {
        console.log("wrong");
        setError("Response must be less than a 100 words");
        return;
      } else {
        linkRef.get().then(doc => {
          if (doc.exists) {
            const idest = Date.now() - 1;
            const previousComments = doc.data().comments;
            const comment = {
              postedBy: { id: user.uid, name: user.displayName },
              created: Date.now(),
              text: commentText,
              parentId: null,
              id: idest,
              voteCount: 0,
              votes: [],
              linkId: linkId
            };
            const updatedComments = [...previousComments, comment];
            linkRef.update({ comments: updatedComments });
            linkRef.set({ [`str${idest}`]: 0 }, { merge: true });
            linkRef.set({ [`${idest}`]: 0 }, { merge: true });
            setLink(prevState => ({
              ...prevState,
              comments: updatedComments
            }));
            setCommentText("");
          }
        });
      }
    }
  }

  function handleNestedComment(replyText, parentId) {
    console.log("clicked");
    if (!user) {
      props.history.push("/login");
    } else {
      if (commentText.split(" ").length > 100) {
        setError("Response must be less than a 100 words");
        console.log("wrong");
        return;
      } else {
        linkRef.get().then(doc => {
          if (doc.exists) {
            const idest = Date.now() - 1;
            const previousComments = doc.data().comments;
            const comment = {
              postedBy: { id: user.uid, name: user.displayName },
              created: Date.now(),
              text: replyText,
              parentId: parentId,
              id: idest,
              voteCount: 0,
              votes: [],
              linkId: linkId
            };
            const updatedComments = [...previousComments, comment];
            linkRef.update({ comments: updatedComments });
            linkRef.set({ [`str${idest}`]: 0 }, { merge: true });
            linkRef.set({ [`${idest}`]: 0 }, { merge: true });
            setLink(prevState => ({
              ...prevState,
              comments: updatedComments
            }));
            setCommentText("");
          }
        });
      }
    }
  }

  function highlightComments(arr) {
    const newarr = arr.split(" ");
    //const linkRef = firebase.db.collection("links").doc(linkId);
    linkRef.get().then(doc => {
      if (doc.exists) {
        doc.data().comments.map(link => {
          var saveVal = doc.data()[link.id] * -1;
          linkRef.update({ [`${link.id}`]: 0 });
          var newVal = doc.data().switchVal + 1;
          linkRef.update({ switchVal: newVal });
          setHighlight(newVal);
        });
        newarr.map(linkid => {
          var saveVal = doc.data()[linkid] * -1;
          var newVal = doc.data().switchVal + 1;
          linkRef.update({ switchVal: newVal });
          linkRef.update({ [`${linkid}`]: 1 });

          setHighlight(newVal);
        });
        /*  const voteId = props.comment.id;
          let votestr = voteId;
          const previousVotes = doc.data()[votestr];
          setCount(previousVotes); */
      }
    });
  }

  return !link ? (
    <div>Loading...</div>
  ) : (
    <div className="mtother">
      <LinkItem showCount={false} link={link} />
      <div className="flex__column text-areas">
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
            <i className="las la-bookmark header-margin "></i>
            <i className="las la-exclamation-circle header-margin"></i>
            <i className="las la-share header-margin"></i>
            <div className="blue-text">Markdown mode</div>
          </div>

          <button className="grey-button" onClick={handleAddComment}>
            COMMENT
          </button>
        </div>
        <div style={{ color: "red" }}>{error}</div>
      </div>
      <CommentsContainer
        rootId={null}
        comments={link.comments}
        handleNestedComment={handleNestedComment}
        highlightComments={highlightComments}
        highlight={highlight}
      />
    </div>
  );
}

export default LinkDetail;
