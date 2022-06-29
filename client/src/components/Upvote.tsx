// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react';
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { Card, Button, TextField, Avatar, IconButton, Checkbox } from "@material-ui/core";
import { FirebaseContext } from "../firebaseContext";
import { DAppClient } from "@airgap/beacon-sdk";
import arrowR from "../assets/arrow-r.png";
import arrowL from "../assets/arrow-l.png";
import arrowU from "../assets/arrow-u.png";
import arrowD from "../assets/arrow-d.png";
import dice from "../assets/dice.png";


const dAppClient = new DAppClient({ name: "Beacon Docs" });

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Neue-regular",
      "Neue-regular",
      "Neue-regular",
      "Neue-regular",
      "Neue-regular"
    ].join(",")
  }
});

export const Upvote = () => {
  const [actives, setActives] = useState();
  const [interests, setInterests] = useState();
  const { getAllProfiles, getActives, setUpvote, getUpvote, setDownvote } = useContext(FirebaseContext);
  const [input, setInput] = useState();
  const [currWallet, setCurrWallet] = useState("kansasdao.tez");
  const [currIndex, setCurrIndex] = useState(0);
  const [toggleActive, setToggleActive] = useState(true);
  const [currUpvote, setCurrUpvote] = useState(0);

  const [activeAccount, setActiveAccount] = useState();
  const [synced, setSynced] = useState("sync");
  const [showUnsync, setShowUnsync] = useState(false);

  const [objktChecked, setObjktChecked] = React.useState(true);
  const [fxChecked, setFxChecked] = React.useState(true);

  const handleObjktFilter = (event) => {
    setObjktChecked(event.target.checked);
  };

  const handlefxhashFilter = (event) => {
    setFxChecked(event.target.checked);
  };

  useEffect(() => {
    let filtered;

    async function grabActives() {

      let actives = await fetch("https://unstable-do-not-use-in-production-api.teztok.com/v1/graphql", {
        method: 'POST',
        body: JSON.stringify({
          query: `query LatestEvents {
      events(limit: 10, order_by: {opid: desc}, where: {type: {_eq: "OBJKT_FULFILL_ASK_V2"}}) {
        buyer_address
      }
    }
    `,
          variables: {},
          operationName: "LatestEvents",
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })

      var ress;
      try {
        ress = await actives.json();
        const wallets = (ress.data.events).map((el) => { return { address: el.buyer_address, type: "objkt" } });
        let filtered;
        console.log(wallets);
        let domainNames = [];
        if (!wallets) {
          return
        }
        await Promise.all(wallets.map(async (profile) => {
          if (profile && profile.address) {
            await fetch('https://api.tezos.domains/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `
          {
            reverseRecord(address: "`+ profile.address + `"){owner domain{name}}
          }
          `,
                variables: {
                },
              }
              ),
            })
              .then((res) => res.json())
              .then((result) => {
                if (result.data.reverseRecord && result.data.reverseRecord.domain) {
                  let domain = result.data.reverseRecord.domain.name;
                  domainNames.push({ address: domain, type: profile.type });
                } else {
                  domainNames.push(profile);
                }
              });
          }

        }))

        if (objktChecked && fxChecked) {
          filtered = domainNames;
        } else if (objktChecked) {
          filtered = domainNames.filter(profile => profile.type === "objkt");
        } else if (fxChecked) {
          filtered = domainNames.filter(profile => profile.type === "fxhash");
        } else if (fxChecked) {
          filtered = domainNames.filter(profile => profile.type === "cthulhu");
        }
        //console.log(filtered)

        setActives(filtered)
      } catch (error) {
        //console.log(error)
        return
      }


    }
    grabActives()



    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objktChecked, fxChecked]);

  useEffect(() => {
    async function getAcc() {
      setActiveAccount(await dAppClient.getActiveAccount());
      if (activeAccount) {
        setSynced(
          activeAccount.address.slice(0, 6) +
          "..." +
          activeAccount.address.slice(32, 36)
        );
        setShowUnsync(true);

      } else {
        setSynced("sync");
        setShowUnsync(false);
      }
    }
    getAcc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  async function unsync() {
    setActiveAccount(await dAppClient.getActiveAccount());
    if (activeAccount) {
      // User already has account connected, everything is ready
      dAppClient.clearActiveAccount().then(async () => {
        setActiveAccount(await dAppClient.getActiveAccount());
        setSynced("sync");
        setShowUnsync(false);
      });
    }
  }

  async function sync() {
    setActiveAccount(await dAppClient.getActiveAccount());
    //Already connected
    if (activeAccount) {
      setSynced(activeAccount.address);
      setShowUnsync(true);

      return activeAccount;
    }
    // The user is not synced yet
    else {
      try {
        console.log("Requesting permissions...");
        const permissions = await dAppClient.requestPermissions();
        setActiveAccount(await dAppClient.getActiveAccount());
        console.log("Got permissions:", permissions.address);
        setSynced(permissions.address);
        setShowUnsync(true);
        navigate("/?profile=" + permissions.address);
      } catch (error) {
        console.log("Got error:", error);
      }
    }
  }

  useEffect(() => {

    async function grabActives() {
      let activesRaw = await getActives();
      console.log(activesRaw);
      let domainNames = [];
      await Promise.all(activesRaw.map(async (profile) => {
        if (profile && profile.address) {
          await fetch('https://api.tezos.domains/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
            {
              reverseRecord(address: "`+ profile.address + `"){owner domain{name}}
            }
            `,
              variables: {
              },
            }
            ),
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.data.reverseRecord && result.data.reverseRecord.domain) {
                let domain = result.data.reverseRecord.domain.name;
                domainNames.push({ address: domain, type: profile.type });
              } else {
                domainNames.push(profile);
              }
            });
        }

      }))
      setActives(domainNames);
    }

    async function getProfiles() {
      let interestsRaw = await getAllProfiles();

      /*
      let domainNames = [];
      await Promise.all(interestsRaw.map(async ({ address, upvotes }) => {
        await fetch('https://api.tezos.domains/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
            {
              reverseRecord(address: "`+ address + `"){owner domain{name}}
            }
            `,
            variables: {
            },
          }
          ),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.data.reverseRecord && result.data.reverseRecord.domain) {
              let domain = result.data.reverseRecord.domain.name;
              domainNames.push({ address: domain, upvotes: upvotes });
            } else {
              domainNames.push({ address: address, upvotes: upvotes });
            }
          });
      }))


      setInterests(domainNames.sort((a, b) => { return b.upvotes - a.upvotes }));
      */
      setInterests(interestsRaw);
    }

    if (toggleActive) {
      grabActives();
    } else {
      getProfiles();
    }

  }, [toggleActive, getActives, getAllProfiles]);


  useEffect(() => {
    if (interests) {
      setInterests(interests.sort((a, b) => { return b.upvotes - a.upvotes }))
    }
  }, [interests]);

  useEffect(() => {
    async function grabUpvote() {
      let tzaddress;
      if (currWallet.includes(".tez")) {
        await fetch('https://api.tezos.domains/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
            {
              domain(name: "` + currWallet + `") {
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
            console.log(result);
            if (result.data.domain) {
              tzaddress = result.data.domain.address;
            }
          });
      } else {
        tzaddress = currWallet;
      }

      let res = (await getUpvote(tzaddress));

      setCurrUpvote(res.amount)
    }
    grabUpvote()
  }, [getUpvote, currWallet]);
  /*
  useEffect(() => {
    if (toggleActive) {
  
    }
  }, [toggleActive]);
  
    useEffect(() => {
      const interval = setInterval(async () => {
        if (toggleActive) {
          let res = await getActives();
          console.log(res);
          setActives(res);
        }
      }, 120000);
   
      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [toggleActive])
  */
  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      window.open(`https://assemblr.xyz/?profile=${input}`, "_blank")
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Card style={{ backgroundColor: "#F6F7F8", height: "100vh", overflow: "auto", fontFamily: "Neue-regular" }}>
        <Card
          className="top-right"
          style={{ position: "absolute", display: "flex", alignItems: "center", backgroundColor: "#E2E6E9" }}
        >
          {showUnsync && (
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

          {showUnsync && <div> | </div>}
          <Button
            title={"sync"}
            size={"small"}
            onClick={async () => {
              if (!showUnsync) {
                await sync();
              } else {
                navigate("/?profile=" + activeAccount.address);
                setAddress(activeAccount.address);
              }
            }}
          >
            <u>{synced}</u>{" "}
          </Button>
        </Card>

        <h1 style={{ textAlign: "center", fontSize: "3em", fontFamily: "Neue-regular" }}>DISCOVERY</h1>

        <div style={{ display: "flex", width: "99%", marginLeft: 10 }}>
          <div style={{ width: "30%" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                size={"large"}
                title={"active"}
                onClick={() => {
                  setToggleActive(true)
                }}
                style={{
                  backgroundColor: toggleActive ? "black" : "white", width: "100%", color: toggleActive ? "white" : "black"
                }}
              >
                Active
              </Button>
              <Button
                size={"large"}
                title={"active"}
                onClick={() => {
                  setToggleActive(false)
                }}
                style={{
                  backgroundColor: !toggleActive ? "black" : "white", width: "100%", color: !toggleActive ? "white" : "black"
                }}
              >
                Interesting
              </Button>
            </div>
            <div style={{ backgroundColor: "#D2D8DD", maxHeight: "80vh", overflowY: "scroll", border: "solid 1px black", overflowX: "hidden" }}>
              {!toggleActive && interests && interests.map((profile) => (
                profile &&
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button>{profile.upvotes}</Button>
                  <Avatar
                    alt="Profile Picture"
                    src={`https://assemblr.xyz/?profile=${profile.address}`}
                  />
                  <div style={{ textAlign: "center" }}>
                    <Button
                      size={"large"}
                      title={profile.address}
                      onClick={() => {
                        //window.open(`https://assemblr.xyz/?profile=${profile}`, "_blank")
                        setCurrWallet(profile.address)
                      }}
                      style={{ width: "100%", color: "black" }}
                    >
                      <u>{profile.address}</u>&nbsp;
                    </Button>
                  </div>
                </div>
              ))
              }
              {toggleActive &&
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: 40, fontFamily: "Neue-regular" }}>
                  <>
                    objkt.com
                    <Checkbox
                      onChange={handleObjktFilter}
                      defaultChecked />
                  </>
                  <>
                    fxhash
                    <Checkbox
                      onChange={handlefxhashFilter}
                      defaultChecked />
                  </>
                </div>
              }
              {toggleActive && actives && actives.map((profile) => (
                profile &&
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    alt="Profile Picture"
                    src={`https://services.tzkt.io/v1/avatars/${profile.address}`}
                  />
                  <div style={{ textAlign: "center" }}>
                    <Button
                      size={"large"}
                      title={profile.address}
                      onClick={() => {
                        //window.open(`https://assemblr.xyz/?profile=${profile}`, "_blank")
                        setCurrWallet(profile.address)
                      }}
                      style={{ width: "100%", color: "black" }}
                    >
                      <u>{profile.address}</u>&nbsp;
                    </Button>
                  </div>
                </div>
              ))
              }
            </div>
          </div>

          <Card style={{ backgroundColor: "#E2E6E9", width: "100%", padding: 20, height: "80vh", border: "solid 1px black", marginLeft: 10 }}>
            <div style={{ display: "flex", alignItems: "center" }}>

              <div style={{ display: "flex", justifyContent: "right", alignItems: "center", marginLeft: "auto" }}>
                <Button
                  onClick={async () => {
                    window.open(`https://assemblr.xyz/?profile=${currWallet}`, "_blank")
                  }}
                >
                  <u>{currWallet}</u>
                </Button>
                <b style={{ paddingRight: 10, fontSize: "2em" }} >{currUpvote}</b>
              </div>
            </div>
            <iframe title={"temp"} src={`https://assemblr.xyz/?profile=${currWallet}`} width={"100%"} height={"87%"}></iframe>


            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                <IconButton
                  onClick={async () => {
                    let tzaddress;
                    if (currWallet.includes(".tez")) {
                      await fetch('https://api.tezos.domains/graphql', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          query: `
                        {
                          domain(name: "` + currWallet + `") {
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
                          console.log(result);
                          if (result.data.domain) {
                            tzaddress = result.data.domain.address;
                          }
                        });
                    } else {
                      tzaddress = currWallet;
                    }
                    let res = await setDownvote(tzaddress);
                    if (res.isSuccessful) {
                      setCurrUpvote(currUpvote - 1)
                      let updated = [...interests];
                      let index = updated.findIndex(profile => profile.address === currWallet);
                      updated[index] = { address: updated[index].address, upvotes: updated[index].upvotes - 1 };
                      console.log(updated);
                      setInterests(updated.sort((a, b) => { return b.upvotes - a.upvotes }))
                    }
                  }}
                >
                  <img alt="arrowD" src={arrowD} width="40"></img>
                </IconButton>

                <IconButton
                  onClick={async () => {
                    let tzaddress;
                    if (currWallet.includes(".tez")) {
                      await fetch('https://api.tezos.domains/graphql', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          query: `
                        {
                          domain(name: "` + currWallet + `") {
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
                          console.log(result);
                          if (result.data.domain) {
                            tzaddress = result.data.domain.address;
                          }
                        });
                    } else {
                      tzaddress = currWallet;
                    }
                    let res = await setUpvote(tzaddress);
                    if (res.isSuccessful) {
                      setCurrUpvote(currUpvote + 1);
                      let updated = [...interests];
                      let index = updated.findIndex(profile => profile.address === currWallet);
                      console.log(index);
                      updated[index] = { address: updated[index].address, upvotes: updated[index].upvotes + 1 };
                      console.log(updated);
                      setInterests(updated.sort((a, b) => { return b.upvotes - a.upvotes }))
                    }
                  }}
                >
                  <img alt="arrowU" src={arrowU} width="40"></img>
                </IconButton>

                <IconButton
                  onClick={async () => {
                    let tempIndex;
                    if (currIndex > 0) {
                      tempIndex = currIndex - 1;
                    } else {
                      if (toggleActive) {
                        tempIndex = actives.length - 1;
                      } else {
                        tempIndex = interests.length - 1;
                      }
                    }
                    if (toggleActive) {
                      setCurrWallet(actives[tempIndex].address)
                    } else {
                      setCurrWallet(interests[tempIndex].address)
                    }
                    setCurrIndex(tempIndex);
                  }}
                >
                  <img alt="arrowL" src={arrowL} width="40"></img>
                </IconButton>
                <IconButton
                  onClick={async () => {
                    if (toggleActive) {
                      let index = (Math.floor(Math.random() * actives.length))
                      setCurrWallet(actives[index])
                      setCurrIndex(index)
                    } else {
                      let index = (Math.floor(Math.random() * interests.length))
                      setCurrWallet(interests[index].address)
                      setCurrIndex(index)
                    }
                  }}
                >
                  <img alt="random" src={dice} width="40"></img>
                </IconButton>
                <IconButton
                  onClick={async () => {
                    console.log("currIndex" + currIndex)
                    let arrLength;
                    let tempIndex = currIndex;

                    if (toggleActive) {
                      arrLength = actives.length;
                    } else {
                      arrLength = interests.length;
                    }

                    if (currIndex === arrLength - 1) {
                      tempIndex = 0;
                    } else {
                      tempIndex++;
                    }

                    if (toggleActive) {
                      setCurrWallet(actives[tempIndex].address)
                    } else {
                      setCurrWallet(interests[tempIndex].address)
                    }
                    setCurrIndex(tempIndex);
                  }}
                >
                  <img alt="arrowR" src={arrowR} width="40"></img>
                </IconButton>
              </div>
              <div style={{ display: "flex", justifyContent: "right", padding: 5, width: "30%" }}>
                {<Card style={{ backgroundColor: "#F6F7F8", display: "flex", alignItems: "center", padding: 5, width: "100%" }}>
                  <TextField id="outlined-basic" variant="outlined"
                    onChange={handleChangeInput}
                    value={input}
                    onKeyPress={handleKeyPress}
                    label="enter wallet address or .tez"
                    fullWidth
                  />

                  <Button
                    variant="contained" color="primary"
                    style={{ marginLeft: 20 }}
                    onClick={() => {
                      setCurrWallet(input);
                      setCurrIndex(0);
                    }}
                  >
                    VISIT
                  </Button>

                </Card>
                }
              </div>
            </div>
          </Card>
        </div>
      </Card >
    </ThemeProvider>
  );
}
