import React from "react";
import FirebaseContext from "../../firebase/context";
import LinkItem from "./LinkItem";
import { LINKS_PER_PAGE } from "../../utils/index";
import axios from "axios";
import { Link, withRouter, NavLink } from "react-router-dom";

function LinkList(props) {
  const { firebase } = React.useContext(FirebaseContext);
  const [links, setLinks] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [cats, setCats] = React.useState([]);
  const [featured, setFeatured] = React.useState([]);
  const isNewPage = props.location.pathname.includes("new");
  const isTopPage = props.location.pathname.includes("top");
  const page = Number(props.match.params.page);
  const linksRef = firebase.db.collection("links");
  const categoryRef = firebase.db.collection("category");
  const featuredRef = firebase.db.collection("featured");

  React.useEffect(() => {
    getFeaturedInfo();
    getCatInfo();
    const unsubscribe = getLinks();
    return () => unsubscribe();
  }, [isTopPage, page]);

  function getCatInfo() {
    return categoryRef
      .orderBy("created", "desc")
      .limit(10)
      .onSnapshot(handleCatshot);
  }

  function getFeaturedInfo() {
    return featuredRef
      .orderBy("created", "desc")
      .limit(1)
      .onSnapshot(handleFeaturedshot);
  }
  function getLinks() {
    const hasCursor = Boolean(cursor);
    setLoading(true);
    if (isTopPage) {
      return linksRef
        .orderBy("voteCount", "desc")
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

  function handleCatshot(snapshot) {
    const links = snapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });

    setCats(links);
  }
  function handleFeaturedshot(snapshot) {
    const links = snapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });

    setFeatured(links);
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
    <div className="list__grid" style={{ opacity: loading ? 0.25 : 1 }}>
      <div className="main__items">
        {links.map((link, index) => (
          <LinkItem
            key={link.id}
            showCount={true}
            link={link}
            index={index + pageIndex}
          />
        ))}
        {isNewPage && (
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
      <div className="grid-columns">
        <div className="sidebar__items genremt">
          <div className="top__item">Today's Top Genres</div>
          {cats.map((cat, index) => (
            <div className="genre__items" key={index}>
              <i class="las la-arrow-up green-arrow"></i>
              <Link to={`/category/${cat.name}`} className="genre__name">
                {cat.name}{" "}
              </Link>{" "}
            </div>
          ))}
          <NavLink to="/categories" className="frame__demos button-skin ">
            VIEW ALL
          </NavLink>
        </div>
        <div className="sidebar__items genremt">
          <div className="top__item">Featured Work</div>
          {featured.map((cat, index) => (
            <div className="genre__column__items" key={index}>
              <div className="genre__name">{cat.title}</div>
              <div className="genre__row">
                <img src={cat.img} className="genre__img" />
                <div className="genre__desc">{cat.desc}</div>
              </div>
              <div className="genre__row">
                <div className="genre__desc uppercase-items">
                  Available at {cat.buyoptions[0]}
                </div>
                <div className="genre__desc"> Written by {cat.usertag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withRouter(LinkList);
