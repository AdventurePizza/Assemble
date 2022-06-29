// @ts-nocheck
import "./App.css";
import React, { useEffect, useState } from "react";

//ui
import { Button, IconButton, Card } from "@material-ui/core";

//logic

//import _ from "underscore";
//import { FirebaseContext } from "./firebaseContext";
import { Profile } from './components/profile';
import { useNavigate } from "react-router-dom";
import { ProfileList } from "./components/ProfileList";

import discord from "./assets/discord-192.png";
import fa2MultiAsset from "./components/assets/MultiAsset.json";
import useBeacon from "./components/useBeacon";

import { Cinema } from './components/Cinema';


function App() {
  const navigate = useNavigate();
  const [address, setAddress] = useState();
  const [showList, setShowList] = useState(false);
  const { pkh, Tezos, sync, unsync, isConnected } = useBeacon();

  const deployContract = async (input) => {
    //console.log("deploy contract")
    console.log(input)

    await Tezos.wallet
      .originate({
        code: fa2MultiAsset,
        storage: input,
      })
      .send();

  }

  useEffect(() => {
    async function getAddress() {
      ////console.log(new URL(window.location.href).searchParams.get('profile'))
      let profileAddress = new URL(window.location.href).searchParams.get('profile');
      let list = new URL(window.location.href).pathname;
      ////console.log(list)
      //setAddress(profileAddress);
      if (list === "/directory") {
        setShowList(true);
      }
      else {
        if (!(profileAddress && profileAddress.includes(".tez"))) {
          setAddress(profileAddress);
        }
        else if (profileAddress) {

          await fetch('https://api.tezos.domains/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                {
                  domain(name: "` + profileAddress + `") {
                    name
                    address
                  }
                }
                `,
              variables: {
              },
            }
            ),
          })
            .then((res) => res.json())
            .then((result) => {
              ////console.log(result);
              if (result.data.domain) {
                setAddress(result.data.domain.address);
              }
            });
        }
      }
    }
    getAddress();
  }, [setAddress]);

  useEffect(() => {
    if (pkh && !address) {
      navigate("/?profile=" + pkh);
    }
  }, [pkh, address, navigate]);


  return (
    <div>{

      <div style={{ width: "100%" }}>
        <Cinema key="cinema" address={address ? address : pkh} type={"owned"} />
      </div>

    }



      {
        (address || pkh) && !showList &&
        <Profile
          key={pkh + address}
          address={address ? address : pkh}
          account={pkh}
          setAddress={setAddress}
          navigate={navigate}
          deployContract={deployContract}
        />
      }
      {
        !(address || pkh) && !showList &&
        <Profile
          key={"tz28VHDkPm9do7KyjARgW2nFFQ9DjfbaWR9x"}
          address={"tz28VHDkPm9do7KyjARgW2nFFQ9DjfbaWR9x"}
          account={pkh}
          setAddress={setAddress}
          navigate={navigate}
          deployContract={deployContract}
        />
      }
      {showList && <ProfileList />}
      <div
        className="top-right"
        style={{ position: "absolute", display: "flex", alignItems: "center" }}
      >
        {isConnected && (
          <Button
            size={"small"}
            title={"unsync"}
            onClick={() => {
              unsync();
            }}
          >
            <u>unsync</u>{" "}
          </Button>
        )}

        {isConnected && <div> | </div>}
        <Button
          title={"sync"}
          size={"small"}
          onClick={async () => {
            //console.log(1)
            sync().catch(console.log);
            //console.log(-1)

          }}
        >
          <u>{isConnected ? pkh.slice(0, 5) +
            "..." +
            pkh.slice(31, 36) : "sync"}</u>{" "}
        </Button>
      </div>

      <div
        className="bottom"
        style={{}}
      >
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "right" }}
        >
          <Card style={{ display: "flex", backgroundColor: "white" }}>
            <div

              style={{
                fontSize: "1.2em",
                display: "flex",
                alignItems: "center",
                margin: 6,
                fontFamily: "Neue-bold",
                color: "gray"
              }}
            >
              assemblr
            </div>
            <Button
              size={"small"}
              onClick={async () => {
                window.open("https://adventurenetworks.net/#/", "_blank");
              }}
              style={{
                fontFamily: "Neue-bold",
                color: "gray"
              }}
            >
              adventure networks{" "}
            </Button>
            <IconButton
              onClick={() => { window.open("https://discord.gg/eHemqMfFAV") }}
            >
              <img src={discord} alt="discord" width="20" height="20"></img>
            </IconButton>



          </Card>
        </div>
      </div>
    </div >
  );
}

export default App;
