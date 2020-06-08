import React from "react";
import { withRouter, NavLink } from "react-router-dom";
import { FirebaseContext } from "../firebase";

function Header() {
  const { user, firebase } = React.useContext(FirebaseContext);
  const item = window.location.pathname.includes("subcreate");

  return (
    <div className="header">
      <div className="flex__row padding-header">
        {/*     <NavLink to="/" className="menu__item-link header-margin">
          Explorations
        </NavLink> */}

        <NavLink to="/" className="frame__demos header-margin">
          new
        </NavLink>

        <NavLink to="/top" className="frame__demos header-margin">
          top
        </NavLink>

        <NavLink to="/categories" className="frame__demos header-margin">
          categories
        </NavLink>
        {item && (
          <>
            {/* 
            <NavLink to="/create" className="frame__demo header-margin">
              submit
            </NavLink> 

            <NavLink to="/subcreate" className="frame__demo header-margin">
              create
            </NavLink>*/}
          </>
        )}
      </div>
      <div className="flex__row padding-header">
        {user ? (
          <>
            <NavLink to="/search" className="frame__demos header-margin">
              <i className="las la-search"></i>
            </NavLink>
            <div className="frame__demos header-margin">{user.displayName}</div>

            <div className="frame__demos" onClick={() => firebase.logout()}>
              logout
            </div>
          </>
        ) : (
          <NavLink to="/login" className="frame__demos header-margin">
            login
          </NavLink>
        )}
      </div>
    </div>
  );
}

export default withRouter(Header);
