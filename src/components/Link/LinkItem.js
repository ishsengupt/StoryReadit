import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";

import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import FirebaseContext from "../../firebase/context";

function LinkItem({ link, index, showCount, history }) {
  const { firebase, user } = React.useContext(FirebaseContext);

  function handleVote() {
    if (!user) {
      history.push("/login");
    } else {
      const voteRef = firebase.db.collection("links").doc(link.id);
      voteRef.get().then(doc => {
        if (doc.exists) {
          const previousVotes = doc.data().votes;
          const vote = { votedBy: { id: user.uid, name: user.displayName } };
          const updatedVotes = [...previousVotes, vote];
          const voteCount = updatedVotes.length;
          voteRef.update({ votes: updatedVotes, voteCount });
        }
      });
    }
  }

  function handleDeleteLink() {
    const linkRef = firebase.db.collection("links").doc(link.id);
    const categoryRef = firebase.db.collection("category").doc(link.category);
    console.log(categoryRef);
    categoryRef.get().then(doc => {
      if (doc.exists) {
        const prevNum = doc.data().numPosts;
        let newNum = prevNum - 1;
        console.log(doc.data().numPosts);
        firebase.db
          .collection("category")
          .doc(link.category)
          .set(
            {
              numPosts: newNum
            },
            { merge: true }
          );
      }
    });
    linkRef
      .delete()
      .then(() => {
        console.log(`Document with ID ${link.id} deleted`);
      })
      .catch(err => {
        console.error("Error deleting document:", err);
      });
  }
  const postedByAuthUser = user && user.uid === link.userid;

  let isDetail;
  if (showCount) {
    isDetail = (
      <div className="flex__row__start items-start mt2">
        <div className="flex items-center">
          <div className="flex__column__center padding-items">
            <div className="vote-button" onClick={handleVote}>
              <i className="las la-arrow-up"></i>
            </div>
            <div className="vote-number">{link.voteCount}</div>
            <div className="vote-button" onClick={handleVote}>
              <i className="las la-arrow-down"></i>
            </div>
          </div>
        </div>
        <div className="flex__items__left">
          <div className="ml1 header-margin">
            <div className="subreddit-padding font__small">
              Posted by{" "}
              <Link to={`/user/${link.name}`} className="no-underlines">
                {link.name}
              </Link>{" "}
              to{" "}
              <Link to={`/category/${link.category}`} className="no-underlines">
                {link.category}{" "}
              </Link>{" "}
              {distanceInWordsToNow(link.created)} ago
            </div>
            <div className="subreddit-padding">
              <a href={link.title} className="item__title">
                {link.title}
              </a>{" "}
            </div>
            <div className="item__desc">
              <div className="subreddit-padding">
                {link.desc.substring(0, 40)}...
              </div>
            </div>
            <div className="f6">
              <Link
                to={`/link/${link.id}`}
                className="item__button header-margin"
              >
                {link.comments.length > 0
                  ? `${link.comments.length} comments`
                  : "read"}
              </Link>
              {postedByAuthUser && (
                <>
                  <span
                    className="delete-button item__button red"
                    onClick={handleDeleteLink}
                  >
                    delete
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex__item__right">
          <div className="thumbnail">
            <img className="portrait" src={link.img} />
          </div>
        </div>
      </div>
    );
  } else {
    isDetail = (
      <div className="flex__row__start items-start mtother__nomargin">
        <div className="flex__items__left">
          <div className="flex items-center">
            <div className="flex__column__center padding-items">
              <div className="vote-button" onClick={handleVote}>
                <i className="las la-arrow-up"></i>
              </div>
              <div className="vote-number">{link.voteCount}</div>
              <div className="vote-button" onClick={handleVote}>
                <i className="las la-arrow-down"></i>
              </div>
            </div>
          </div>
          <div className="ml1 header-margin">
            <div className="subreddit-padding font__small">
              Posted by{" "}
              <Link to={`/user/${link.name}`} className="no-underlines">
                {link.name}
              </Link>{" "}
              to{" "}
              <Link to={`/category/${link.category}`} className="no-underlines">
                {link.category}{" "}
              </Link>{" "}
              {distanceInWordsToNow(link.created)} ago
            </div>
            <div className="subreddit-padding">
              <a href={link.title} className="item__title">
                {link.title}
              </a>{" "}
            </div>
            <div className="item__desc">
              <div className="subreddit-padding">{link.desc}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{isDetail}</>;
}

export default withRouter(LinkItem);
