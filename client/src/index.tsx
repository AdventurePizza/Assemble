import "./index.css";

import App from "./App";

import React from "react";
import ReactDOM from "react-dom";
import { FirebaseProvider } from "./firebaseContext";
import { SnackbarProvider } from "notistack";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfileList } from "./components/ProfileList";
import { Upvote } from "./components/Upvote";
import { Analytics } from "./components/Analytics";
import { UseBeaconProvider } from "./components/useBeacon";
import { Tv } from './components/Tv';

/*

            <Route path="/tv" element={<Tv />}>
            </Route>
*/

ReactDOM.render(
  <BrowserRouter>
    <FirebaseProvider>
      <SnackbarProvider maxSnack={3}>
        <UseBeaconProvider>
          <Routes>
            <Route path="/Analytics" element={<Analytics />}>
            </Route>
            <Route path="/discovery" element={<Upvote />}>
            </Route>
            <Route path="/directory" element={<ProfileList />}>
            </Route>
            <Route path="/tv/created/:id" element={<Tv address={undefined} type="created" />}>
            </Route>
            <Route path="/tv/owned/:id" element={<Tv address={undefined} type="owned" />}>
            </Route>
            <Route path='/' element={<App />}>
            </Route>

          </Routes>
        </UseBeaconProvider>
      </SnackbarProvider>
    </FirebaseProvider>
  </BrowserRouter>,
  document.getElementById("root")
);


