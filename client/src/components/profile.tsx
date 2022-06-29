// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react'
import { Grid, Button, Avatar, Card, Select, MenuItem, TextField, IconButton, Checkbox } from "@material-ui/core";
import "./profile.css";
import { useSnackbar } from "notistack";
import { Timeline } from 'react-twitter-widgets'
import { FirebaseContext } from "../firebaseContext";
import { UserCard } from 'react-github-cards/dist/medium'
import 'react-github-cards/dist/medium.css';
import { uuid } from 'uuidv4';
import { Unfurl } from './Unfurl';
import loading from '../assets/loading.svg';
import { News } from './News';
import { Tv } from './Tv';
import { Minter } from "./Minter";
import { TypedFeed } from './TypedFeed';

export const Profile = (
    { address, account, setAddress, navigate, deployContract }
) => {
    const { enqueueSnackbar } = useSnackbar();
    const { getModules, setModule, getObjkts, getGoogleImages, getSpotify, setVisit, getSales } = useContext(FirebaseContext);
    const [username, setUsername] = useState(address.slice(0, 6) + "..." + address.slice(32, 36));
    const isMobile = window.innerWidth <= 500;
    const [editMode, setEditMode] = useState(false);
    const [selectedEditField, setSelectedEditField] = React.useState("twitter");
    const inputLabels = {
        "news": "ukraine",
        "twitter": "adventurecorpp",
        "tumblr": "tezos",
        "github": "tanerdurmaz",
        "alias": "nickname",
        "ethereum wallet": "0x4bA9285EDE9D46Bc367ee1d5cD5a8F1d9e6572e6",
        "website": "https://adventurenetworks.net/",
        "image": "https://picsum.photos/300",
        "linkedin": "https://www.linkedin.com/company/adventurenetworks",
        "dribbble": "https://dribbble.com/SQUARESPACE",
        "behance": "https://www.behance.net/gallery/138457467/FRACTAL-ISTANBUL-DREAMS?tracking_source=search_projects",
        "arena": "https://www.are.na/charles-broskoski/artist-websites",
        "fxhash": "https://www.fxhash.xyz/u/ciphrd",
        "versum": "https://versum.xyz/user/tz1iQEmi4ikjDPP4umrAV6DiCVZLX6XWdoJF/created",
        "teia": "https://teia.art/objkt/575343",
        "objkt": "https://objkt.com/profile/mhoydich/created",
        "zora": "https://zora.co/collections/0x715132af755D9D3d81eE0AcF11e60692719bc415/1",
        "foundation": "https://foundation.app/collection/FI",
        "text": "hello world",
    };
    const [input, setInput] = useState();

    //profile modules
    const [twitter, setTwitter] = useState([]);
    const [tumblr, setTumblr] = useState([]);
    const [github, setGithub] = useState();
    const [alias, setAlias] = useState();
    const [ethereum, setEthereum] = useState();
    const [createdObjkts, setCreatedObjkts] = useState();
    const [ownedObjkts, setOwnedObjkts] = useState();
    const [websites, setWebsites] = useState();
    const [images, setImages] = useState();
    const [googleInput, setGoogleInput] = useState();
    const [googleImages, setGoogleImages] = useState();
    const [songs, setSongs] = useState();
    const [wallets, setWallets] = useState();
    const [linkedin, setLinkedin] = useState([]);
    const [dribbble, setDribbble] = useState([]);
    const [behance, setBehance] = useState([]);
    const [arena, setArena] = useState([]);
    const [fxhash, setFxhash] = useState([]);
    const [versum, setVersum] = useState([]);
    const [teia, setTeia] = useState([]);
    const [objkt, setObjkt] = useState([]);
    const [zora, setZora] = useState([]);
    const [foundation, setFoundation] = useState([]);
    const [loadingModules, setLoadingModules] = useState(true);
    const [news, setNews] = useState([]);
    const [texts, setTexts] = useState([]);
    const [bgImage, setBgImage] = useState("");
    const [walletInput, setWalletInput] = useState();

    const [actives, setActives] = useState();
    const [objktChecked, setObjktChecked] = React.useState(true);
    const [fxChecked, setFxChecked] = React.useState(true);

    const [teiaTV, setTeiaTV] = React.useState();
    const [teiaTVindex, setTeiaTVindex] = React.useState(0);

    const [topSales, setTopSales] = React.useState();

    const handleObjktFilter = (event) => {
        setObjktChecked(event.target.checked);
    };

    const handlefxhashFilter = (event) => {
        setFxChecked(event.target.checked);
    };


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

    function zap() {
        //console.log("hey hey hey people")
        if (actives) {
            //console.log("zap")
            if (teiaTVindex + 1 < actives.length)
                setTeiaTVindex(teiaTVindex => teiaTVindex + 1)
            else
                setTeiaTVindex(0)
        } else {
            if (!actives) {
                //grabActives()
            }
            setTeiaTVindex(0)
        }
    }

    async function getTokens(wallet, query) {
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
                if (result) {
                    //console.log(result)
                    created = result;
                }
            });

        return created;
    }


    useEffect(() => {
        /*
        attempt to implement simple analytics 
        1654026866 start time to record visits
        */

        const start = 1654026866; //april 21 
        const dayInterval = 86400000;
        let timestamp = Date.now();
        setVisit((Math.floor((timestamp - start) / dayInterval)).toString())

        const interval = setInterval(zap, 12000);
        //const interval2 = setInterval(grabActives, 240000);
        return () => {
            clearInterval(interval)
            //clearInterval(interval2)
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setVisit]);

    useEffect(() => {


        grabActives()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [objktChecked, fxChecked]);

    const handleChangeWalletInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWalletInput(event.target.value)
    };

    const handleExplorePress = (event) => {
        if (event.key === "Enter") {
            navigate("/?profile=" + event.target.value);
            setAddress(event.target.value);
        }
    };

    useEffect(() => {
        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        async function fetchModules() {
            let modules = await getModules(address);
            let tempWebsites = [];
            let tempImages = [];
            let tempWallets = [{ key: "user wallet", type: "wallet", value: address }];
            let tempTumblr = [];
            let tempTwitter = [];
            let tempLinkedin = [];
            let tempDribbble = [];
            let tempBehance = [];
            let tempArena = [];
            let tempFxhash = [];
            let tempVersum = [];
            let tempTeia = [];
            let tempObjkt = [];
            let tempZora = [];
            let tempFoundation = [];
            let tempNews = [];
            let tempTexts = [];

            if (modules) {
                modules.forEach(module => {
                    if (module.type === "twitter") {
                        tempTwitter.push(module);
                    } else if (module.type === "tumblr") {
                        tempTumblr.push(module);
                    } else if (module.type === "github") {
                        setGithub(module.value);
                    }
                    else if (module.type === "alias") {
                        setAlias(module.value);
                    }
                    else if (module.type === "ethereum") {
                        setEthereum(module.value);
                    }
                    else if (module.type === "website") {
                        tempWebsites.push(module)
                    }
                    else if (module.type === "image") {
                        tempImages.push(module)
                    }
                    else if (module.type === "wallet") {
                        tempWallets.push(module)
                    }
                    else if (module.type === "linkedin") {
                        tempLinkedin.push(module);
                    }
                    else if (module.type === "dribbble") {
                        tempDribbble.push(module);
                    }
                    else if (module.type === "behance") {
                        tempBehance.push(module);
                    }
                    else if (module.type === "arena") {
                        tempArena.push(module);
                    }
                    else if (module.type === "fxhash") {
                        tempFxhash.push(module);
                    }
                    else if (module.type === "versum") {
                        tempVersum.push(module);
                    }
                    else if (module.type === "teia") {
                        tempTeia.push(module);
                    }
                    else if (module.type === "objkt") {
                        tempObjkt.push(module);
                    }
                    else if (module.type === "zora") {
                        tempZora.push(module);
                    }
                    else if (module.type === "foundation") {
                        tempFoundation.push(module);
                    }
                    else if (module.type === "news") {
                        tempNews.push(module);
                    }
                    else if (module.type === "text") {
                        tempTexts.push(module);
                    }
                });

                let tempCreatedCollections = [];
                let tempOwnedCollections = [];
                if (tempWallets) {
                    for (let i = 0; i < tempWallets.length; i++) {
                        if (tempWallets[i].value) {
                            //console.log(created)

                            let owned = await getTokens(tempWallets[i].value, query_owned);
                            console.log(owned)
                            if (owned) {
                                tempOwnedCollections.push({ objkts: owned.data.tokens.length > 50 ? owned.data.tokens.slice(0, 50) : owned.data.tokens, wallet: tempWallets[i].value })
                            }
                        }
                    }
                    for (let i = 0; i < tempOwnedCollections.length; i++) {
                        if (tempOwnedCollections[i].wallet === address) {
                            let bgObjkt
                            if (tempOwnedCollections[i].objkts.length > 0)
                                bgObjkt = tempOwnedCollections[i].objkts[getRandomInt(tempOwnedCollections[i].objkts.length)].display_uri;

                            if (bgObjkt)
                                setBgImage(bgObjkt.replace('ipfs://', 'https://ipfs.io/ipfs/'));

                        }
                    }

                    setCreatedObjkts(tempCreatedCollections)
                    setOwnedObjkts(tempOwnedCollections)
                }

                setWebsites(tempWebsites);
                setImages(tempImages);
                setWallets(tempWallets);
                setTumblr(tempTumblr);
                setTwitter(tempTwitter);
                setLinkedin(tempLinkedin);
                setDribbble(tempDribbble);
                setBehance(tempBehance);
                setArena(tempArena);
                setFxhash(tempFxhash);
                setVersum(tempVersum);
                setTeia(tempTeia);
                setObjkt(tempObjkt);
                setZora(tempZora);
                setFoundation(tempFoundation);
                setNews(tempNews);
                setTexts(tempTexts);
                setLoadingModules(false);
                let res = await getSales()
                //console.log(res)
                setTopSales(res)
            }


        }

        fetchModules();

    }, [getModules, setModule, address, getObjkts, getSales]);

    function changeProfile() {
        //set
        //notify
        if (selectedEditField === "twitter") {
            let key = uuid();
            setModule(address, "twitter", input, key);
            setTwitter((twitter) => twitter.concat({ value: input, key: key, type: "twitter" }));
        } else if (selectedEditField === "tumblr") {
            let key = uuid();
            setModule(address, "tumblr", input, key);
            setTumblr((tumblr) => tumblr.concat({ value: input, key: key, type: "tumblr" }));
        } else if (selectedEditField === "github") {
            setModule(address, "github", input);
            setGithub(input);
        } else if (selectedEditField === "alias") {
            setModule(address, "alias", input);
            setAlias(input);
        } else if (selectedEditField === "ethereum") {
            setModule(address, "ethereum", input);
            setEthereum(input);
        } else if (selectedEditField === "website") {
            let key = uuid();
            setModule(address, "website", input, key);
            setWebsites((websites) => websites.concat({ value: input, key: key, type: "website" }));
        } else if (selectedEditField === "image") {
            let key = uuid();
            setModule(address, "image", input, key);
            setImages((images) => images.concat({ value: input, key: key, type: "image" }));
        } else if (selectedEditField === "wallet") {
            let key = uuid();
            setModule(address, "wallet", input, key);
            setWallets((wallets) => wallets.concat({ value: input, key: key, type: "wallet" }));
        } else if (selectedEditField === "linkedin") {
            let key = uuid();
            setModule(address, "linkedin", input, key);
            setLinkedin((linkedin) => linkedin.concat({ value: input, key: key, type: "linkedin" }));
        } else if (selectedEditField === "dribbble") {
            let key = uuid();
            setModule(address, "dribbble", input, key);
            setDribbble((dribbble) => dribbble.concat({ value: input, key: key, type: "dribbble" }));
        } else if (selectedEditField === "behance") {
            let key = uuid();
            setModule(address, "behance", input, key);
            setBehance((behance) => behance.concat({ value: input, key: key, type: "behance" }));
        } else if (selectedEditField === "arena") {
            let key = uuid();
            setModule(address, "arena", input, key);
            setArena((arena) => arena.concat({ value: input, key: key, type: "arena" }));
        } else if (selectedEditField === "fxhash") {
            let key = uuid();
            setModule(address, "fxhash", input, key);
            setFxhash((fxhash) => fxhash.concat({ value: input, key: key, type: "fxhash" }));
        } else if (selectedEditField === "versum") {
            let key = uuid();
            setModule(address, "versum", input, key);
            setVersum((versum) => versum.concat({ value: input, key: key, type: "versum" }));
        } else if (selectedEditField === "teia") {
            let key = uuid();
            setModule(address, "teia", input, key);
            setTeia((teia) => teia.concat({ value: input, key: key, type: "teia" }));
        } else if (selectedEditField === "objkt") {
            let key = uuid();
            setModule(address, "objkt", input, key);
            setObjkt((objkt) => objkt.concat({ value: input, key: key, type: "objkt" }));
        } else if (selectedEditField === "zora") {
            let key = uuid();
            setModule(address, "zora", input, key);
            setZora((zora) => zora.concat({ value: input, key: key, type: "zora" }));
        } else if (selectedEditField === "foundation") {
            let key = uuid();
            setModule(address, "foundation", input, key);
            setFoundation((foundation) => foundation.concat({ value: input, key: key, type: "foundation" }));
        }
        else if (selectedEditField === "news") {
            let key = uuid();
            setModule(address, "news", input, key);
            setNews((news) => news.concat({ value: input, key: key, type: "news" }));
        }
        else if (selectedEditField === "text") {
            let key = uuid();
            setModule(address, "text", input, key);
            setTexts((texts) => texts.concat({ value: input, key: key, type: "text" }));
        }
    }

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value)
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            changeProfile()
        }
    };

    const handleChangeInputGoogle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGoogleInput(event.target.value)
    };

    const handleKeyPressGoogle = (event) => {
        if (event.key === "Enter") {
            googleSearch();
        }
    };
    const handleChange = (event: SelectChangeEvent) => {
        setSelectedEditField(event.target.value as string);

        if (event.target.value === "twitter" && twitter) {
            setInput(twitter)
        } else if (event.target.value === "github" && github) {
            setInput(github)
        } else if (event.target.value === "alias" && alias) {
            setInput(alias)
        } else if (event.target.value === "ethereum" && ethereum) {
            setInput(ethereum)
        } else {
            setInput(inputLabels[event.target.value])
        }
    };

    useEffect(() => {
        //get wallet names for ex. taner.tez
        async function getDomain(address: string) {
            let domain;
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
                    //console.log(result);
                    if (result.data.reverseRecord) {
                        domain = result.data.reverseRecord.domain.name;
                        setUsername(domain);
                    }
                });
        }
        getDomain(address)
    }, [address]);

    useEffect(() => {
        async function fetchGraphQL(operationsDoc, operationName, variables, indexer) {
            let result = await fetch(indexer, {
                method: 'POST',
                body: JSON.stringify({
                    query: operationsDoc,
                    variables: variables,
                    operationName: operationName,
                }),
            })

            var ress = await result.json();
            return ress;
        }

        async function fetchTezosProfiles(addr) {

            const { errors, data } = await fetchGraphQL(
                query_profile,
                'TezosProfiles',
                { address: addr },
                'https://indexer.tzprofiles.com/v1/graphql'
            )
            if (errors) {
                console.error(errors)
            }
            if (data) {
                //console.log(data);

                if (data.tzprofiles_by_pk) {
                    if (!twitter && data.tzprofiles_by_pk.twitter) {
                        setTwitter((twitter) => twitter.concat({ value: data.tzprofiles_by_pk.twitter, type: "twitter" }));
                    }
                    if (!github && data.tzprofiles_by_pk.github) {
                        setGithub(data.tzprofiles_by_pk.github)
                    }
                    if (!alias && data.tzprofiles_by_pk.alias) {
                        setAlias(data.tzprofiles_by_pk.alias)
                    }
                    if (!ethereum && data.tzprofiles_by_pk.ethereum) {
                        setEthereum(data.tzprofiles_by_pk.ethereum)
                    }
                }
            }
        }
        fetchTezosProfiles(address)

    }, [address, alias, ethereum, github, twitter,]);


    useEffect(() => {

        async function fetchSongs(address) {
            setSongs(await getSpotify(address))
        }
        fetchSongs(address);

    }, [address, getSpotify]);

    const googleSearch = async () => {
        //console.log(googleInput)

        //setLoading(true);
        const res = await getGoogleImages(googleInput);
        const imageDataWanted = res.map(
            ({ url, origin }: IResponseDataGoogle) => {
                const { title } = origin;
                return {
                    alt: title,
                    imageLink: url,
                    thumbnailLink: url,
                    id: url
                };
            }
        );
        //console.log(imageDataWanted)
        //setLoading(false);
        setGoogleImages(imageDataWanted);

    }

    useEffect(() => {

        async function fetchGraphQL(operationsDoc, operationName, variables) {
            let result = await fetch('https://hdapi.teztools.io/v1/graphql', {
                method: 'POST',
                body: JSON.stringify({
                    query: operationsDoc,
                    variables: variables,
                    operationName: operationName,
                }),
            })

            var ress = await result.json();
            return ress;
        }

        async function fetchCollection(addr) {
            if (addr && addr.includes(".tez")) {
                await fetch('https://api.tezos.domains/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                        {
                          domain(name: "` + addr + `") {
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
                            addr = (result.data.domain.address);
                        }
                    });
            }
            try {
                const { errors, data } = await fetchGraphQL(
                    query_collection,
                    'collectorGallery',
                    { address: addr }
                )
                if (errors) {
                    console.error(errors)
                }
                const result = data ? data.hic_et_nunc_token_holder : null;
                //console.log(addr)
                //console.log(result)
                if (result && result.length !== 0) {
                    setTeiaTV(result[Math.floor(Math.random() * result.length)])
                } else {
                    if (teiaTVindex + 1 < actives.length)
                        setTeiaTVindex(teiaTVindex + 1)
                    else
                        setTeiaTVindex(0)
                }
            } catch (error) {
                console.error(error)
            }

        }
        //console.log("aa")
        if (actives) {
            //console.log("ichi")
            if (actives[teiaTVindex])
                fetchCollection(actives[teiaTVindex].address)
        }
    }, [actives, teiaTVindex]);


    return (
        <div style={{
            backgroundImage: `url(${bgImage})`,
            marginTop: 20
        }}>

            <div className="center">
                <Avatar
                    alt="Profile Picture"
                    src={`https://services.tzkt.io/v1/avatars/${address}`}
                    style={{ width: 100, height: 100 }}
                />
            </div>
            <div className="center">
                <b>{alias}</b>
            </div>
            <div className="center">
                <Button
                    size="small"
                    onClick={() => {
                        navigator.clipboard.writeText(address);
                        enqueueSnackbar(
                            <div onClick={() => {
                                window.open(`https://tzkt.io/${address}/operations`);
                            }}
                            > Wallet address coppied, click to view on explorer </div>, {
                            variant: "success",
                        });
                    }}
                >{username}</Button>
            </div>
            {account === address &&
                <div className="center" style={{ marginBottom: 20 }}>
                    <Button

                        variant="contained" color="primary"
                        onClick={() => { setEditMode(!editMode) }}
                    >
                        {editMode ? "finish edit" : "edit"}
                    </Button>

                </div>
            }
            {loadingModules && <img src={loading} alt={loading} height="100%" />}

            {!editMode && !loadingModules &&
                <div className="modules" style={{ display: isMobile ? "grid" : "flex", width: "99vw", flexWrap: "wrap" }}>







                    {wallets && wallets.map(({ value }) => (
                        <>
                            {
                                <div style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%", height: 600 }}>

                                    <Card variant="elevation" elevation={24}>
                                        <div style={{ textAlign: "center" }}> <h3>Created Objkts</h3></div>
                                        <div style={{ textAlign: "center" }}> <h3>{value.length > 30 ? value.slice(0, 10) +
                                            "..." +
                                            value.slice(28, 36) : value}</h3></div>

                                        <Tv address={value} type={"created"} />

                                    </Card>

                                </div>
                            }
                        </>
                    ))
                    }

                    {ownedObjkts && ownedObjkts.map(({ objkts, wallet }) => (
                        <>
                            {false &&
                                <div style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%", height: 600 }}>

                                    <Card variant="elevation" elevation={24}>
                                        <div style={{ textAlign: "center" }}> <h3>Owned Objkts</h3></div>
                                        <div style={{ textAlign: "center" }}> <h3>{wallet.length > 30 ? wallet.slice(0, 10) +
                                            "..." +
                                            wallet.slice(28, 36) : wallet}</h3></div>

                                        <Tv address={wallet} type={"owned"} />

                                    </Card>

                                </div>
                            }
                        </>
                    ))
                    }

                    {twitter && twitter.map(({ key, value }) => (
                        value &&
                        <div key={key} className="twitter" style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>

                            <Timeline
                                dataSource={{
                                    sourceType: 'profile',
                                    screenName: value
                                }}
                                options={{
                                    width: '100%',
                                    height: '600'
                                }}
                            />
                        </div>
                    ))
                    }

                    {tumblr && tumblr.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>

                            <Card key={key} variant="elevation" elevation={24}>
                                <Card variant="elevation" elevation={24}>
                                    <iframe title={"tumblr"} src={`https://${value}.tumblr.com/`} width={"100%"} height={600}></iframe>
                                </Card>
                            </Card>
                        </div>
                    ))
                    }

                    {ethereum &&
                        <div style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <iframe src={`https://opensea.io/${ethereum}?embed=true`}
                                    title="opensea"
                                    width='100%'
                                    height='600'
                                ></iframe>
                            </Card>
                        </div>
                    }

                    {news && news.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%", height: 600, overflow: "scroll" }}>
                            <News query={value} />
                        </div>
                    ))
                    }

                    {false && linkedin.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <Unfurl url={value} />
                            </Card>
                        </div>
                    ))
                    }

                    {dribbble && dribbble.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <Unfurl url={value} />
                            </Card>
                        </div>
                    ))
                    }

                    {behance && behance.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>

                            <Card variant="elevation" elevation={24}>
                                <Unfurl url={value} />
                            </Card>
                        </div>
                    ))
                    }

                    {arena && arena.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <iframe title={"arena"} src={value} width={"100%"} height={600}></iframe>
                            </Card>
                        </div>
                    ))
                    }

                    {fxhash && fxhash.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <iframe title={"fxhash"} src={value} width={"100%"} height={600}></iframe>
                            </Card>
                        </div>
                    ))
                    }

                    {versum && versum.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <iframe title={"versum"} src={value} width={"100%"} height={600}></iframe>
                            </Card>
                        </div>
                    ))
                    }

                    {teia && teia.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <iframe title={"teia"} src={value} width={"100%"} height={600}></iframe>
                            </Card>
                        </div>
                    ))
                    }

                    {objkt && objkt.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <iframe title={"objkt"} src={value} width={"100%"} height={600}></iframe>
                            </Card>
                        </div>
                    ))
                    }

                    {zora && zora.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>

                            <Card variant="elevation" elevation={24}>
                                <Unfurl url={value} />
                            </Card>
                        </div>
                    ))
                    }

                    {foundation && foundation.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <iframe title={"foundation"} src={value} width={"100%"} height={600}></iframe>
                            </Card>
                        </div>
                    ))
                    }

                    {websites && websites.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>

                            <Card variant="elevation" elevation={24}>
                                <Unfurl url={value} />
                            </Card>
                        </div>
                    ))
                    }

                    {images && images.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <img src={value} alt={value} width="100%" />
                            </Card>
                        </div>
                    ))
                    }

                    {texts && texts.map(({ key, value }) => (
                        value &&
                        <div key={key} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>
                                <div style={{ fontSize: "2em", textAlign: "center", alignItems: "center", paddingBlock: 20 }}>
                                    {value}
                                </div>
                            </Card>
                        </div>
                    ))
                    }

                    {github &&
                        <div className="github" style={{ width: isMobile ? "84%" : "20%", height: 260, marginInline: isMobile ? "auto" : 45, marginBlock: isMobile ? 15 : 20 }}>
                            <div style={{ justifyContent: "center", alignItems: "center", width: "100%", display: "flex" }}>
                                <Card variant="elevation" elevation={24}>
                                    <UserCard username={github} />
                                </Card>
                            </div>
                        </div>
                    }


                    {songs && songs.map(({ song, username, timestamp }) => (
                        song &&
                        <div key={timestamp} style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}>
                            <Card variant="elevation" elevation={24}>

                                {typeof song != 'string' &&
                                    <iframe
                                        title={timestamp}
                                        src={`https://open.spotify.com/embed/${song.type}/${song.id}?utm_source=generator`}
                                        width="100%"
                                        height="152"
                                        frameBorder="0"

                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    ></iframe>}

                                {typeof song === 'string' &&
                                    <iframe
                                        title='song'
                                        allow="autoplay *; encrypted-media *; fullscreen *"
                                        frameBorder="0"
                                        height="150"
                                        width="100%"
                                        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                                        src={song}>

                                    </iframe>
                                }

                                <div style={{ textAlign: "center" }} >
                                    <Button
                                        title={timestamp}
                                        size={"small"}
                                    >
                                        {username}{" "}
                                    </Button>{" "}
                                </div>
                            </Card>
                        </div>
                    ))
                    }

                    <div
                        style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%", height: 600, overflowY: "scroll" }}
                    >
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Button
                                size={"large"}
                                title={"active"}
                                style={{
                                    backgroundColor: "black", width: "100%", color: "white"
                                }}
                            >
                                Active
                            </Button>
                        </div>
                        <div style={{ backgroundColor: "#D2D8DD", overflowY: "scroll", border: "solid 1px black", overflowX: "hidden" }}>

                            {
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: 40, fontFamily: "Macondo" }}>
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
                            {actives && actives.map((profile) => (
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
                                                window.open(`https://assemblr.xyz/?profile=${profile.address}`, "_blank")
                                            }}
                                            style={{ width: "100%", color: "black" }}
                                        >
                                            <u>{profile.address.length > 30 ? profile.address.slice(0, 10) +
                                                "..." +
                                                profile.address.slice(28, 36) : profile.address}</u>&nbsp;
                                        </Button>
                                    </div>
                                </div>
                            ))
                            }
                        </div>

                    </div>
                    {teiaTV && actives[teiaTVindex] &&
                        <div
                            style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%", height: "auto" }}
                        >
                            <Card style={{ padding: 10 }}>
                                <div style={{ textAlign: "center", fontSize: "1.5em" }}>Teia TV</div>

                                <Button
                                    size={"large"}
                                    title={teiaTV.token.title}
                                    onClick={() => {
                                        window.open(`https://teia.art/objkt/${teiaTV.token.id}`, "_blank")
                                    }}
                                    style={{ width: "100%", color: "black" }}
                                >
                                    {teiaTV.token.title}
                                </Button>
                                <img src={teiaTV.token.display_uri.replace('ipfs://', 'https://ipfs.io/ipfs/')} style={{ width: "100%" }}></img>

                                <Button
                                    size={"large"}
                                    title={actives[teiaTVindex].address}
                                    onClick={() => {
                                        window.open(`https://assemblr.xyz/?profile=${actives[teiaTVindex].address}`, "_blank")
                                    }}
                                    style={{ width: "100%", color: "black" }}
                                >
                                    Owner: {actives &&
                                        actives[teiaTVindex].address.length > 30 ? actives[teiaTVindex].address.slice(0, 10) +
                                        "..." +
                                    actives[teiaTVindex].address.slice(28, 36) : actives[teiaTVindex].address
                                    }
                                </Button>
                            </Card>
                        </div>
                    }

                    <div
                        style={{ display: "flex", alignItems: "center", justifyContent: "right", marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%", height: 600, overflowY: "scroll" }}
                    >
                        <TypedFeed />
                    </div>


                    {topSales && <div
                        style={{ marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%", height: 600, overflow: "scroll" }}
                    >
                        <Card style={{ textAlign: "center", fontSize: "1.5em" }}>Top Sales</Card>

                        {topSales.map((sale) => (
                            <Card style={{ padding: 10 }}>
                                <Button
                                    size={"small"}
                                    onClick={() => {
                                        window.open(`https://objkt.com/asset/${sale.contractAdd}/${sale.tokenId}`, "_blank")
                                    }}
                                    style={{ width: "100%", color: "black" }}
                                >
                                    {sale.tokenName}
                                </Button>

                                <img alt={sale.image} src={sale.image} style={{ width: "100%" }}></img>
                                <div style={{ textAlign: "center", fontSize: "1em" }}>{sale.price}XTZ</div>
                                <Button
                                    size={"small"}
                                    onClick={() => {
                                        window.open(`https://assemblr.xyz/?profile=${sale.creators[0].holder.alias ? sale.creators[0].holder.alias : sale.creators[0].holder.address}`, "_blank")
                                    }}
                                    style={{ width: "100%", color: "black" }}
                                >
                                    by {sale.creators[0].holder.alias ? sale.creators[0].holder.alias : sale.creators[0].holder.address}
                                </Button>
                                <Button
                                    size={"small"}
                                    onClick={() => {
                                        window.open(`https://assemblr.xyz/?profile=${sale.buyer}`, "_blank")
                                    }}
                                    style={{ width: "100%", color: "black" }}
                                >
                                    Buyer: {sale.buyer}
                                </Button>
                                <Button
                                    size={"small"}
                                    onClick={() => {
                                        window.open(`https://assemblr.xyz/?profile=${sale.seller}`, "_blank")
                                    }}
                                    style={{ width: "100%", color: "black" }}
                                >
                                    Seller: {sale.seller}
                                </Button>
                                <div style={{ textAlign: "center", fontSize: "1em" }}>Contract: {sale.contract}</div>
                            </Card>
                        ))
                        }
                    </div>

                    }

                    <div
                        style={{ display: "flex", alignItems: "center", justifyContent: "right", marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}
                    >
                        <Minter deployContract={deployContract} />
                    </div>

                    <div
                        style={{ display: "flex", alignItems: "center", justifyContent: "right", marginInline: isMobile ? "auto" : "2.5%", marginBlock: isMobile ? 15 : 20, width: isMobile ? "84%" : "20%" }}
                    >
                        <div >
                            <Card style={{ display: "flex", alignItems: "center", padding: 10 }}>
                                enter wallet address  &nbsp;  &nbsp;
                                <TextField id="outlined-basic" label={"tz2Fj...MxdFw"} variant="outlined"
                                    onChange={handleChangeWalletInput}
                                    value={walletInput}
                                    onKeyPress={handleExplorePress}
                                />
                                <Button
                                    variant="contained" color="primary"
                                    style={{ marginLeft: 10 }}
                                    onClick={() => {
                                        navigate("/?profile=" + walletInput);
                                        setAddress(walletInput);
                                    }}
                                >
                                    explore
                                </Button>
                            </Card>
                        </div>
                    </div>


                </div>
            }

            {editMode &&
                <div style={{ marginTop: 30 }}>
                    <div className="center">
                        <Grid
                            container
                            alignItems="center"
                            justify="center"
                        >
                            <Grid item>
                                <Select
                                    variant="outlined"
                                    value={selectedEditField}
                                    onChange={handleChange}
                                >
                                    <MenuItem value={"news"}>+News</MenuItem>
                                    <MenuItem value={"wallet"}>+Wallet</MenuItem>
                                    <MenuItem value={"twitter"}>+Twitter</MenuItem>
                                    <MenuItem value={"tumblr"}>+Tumblr</MenuItem>
                                    <MenuItem value={"github"}>Github</MenuItem>
                                    <MenuItem value={"alias"}>Alias</MenuItem>
                                    <MenuItem value={"ethereum"}>Ethereum</MenuItem>
                                    <MenuItem value={"website"}>+Website</MenuItem>
                                    <MenuItem value={"image"}>+Image</MenuItem>
                                    <MenuItem value={"linkedin"}>+Linkedin</MenuItem>
                                    <MenuItem value={"dribbble"}>+Dribbble</MenuItem>
                                    <MenuItem value={"behance"}>+Behance</MenuItem>
                                    <MenuItem value={"arena"}>+Are.na</MenuItem>
                                    <MenuItem value={"fxhash"}>+fxhash</MenuItem>
                                    <MenuItem value={"versum"}>+Versum</MenuItem>
                                    <MenuItem value={"teia"}>+Teia</MenuItem>
                                    <MenuItem value={"objkt"}>+Objkt</MenuItem>
                                    <MenuItem value={"zora"}>+Zora</MenuItem>
                                    <MenuItem value={"foundation"}>+Foundation</MenuItem>
                                    <MenuItem value={"text"}>+Text</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item>
                                <TextField id="outlined-basic" label={inputLabels[selectedEditField]} variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={handleChangeInput}
                                    value={input}
                                    onKeyPress={handleKeyPress}
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained" color="primary"
                                    style={{ marginLeft: 10 }}
                                    onClick={() => { changeProfile() }}
                                >
                                    Post
                                </Button>
                            </Grid>
                        </Grid>
                    </div>

                    {selectedEditField === "image" &&
                        <div className="center" style={{ marginTop: 20 }}>

                            <TextField id="outlined-basic" label={"Google Search"} variant="outlined"
                                onChange={handleChangeInputGoogle}
                                value={googleInput}
                                onKeyPress={handleKeyPressGoogle}
                            />
                            <Button
                                variant="contained" color="primary"
                                style={{ marginLeft: 10 }}
                                onClick={() => { googleSearch() }}
                            >
                                Search
                            </Button>
                        </div>
                    }

                    <br></br>
                    <br></br>
                    <div className="background-container" style={{ overflowY: 'auto' }}>
                        <div className="background-icon-list" >
                            {googleImages &&
                                googleImages.map(({ alt, thumbnailLink, imageLink, id }) => (
                                    <IconButton
                                        key={id}
                                        onClick={() =>
                                            //sendImage(imageLink, isSwitchChecked ? 'background' : 'image')
                                            //<img src={thumbnailLink} alt={alt} width={"200"} />
                                            // setImage({ alt, thumbnailLink, imageLink, id })
                                            setInput(imageLink)
                                        }

                                    >
                                        <Avatar variant="rounded" src={thumbnailLink} alt={alt} style={{ width: 100, height: 100 }} />
                                    </IconButton>
                                ))
                            }
                        </div>
                    </div>

                    <div className="center" style={{ marginTop: 25 }}><b>auto preview</b> </div>
                    <div className="center" style={{ marginTop: 5 }}>
                        {selectedEditField === "twitter" &&
                            <div className="twitter" style={{ marginInline: isMobile ? "auto" : 45, marginBlock: isMobile ? 15 : 20 }}>
                                <Card variant="outlined">
                                    <Timeline
                                        dataSource={{
                                            sourceType: 'profile',
                                            screenName: input
                                        }}
                                        options={{
                                            width: '400',
                                            height: '600'
                                        }}
                                    />
                                </Card>
                            </div>
                        }

                        {selectedEditField === "tumblr" &&
                            <div className="tumblr" >
                                <Card variant="elevation" elevation={24}>
                                    <iframe title={"tumblr"} src={`https://${input}.tumblr.com/`} width={400} height={600}></iframe>
                                </Card>
                            </div>
                        }

                        {selectedEditField === "github" &&
                            <div className="github" style={{ height: 260, marginInline: isMobile ? "auto" : 45, marginBlock: isMobile ? 15 : 20 }}>
                                <Card variant="elevation" elevation={24}>
                                    <UserCard key={input} username={input} />
                                </Card>
                            </div>
                        }

                        {selectedEditField === "alias" &&
                            <div style={{ marginTop: 25 }}>
                                <b>{alias}</b>
                            </div>
                        }
                        {selectedEditField === "ethereum" && input &&
                            <Card variant="elevation" elevation={24}>
                                <iframe src={`https://opensea.io/${input}?embed=true`}
                                    title="opensea"
                                    width='400'
                                    height='600'

                                ></iframe>
                            </Card>
                        }
                        {selectedEditField === "website" &&
                            <Card key={input} variant="elevation" elevation={24}>
                                <Unfurl url={input} />
                            </Card>
                        }
                        {selectedEditField === "image" &&
                            <Card variant="elevation" elevation={24}>
                                <img src={input} alt={input} width="100%" />
                            </Card>
                        }
                    </div>
                    <div className="center" style={{ marginTop: 25 }}><b>Links</b> </div>

                    <div className="center" style={{ marginTop: 25, fontSize: isMobile ? "0.5em" : "1em" }}>
                        <table style={{ width: 400 }}>

                            {wallets && wallets.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Wallet</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "wallet", "", key);
                                                let index = wallets.findIndex((el) => el.key === key)

                                                setWallets([
                                                    ...wallets.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...wallets.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}


                            {twitter && twitter.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Twitter</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "twitter", "", key);
                                                let index = twitter.findIndex((el) => el.key === key)

                                                setTwitter([
                                                    ...twitter.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...twitter.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {tumblr && tumblr.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Tumblr</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "tumblr", "", key);
                                                let index = tumblr.findIndex((el) => el.key === key)

                                                setTumblr([
                                                    ...tumblr.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...tumblr.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {github && <tr>
                                <td >Github</td>
                                <td>{github}</td>
                                <td>
                                    <Button
                                        variant="contained" color="primary"
                                        style={{ marginLeft: 10 }}
                                        onClick={() => {
                                            setModule(address, "github", "");
                                            setGithub("");
                                        }}
                                    >
                                        X
                                    </Button>
                                </td>
                            </tr>}
                            {alias && <tr>
                                <td >Alias</td>
                                <td>{alias}</td>
                                <td>
                                    <Button
                                        variant="contained" color="primary"
                                        style={{ marginLeft: 10 }}
                                        onClick={() => {
                                            setModule(address, "alias", "");
                                            setAlias("");
                                        }}
                                    >
                                        X
                                    </Button>
                                </td>
                            </tr>}
                            {ethereum && <tr>
                                <td >Ethereum</td>
                                <td>{ethereum.slice(0, 16) + "..." + ethereum.slice(32, 63)}</td>

                                <td>
                                    <Button
                                        variant="contained" color="primary"
                                        style={{ marginLeft: 10 }}
                                        onClick={() => {
                                            setModule(address, "ethereum", "");
                                            setEthereum("");
                                        }}
                                    >
                                        X
                                    </Button>
                                </td>
                            </tr>}

                            {fxhash && fxhash.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >fxhash</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "fxhash", "", key);
                                                let index = fxhash.findIndex((el) => el.key === key)

                                                setFxhash([
                                                    ...fxhash.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...fxhash.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {websites && websites.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Website</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "website", "", key);
                                                let index = websites.findIndex((el) => el.key === key)

                                                setWebsites([
                                                    ...websites.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...websites.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {images && images.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Image</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "image", "", key);
                                                let index = images.findIndex((el) => el.key === key)

                                                setImages([
                                                    ...images.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...images.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {linkedin && linkedin.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Linkedin</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "linkedin", "", key);
                                                let index = linkedin.findIndex((el) => el.key === key)

                                                setLinkedin([
                                                    ...linkedin.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...linkedin.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {dribbble && dribbble.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Dribbble</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "dribbble", "", key);
                                                let index = dribbble.findIndex((el) => el.key === key)

                                                setDribbble([
                                                    ...dribbble.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...dribbble.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {behance && behance.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Behance</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "behance", "", key);
                                                let index = behance.findIndex((el) => el.key === key)

                                                setBehance([
                                                    ...behance.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...behance.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {arena && arena.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Are.na</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "arena", "", key);
                                                let index = arena.findIndex((el) => el.key === key)

                                                setArena([
                                                    ...arena.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...arena.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {versum && versum.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Versum</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "versum", "", key);
                                                let index = versum.findIndex((el) => el.key === key)

                                                setVersum([
                                                    ...versum.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...versum.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {teia && teia.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Teia</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "teia", "", key);
                                                let index = teia.findIndex((el) => el.key === key)

                                                setTeia([
                                                    ...teia.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...teia.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {objkt && objkt.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Objkt</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "objkt", "", key);
                                                let index = objkt.findIndex((el) => el.key === key)

                                                setObjkt([
                                                    ...objkt.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...objkt.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {zora && zora.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Zora</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "zora", "", key);
                                                let index = zora.findIndex((el) => el.key === key)

                                                setZora([
                                                    ...zora.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...zora.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {foundation && foundation.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Foundation</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "foundation", "", key);
                                                let index = foundation.findIndex((el) => el.key === key)

                                                setFoundation([
                                                    ...foundation.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...foundation.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {news && news.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >News</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "news", "", key);
                                                let index = news.findIndex((el) => el.key === key)

                                                setNews([
                                                    ...news.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...news.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {texts && texts.map(({ key, value }) => (
                                value &&
                                <tr key={key}>
                                    <td >Texts</td>
                                    <td>{value.length > 60 ? value.slice(0, 30) + "..." + value.slice(value.length - 31, value.length - 1) : value}</td>
                                    <td>
                                        <Button
                                            variant="contained" color="primary"
                                            style={{ marginLeft: 10 }}
                                            onClick={() => {
                                                setModule(address, "text", "", key);
                                                let index = texts.findIndex((el) => el.key === key)

                                                setTexts([
                                                    ...texts.slice(0, index),
                                                    {
                                                        value: "",
                                                    },
                                                    ...texts.slice(index + 1)
                                                ]);

                                            }}
                                        >
                                            X
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </table>

                    </div>

                </div>
            }
        </div >
    );

};

const query_profile = `
query TezosProfiles($address: String!){ 
    tzprofiles_by_pk(account: $address) 
    { 
      account,
      discord,
      twitter,
      github,
      ethereum,
      domain_name,
      logo,
  alias,
      website,
      description,
          valid_claims,
  
    } 
  }
`

const query_collection = `
query collectorGallery($address: String!) {
  hic_et_nunc_token_holder(where: {holder_id: {_eq: $address}, token: {creator: {address: {_neq: $address}}}, quantity: {_gt: "0"}}, order_by: {token_id: desc}) {
	token {
	  id
	  artifact_uri
	  display_uri
	  thumbnail_uri
	  timestamp
	  mime
	  title
	  description
	  supply
	  royalties
	  creator {
		address
	  }
	}
  }
}
`

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
