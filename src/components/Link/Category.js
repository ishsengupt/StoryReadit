import React from "react";
import FirebaseContext from "../../firebase/context";
import { Link, withRouter } from "react-router-dom";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import { LINKS_PER_PAGE } from "../../utils/index";
import axios from "axios";

function LinkList(props) {
  const { firebase } = React.useContext(FirebaseContext);
  const [links, setLinks] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const isNewPage = props.location.pathname.includes("new");
  const isCategoryPage = props.location.pathname.includes("categories");
  const page = Number(props.match.params.page);
  const linksRef = firebase.db.collection("category");
  const numRef = firebase.db.collection("links");

  React.useEffect(() => {
    const unsubscribe = getLinks();
    return () => unsubscribe();
  }, [isCategoryPage, page]);

  function getLinks() {
    const hasCursor = Boolean(cursor);
    setLoading(true);
    if (isCategoryPage) {
      return linksRef
        .orderBy("created", "desc")
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else if (page === 1) {
      return linksRef
        .orderBy("created", "desc")
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else if (hasCursor) {
      return linksRef
        .orderBy("created", "desc")
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

  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE + 1 : 0;

  return (
    <div style={{ opacity: loading ? 0.25 : 1 }}>
      {links.map((link, index) => (
        <div className="flex__row__start items-start mt2">
          <div className="flex__items__left">
            <div className="ml1 header-margin">
              <div className="subreddit-padding font__small flex__column">
                <Link
                  to={`/category/${link.name}`}
                  className="no-underline subreddit-padding"
                >
                  {link.name}
                </Link>{" "}
                Created {distanceInWordsToNow(link.created)} ago
              </div>
              <div className="">
                <a href={link.url} className="item__title"></a>{" "}
              </div>
              <div className="item__desc">
                <div className="subreddit-padding">
                  <div className="subreddit-padding">{link.numPosts} Posts</div>
                  <div className="subreddit-padding">
                    {link.subscibers} Followers
                  </div>
                </div>
              </div>
              <div className="f6"></div>
            </div>
          </div>
          <div className="flex__item__right"></div>
        </div>
      ))}
      {isNewPage && (
        <div className="pagination">
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

export default LinkList;
