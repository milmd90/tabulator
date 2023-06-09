import React from 'react';
import Login from './Login';

function Header(props: {
  title: String
}) {
  return (
    <div id="header">
      <h1>
        {props.title}
      </h1>
      <Login />
    </div>
  );
}

export default Header;
