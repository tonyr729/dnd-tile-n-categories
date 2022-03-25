import React from 'react';
import ReactDOM from 'react-dom';
import { runWithAdal } from 'react-adal';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { authContext } from './adalConfig';

const DO_NOT_LOGIN = true;

runWithAdal(
  authContext,
  () => {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root'),
    );
  },
  DO_NOT_LOGIN,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
