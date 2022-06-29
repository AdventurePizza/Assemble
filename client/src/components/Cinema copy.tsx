// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, Button, Slider, IconButton } from "@material-ui/core";
import pauseIcon from '../assets/pause.png';
import playIcon from '../assets/play.png';
import openIcon from '../assets/open-new.png';
import { useParams } from 'react-router';
import loading from '../assets/loading2.svg';

export const Cinema = ({ type }) => {

    const [play, setPlay] = useState(true);
    const [current, setCurrent] = useState();
    const [loaded, setLoaded] = useState([]);
    const [counter, setCounter] = useState(0);
    const [tokens, setTokens] = useState(0);
    const { id } = useParams();
    const [isloading, setIsLoading] = useState(true);

    const [speed, setSpeed] = React.useState(12);

    const [actives, setActives] = React.useState(12);
    const [wallet, setWallet] = React.useState();
    const [walletCounter, setWalletCounter] = React.useState(0);

    const speedChange = (event, newSpeed) => {
        setSpeed(newSpeed);
        setPlay(speed !== 0)
    };

    function handleImageLoaded(element) {
        setLoaded([...loaded, { image: element.target.currentSrc, id: element.target.title }])
    }


    useEffect(() => {
        console.log("actives")
        async function grabActives() {

            let response = await fetch("https://unstable-do-not-use-in-production-api.teztok.com/v1/graphql", {
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

            try {
                let res = await response.json();

                if (res.data) {
                    setActives(res.data.events)
                    //address = res.data.events[0].buyer_address;
                    setWallet(res.data.events[0].buyer_address)
                }

            } catch (error) {
                console.log(error)
            }

        }
        grabActives()

    }, [setWallet, setActives]);


    useEffect(() => {
        console.log("cinema")

        async function getTokens(query) {
            let created;
            await fetch('https://unstable-do-not-use-in-production-api.teztok.com/v1/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: { "address": wallet },
                }
                ),
            })
                .then((res) => res.json())
                .then((result) => {
                    console.log(result)
                    if (result && result.data) {
                        created = result.data.tokens.length > 50 ? result.data.tokens.slice(0, 49) : result.data.tokens;
                        setTokens(created)
                    }
                });


        }

        if (type === "created") {
            getTokens(query_created);
        } else {
            getTokens(query_owned);
        }


    }, [setTokens, wallet, id, type]);

    useEffect(() => {

        function zap() {
            if (loaded) {
                if (speed > 0) {
                    if (counter < loaded.length - 1)
                        setCounter(prevCount => prevCount + 1);
                    else
                        setCounter(0);
                } else if (speed < 0) {
                    if (counter !== 0)
                        setCounter(prevCount => prevCount - 1);
                    else
                        setCounter(loaded.length - 1);
                }

                setCurrent(loaded[counter])
                setIsLoading(false)

            }
        }

        if (play) {
            const interval = setInterval(zap, Math.abs(60 / speed) * 1000);
            return () => {
                clearInterval(interval)
            };
        }

    }, [play, loaded, counter, speed]);

    useEffect(() => {

        function zapWallet() {
            console.log("xap wallet")
            if (speed > 0) {
                if (walletCounter < actives.length - 1)
                    setWalletCounter(prevCount => prevCount + 1);
                else
                    setWalletCounter(0);
            } else if (speed < 0) {
                if (walletCounter !== 0)
                    setWalletCounter(prevCount => prevCount - 1);
                else
                    setWalletCounter(actives.length - 1);
            }
            if (actives.length > 0) {
                console.log(actives)
                console.log(walletCounter)
                console.log(actives[walletCounter])
                setWallet(actives[walletCounter].buyer_address)
                setLoaded([])
                setCounter(0)
            }
            //setIsLoading(false)

        }


        if (play) {
            const interval2 = setInterval(zapWallet, 60 * 1000);
            return () => {
                clearInterval(interval2)
            };
        }

    }, [play, actives, walletCounter]);

    return (
        <Card style={{ width: "100%", height: "70vh" }}>

            {
                tokens && tokens.map((token, index) => (
                    <div key={index}>
                        {token && token.display_uri &&
                            <div style={{ width: "100%", height: "100%", marginLeft: "auto", marginRight: "auto", display: current && current.image === token.display_uri.replace('ipfs://', 'https://ipfs.io/ipfs/') && current.id === token.token_id ? "block" : "none" }}>

                                <Button style={{ width: "100%" }}
                                    onClick={() => {
                                        window.open(`https://objkt.com/asset/${token.fa2_address}/${token.token_id}`, "_blank")
                                    }}
                                >
                                    <Card variant="elevation" elevation={24}>
                                        <div style={{ textAlign: "center", fontSize: "1.1em" }}> <b>{token.name}</b></div>
                                        <img onLoad={e => handleImageLoaded(e)} src={token.display_uri.replace('ipfs://', 'https://ipfs.io/ipfs/')} title={token.token_id} style={{ height: "50vh" }} />

                                        <div style={{ textAlign: "center" }}> <b>{token.supply} X </b></div>
                                        <div style={{ display: "flex" }}>
                                            <div>
                                                <b>
                                                    price: {token.lowest_ask ? ((token.lowest_ask / 1000000) + "ꜩ") : "-"}
                                                </b>
                                            </div>
                                            <div style={{ marginLeft: "auto" }}>
                                                <b>
                                                    offer: {token.highest_offer ? ((token.highest_offer / 1000000) + "ꜩ") : "-"}
                                                </b>
                                            </div>
                                        </div>
                                    </Card>
                                </Button>
                            </div>
                        }
                    </div>

                ))
            }

            {
                isloading &&
                <img src={loading} alt={loading} width={"50%"} />
            }

            <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
                <div style={{ fontFamily: "Neue-bold", fontSize: "1.8em", marginInline: "5%" }}>TV</div>

                <div style={{ fontFamily: "Neue-bold", fontSize: "1.2em", marginRight: "5%" }}>Active 40</div>
                <div style={{ fontFamily: "Neue-bold", fontSize: "1.2em", textAlign: "center", marginRight: "5%" }}>Owned Objkts <br></br>
                    <Button
                        onClick={() => {
                            window.open(`https://assemblr.xyz/?profile=${wallet}`, "_blank")
                        }}
                    >
                        {wallet}

                    </Button>
                </div>
                <div style={{ fontFamily: "Neue-bold", fontSize: "1.2em" }}>{counter + 1}/{loaded.length} </div>

                <Slider
                    value={speed}
                    onChange={speedChange}
                    step={1}
                    min={-60}
                    max={60}
                    defaultValue={12} aria-label="Default" valueLabelDisplay="auto" style={{ width: "50%", marginLeft: "10%" }} />

                <IconButton
                    onClick={() => { setPlay(!play) }}
                >
                    <img alt="pause" src={play ? pauseIcon : playIcon} width="25"></img>
                </IconButton>

                <IconButton
                    onClick={() => { window.open(`https://assemblr.xyz/tv/${type}/${wallet}`, "_blank") }}
                >
                    <img alt="fullscreen" src={openIcon} width="25"></img>
                </IconButton>

            </div>

        </Card >
    );
}


