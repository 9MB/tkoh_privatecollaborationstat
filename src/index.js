import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyBpo4MGH1emf6vE6WNy6lCRIQsSmitDVgA",
  authDomain: "tkoh-private-collaboration.firebaseapp.com",
  projectId: "tkoh-private-collaboration",
  storageBucket: "tkoh-private-collaboration.appspot.com",
  messagingSenderId: "490138318587",
  appId: "1:490138318587:web:0a5ee32f5967390f41e25e",
  measurementId: "G-525SGHJ1SH"

};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore();



ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
