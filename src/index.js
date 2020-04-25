import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.css'

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBZyBMSm_t9BC0d0fdToOKsa7Sekdkbez0",
  authDomain: "uflow-4a90b.firebaseapp.com",
  databaseURL: "https://uflow-4a90b.firebaseio.com",
  projectId: "uflow-4a90b",
  storageBucket: "uflow-4a90b.appspot.com",
  messagingSenderId: "164689309297",
  appId: "1:164689309297:web:7f13f982b1296f57fbb5d0",
  measurementId: "G-RM1T9SWJD8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Rendering App
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