const query_created = `
query createdTokens ($address: jsonb) {
    tokens(where: {creators: {_contains: $address}, editions: {_gt: "0"}}) {
      artifact_metadata
      artifact_uri
      artist_address
      assets
      attributes
      burned_editions
      contributors
      creators
      current_price_to_first_sales_price_diff
      current_price_to_first_sales_price_pct
      current_price_to_highest_sales_price_diff
      current_price_to_highest_sales_price_pct
      current_price_to_last_sales_price_diff
      current_price_to_last_sales_price_pct
      current_price_to_lowest_sales_price_diff
      current_price_to_lowest_sales_price_pct
      description
      display_uri
      editions
      eightbid_creator_name
      eightbid_rgb
      external_uri
      fa2_address
      first_sales_price
      formats
      fx_issuer_id
      fx_iteration
      highest_offer_price
      highest_sales_price
      last_processed_event_id
      last_processed_event_level
      last_processed_event_timestamp
      last_sale_at
      last_sales_price
      lowest_sales_price
      metadata_uri
      mime_type
      mint_price
      minted_at
      minter_address
      name
      objkt_artist_collection_id
      platform
      price
      right_uri
      rights
      royalties
      royalties_total
      sales_count
      sales_volume
      symbol
      thumbnail_uri
      token_id
    }
  }
  
`

const query_owned = `
query ownedTokens ($address: String) {
    tokens(where: {holdings: {holder_address: {_eq: $address}, amount: {_gt: "0"}}}) {
      artifact_metadata
      artifact_uri
      artist_address
      assets
      attributes
      burned_editions
      contributors
      creators
      current_price_to_first_sales_price_diff
      current_price_to_first_sales_price_pct
      current_price_to_highest_sales_price_diff
      current_price_to_highest_sales_price_pct
      current_price_to_last_sales_price_diff
      current_price_to_last_sales_price_pct
      current_price_to_lowest_sales_price_diff
      current_price_to_lowest_sales_price_pct
      description
      display_uri
      editions
      eightbid_creator_name
      eightbid_rgb
      external_uri
      fa2_address
      first_sales_price
      formats
      fx_issuer_id
      fx_iteration
      highest_offer_price
      highest_sales_price
      last_processed_event_id
      last_processed_event_level
      last_processed_event_timestamp
      last_sale_at
      last_sales_price
      lowest_sales_price
      metadata_uri
      mime_type
      mint_price
      minted_at
      minter_address
      name
      objkt_artist_collection_id
      platform
      price
      right_uri
      rights
      royalties
      royalties_total
      sales_count
      sales_volume
      symbol
      thumbnail_uri
      token_id
    }
  }
  
`
