import React from "react";
import LinkItem from "./LinkItem";
import FirebaseContext from "../../firebase/context";
import { LINKS_PER_PAGE } from "../../utils/index";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";

function Subreddit(props) {
  const { firebase } = React.useContext(FirebaseContext);
  const [links, setLinks] = React.useState([]);
  const [cats, setCats] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const isUserPage = props.location.pathname.includes("category");
  const userId = props.match.params.catname;
  const linksRef = firebase.db.collection("links");
  const categoryRef = firebase.db.collection("category");
  const page = 1;

  React.useEffect(() => {
    getCatInfo();
    const unsubscribe = getLinks();
    return () => unsubscribe();
  }, [isUserPage, page]);
  function getCatInfo() {
    return categoryRef
      .where("name", "==", userId)
      .limit(LINKS_PER_PAGE)
      .onSnapshot(handleCatshot);
  }
  function getLinks() {
    const hasCursor = Boolean(cursor);
    setLoading(true);
    if (isUserPage) {
      return linksRef
        .where("category", "==", userId)
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else if (page === 1) {
      return linksRef
        .where("category", "==", userId)
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else if (hasCursor) {
      return linksRef
        .where("category", "==", userId)
        .startAfter(cursor.created)
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else {
      const offset = page * LINKS_PER_PAGE - LINKS_PER_PAGE;
      axios
        .get(
          `https://us-central1-hooks-news-app-1a459.cloudfunctions.net/linksPagination?offset=${offset}`
        )
        .then(response => {
          const links = response.data;
          const lastLink = links[links.length - 1];
          setLinks(links);
          setCursor(lastLink);
          setLoading(false);
        });
      return () => {};
    }
  }

  function handleSnapshot(snapshot) {
    const links = snapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });
    const lastLink = links[links.length - 1];
    setLinks(links);
    setCursor(lastLink);
    setLoading(false);
  }

  function handleCatshot(snapshot) {
    const links = snapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });
    setCats(links[0]);
  }

  function visitPreviousPage() {
    if (page > 1) {
      props.history.push(`/new/${page - 1}`);
    }
  }

  function visitNextPage() {
    if (page <= links.length / LINKS_PER_PAGE) {
      props.history.push(`/new/${page + 1}`);
    }
  }

  function addFollowButton() {
    const categoryRef = firebase.db.collection("category").doc(userId);

    categoryRef.get().then(doc => {
      if (doc.exists) {
        const prevNum = doc.data().subscribers;
        let newNum = prevNum + 1;

        firebase.db
          .collection("category")
          .doc(userId)
          .set(
            {
              subscribers: newNum
            },
            { merge: true }
          );
        console.log(doc.data().subscribers);
      }
    });
  }

  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE + 1 : 0;

  return (
    <div style={{ opacity: loading ? 0.25 : 1 }}>
      <div className="flex__column flex__column__border mtother">
        <div className="menu__item-link">{cats.name}</div>
        <div className="menu__item-link smaller">{cats.desc}</div>

        <div className="flex__row">
          <Link
            to={`/create/${userId}`}
            className="follow__button  header-margin"
          >
            Create new post
          </Link>{" "}
          <button
            className="follow__button header-margin"
            onClick={addFollowButton}
          >
            Follow
          </button>
          <div className="subreddit__subscribers header-margin">
            {cats.subscribers} People following stories
          </div>
          <div className="subreddit__subscribers header-margin">
            {cats.numPosts} Posts
          </div>
        </div>
      </div>
      {links.map((link, index) => (
        <LinkItem
          key={link.id}
          showCount={true}
          link={link}
          index={index + pageIndex}
        />
      ))}

      {isUserPage && (
        <div className="pagination mt2">
          <div className="pointer mr2" onClick={visitPreviousPage}>
            Previous
          </div>
          <div className="pointer" onClick={visitNextPage}>
            Next
          </div>
        </div>
      )}
    </div>
  );
}

export default Subreddit;
