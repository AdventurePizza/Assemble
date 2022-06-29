// @ts-nocheck
import express from "express";

import * as admin from "firebase-admin";
import fetch from 'node-fetch';


admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(
      //@ts-ignore
      Buffer.from(process.env.FIREBASE_CONFIG_BASE64, "base64").toString(
        "ascii"
      )
    )
  ),
  databaseURL: "https://adventure-ea7cd.firebaseio.com",
});

const db = admin.firestore();
const users = express.Router();
const google = require("googlethis");
const grabity = require("grabity");

const assemblrStats = db.collection("assemblrStats");


users.post("/visit", async (req, res) => {
  const { dayIndex } = req.body as { dayIndex: string };
  const dayDoc = await assemblrStats.doc(dayIndex).get()

  if (!dayDoc.exists) {
    assemblrStats.doc(dayIndex).set({ visits: 1 });
  }
  else {
    assemblrStats.doc(dayIndex).update({ visits: admin.firestore.FieldValue.increment(1) });
  }
  res.sendStatus(200);
});

users.get("/visit", async (req, res) => {
  const snapshot = await assemblrStats.get();
  let result = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
  //console.log(result)
  res.status(200).send(result);
});

users.get("/sales", async (req, res) => {
  const snapshot = await db
    .collection("topSales")
    .get();

  let result = snapshot.docs.map((doc) => doc.data());
  let reversed = result.reverse()
  res.status(200).send(reversed);
});

users.post("/module", async (req, res) => {
  const { address, module, value, key } = req.body;
  ////console.log(address, module, value, key);


  if (key) {

    await db
      .collection("assemble")
      .doc("modules")
      .collection(address)
      .doc(key)
      .set({ type: module, value: value, key: key })
      .then(() => res.sendStatus(200));
  }
  else {
    await db
      .collection("assemble")
      .doc("modules")
      .collection(address)
      .doc(module)
      .set({ type: module, value: value })
      .then(() => res.sendStatus(200));
  }

});

users.post("/upvote", async (req, res) => {
  const { address } = req.body;

  const upvotes = await db.collection("assemble").doc("modules").collection(address).doc("upvotes").get()

  if (!upvotes.exists) {
    db.collection("assemble").doc("modules").collection(address).doc("upvotes").set({ amount: 1 });
  }
  else {
    db.collection("assemble").doc("modules").collection(address).doc("upvotes").update({ amount: admin.firestore.FieldValue.increment(1) });
  }

  res.sendStatus(200);
});

users.post("/downvote", async (req, res) => {
  const { address } = req.body;

  const upvotes = await db.collection("assemble").doc("modules").collection(address).doc("upvotes").get()

  if (!upvotes.exists) {
    db.collection("assemble").doc("modules").collection(address).doc("upvotes").set({ amount: -1 });
  }
  else {
    db.collection("assemble").doc("modules").collection(address).doc("upvotes").update({ amount: admin.firestore.FieldValue.increment(-1) });
  }

  res.sendStatus(200);
});

users.get("/upvote/:address", async (req, res) => {
  const { address } = req.params;
  const upvotes = await db.collection("assemble").doc("modules").collection(address).doc("upvotes").get()
  if (upvotes.exists) {
    res.status(200).send(upvotes.data());
  } else {
    res.status(200).send({ amount: 0 });
  }
});

users.get("/modules/:address", async (req, res) => {
  const { address } = req.params;
  ////console.log("address " + address)

  const snapshot = await db
    .collection("assemble")
    .doc("modules")
    .collection(address)
    .get();

  let modules = snapshot.docs.map((doc) => doc.data());
  ////console.log(modules);
  res.status(200).send(modules);

});

users.get("/objkts/:address", async (req, res) => {
  const { address } = req.params;
  ////console.log(address)
  let createdData;
  let ownedData;
  const { errors, data } = await fetchGraphQL(
    query_objkts_created,
    'GetObjktsPaged',
    {

      "where": {
        "fa": {
          "live": {
            "_eq": true
          }
        },
        "supply": {
          "_gt": "0"
        },
        "flag": {
          "_neq": "removed"
        },
        "artifact_uri": {
          "_neq": ""
        },
        "timestamp": {
          "_is_null": false
        },
        "_or": [
          {
            "name": {}
          },
          {
            "creators": {
              "creator_address": {}
            }
          },
          {
            "creators": {
              "holder": {
                "alias": {}
              }
            }
          },
          {
            "creators": {
              "holder": {
                "tzdomain": {}
              }
            }
          },
          {
            "token_id": {
              "_eq": "-1"
            }
          }
        ],
        "creators": {
          "creator_address": {
            "_eq": address
          }
        }
      },
      "order_by": [
        {
          "timestamp": "desc"
        },
        {
          "token_id": "desc"
        }
      ],
      "limit": 30,
      "offset": 0

    },
    "https://api2.objkt.com/v1/graphql"
  )
  if (errors) {
    console.error(errors)
  }
  if (data) {
    createdData = data;
  }

  const { errors, data } = await fetchGraphQL(
    query_objkts_owned,
    'GetObjktsByHolderPaged',
    {
      "where": {
        "holder_address": {
          "_eq": address
        },
        "quantity": {
          "_gt": 0
        },
        "token": {
          "fa": {
            "live": {
              "_eq": true
            }
          },
          "supply": {
            "_gt": "0"
          },
          "flag": {
            "_neq": "removed"
          },
          "artifact_uri": {
            "_neq": ""
          },
          "timestamp": {
            "_is_null": false
          },
          "_or": [
            {
              "name": {}
            },
            {
              "creators": {
                "creator_address": {}
              }
            },
            {
              "creators": {
                "holder": {
                  "alias": {}
                }
              }
            },
            {
              "creators": {
                "holder": {
                  "tzdomain": {}
                }
              }
            },
            {
              "token_id": {
                "_eq": "-1"
              }
            }
          ]
        }
      },
      "order_by": {
        "last_incremented_at": "desc"
      },
      "limit": 30,
      "offset": 0
    },
    "https://api2.objkt.com/v1/graphql"
  )
  if (errors) {
    console.error(errors)
  }
  if (data) {
    ownedData = data;
  }

  let results = { created: createdData, owned: ownedData }
  res.status(200).send(results);


});


users.get("/spotify/:address", async (req, res) => {
  const { address } = req.params;

  const snapshot = await db
    .collection("network3")
    .doc("profiles")
    .collection("history")
    .get();

  let history = snapshot.docs.map((doc) => doc.data());

  let filtered = history.filter(item => item.key === address);

  res.status(200).send(filtered);
});


async function fetchGraphQL(operationsDoc, operationName, variables, indexer) {
  let result = await fetch(indexer, {
    method: 'POST',
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  var ress = await result.json();
  return ress;
}

users.get("/search/:query", async (req, res) => {
  const { query } = req.params;
  ////console.log(query)

  const options = {
    page: 0,
    safe: false, // show explicit results?
    additional_params: {
      hl: 'en'
    }
  }
  const images = await google.image(query, options);
  ////console.log(images)
  res.status(200).send(images);

});


users.get("/news/:query", async (req, res) => {
  const { query } = req.params;
  ////console.log(query)

  let googleNewsAPI = require("google-news-json");
  let news = await googleNewsAPI.getNews(googleNewsAPI.SEARCH, query, "en-GB");
  ////console.log(news)
  res.status(200).send(news);

});

users.post("/unfurl", async (req, res) => {
  ////console.log("url");
  const { url } = req.body;

  ////console.log(url);
  //const result = await grabity.grabIt(url);

  let result;
  try {
    result = await grabity.grabIt(url);
    ////console.log(result);
  } catch (error) {
    //console.log("error for " + url);
    //console.error(error);
    res.status(400).send(new Error(`unfurl error ${url}`));
  }

  res.status(200).send(result);

});

users.get("/allProfiles", async (req, res) => {
  let profiles = [];
  let wallets = [];
  await db
    .collection("assemble").doc("modules").listCollections()
    .then(snapshot => {
      snapshot.forEach(snaps => {
        wallets.push(snaps["_queryOptions"].collectionId);
        ////console.log(snaps["_queryOptions"].collectionId); // LIST OF ALL COLLECTIONS
        ////console.log(snaps);
        ////console.log("-------------------------");
      })
    })
    .catch(error => console.error(error));

  for (let i = 0; i < wallets.length; i++) {
    const upvotes = await db.collection("assemble").doc("modules").collection(wallets[i]).doc("upvotes").get()
    if (upvotes && upvotes.exists) {
      profiles.push({ address: wallets[i], upvotes: upvotes.data().amount });
    } else {
      profiles.push({ address: wallets[i], upvotes: 0 });
    }
  }
  profiles.sort((a, b) => { return b.upvotes - a.upvotes })
  res.status(200).send(profiles);
});

users.get("/actives", async (req, res) => {

  let objktcom = await fetch("https://unstable-do-not-use-in-production-api.teztok.com/v1/graphql", {
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
    ress = await objktcom.json();

  } catch (error) {
    //console.log(error)
    res.sendStatus(400)
  }

  const wallets = (ress.data.events).map((el) => { return { address: el.buyer_address, type: "objkt" } });
  ////console.log(wallets)
  /*
    let fxhash = await fetch("https://api.fxhash.xyz/graphql", {
      method: 'POST',
      body: JSON.stringify({
        query: `
        query Query( $take: Int, $skip: Int, $sort: ActionsSortInput, $filters: ActionFilter) {
          actions(take: $take, skip: $skip, sort: $sort, filters: $filters){
            issuer{
              id,
              createdAt,
              type
            }
            createdAt
          }
        }
        `,
        variables: {
          "skip": 0,
          "take": 10,
          "filters": {},
          "sort": {
            "createdAt": "DESC"
          }
        },
        operationName: "Query",
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
  
    if (!fxhash) {
      res.sendStatus(400)
    }
    var fxhashRes;
  
    try {
      fxhashRes = await fxhash.json();
    } catch (e) {
      //console.log(e); // error in the above string (in this case, yes)!
      res.sendStatus(400)
    }
    if (fxhashRes) {
      //console.log(fxhashRes.data.actions)
      let fxWallet = (fxhashRes.data.actions).map((el) => { if (el.issuer) return { address: el.issuer.id, type: "fxhash" } });
  
      let allWallets = wallets.concat(fxWallet);
      //console.log(allWallets)*/
  res.status(200).send(wallets);
  //}

});

const query_objkts_created = `
query GetObjktsPaged($where: token_bool_exp = {}, $order_by: [token_order_by!] = {}, $limit: Int!, $offset: Int!) {
  token(limit: $limit, offset: $offset, where: $where, order_by: $order_by) {
    ...TokenDefault
    __typename
  }
  token_aggregate(where: $where) {
    aggregate {
      count
      __typename
    }
    __typename
  }
}

fragment TokenDefault on token {
  pk
  token_id
  artifact_uri
  description
  display_uri
  thumbnail_uri
  fa_contract
  royalties {
    ...Royalties
    __typename
  }
  supply
  timestamp
  name
  mime
  last_listed
  highest_offer
  lowest_ask
  flag
  fa {
    ...Fa
    __typename
  }
  creators {
    ...CreatorDefault
    __typename
  }
  attributes {
    attribute {
      id
      name
      type
      value
      __typename
    }
    __typename
  }
  __typename
}

fragment Royalties on royalties {
  id
  amount
  decimals
  receiver_address
  __typename
}

fragment Fa on fa {
  active_auctions
  active_listing
  contract
  description
  name
  owners
  logo
  volume_24h
  volume_total
  website
  twitter
  items
  floor_price
  type
  collection_type
  creator_address
  collection_id
  path
  token_link
  short_name
  live
  editions
  creator {
    ...UserDefault
    __typename
  }
  __typename
}

fragment UserDefault on holder {
  address
  alias
  website
  twitter
  description
  tzdomain
  flag
  logo
  __typename
}

fragment CreatorDefault on token_creator {
  creator_address
  holder {
    ...UserDefault
    __typename
  }
  __typename
}

  `


const query_objkts_owned = `
  query GetObjktsByHolderPaged($limit: Int!, $offset: Int!, $where: token_holder_bool_exp = {}, $order_by: [token_holder_order_by!] = {}) {
    token_holder(limit: $limit, offset: $offset, where: $where, order_by: $order_by) {
      token {
        ...TokenDefault
        __typename
      }
      __typename
    }
    token_holder_aggregate(where: $where) {
      aggregate {
        count
        __typename
      }
      __typename
    }
  }
  
  fragment TokenDefault on token {
    pk
    token_id
    artifact_uri
    description
    display_uri
    thumbnail_uri
    fa_contract
    royalties {
      ...Royalties
      __typename
    }
    supply
    timestamp
    name
    mime
    last_listed
    highest_offer
    lowest_ask
    flag
    fa {
      ...Fa
      __typename
    }
    creators {
      ...CreatorDefault
      __typename
    }
    attributes {
      attribute {
        id
        name
        type
        value
        __typename
      }
      __typename
    }
    __typename
  }
  
  fragment Royalties on royalties {
    id
    amount
    decimals
    receiver_address
    __typename
  }
  
  fragment Fa on fa {
    active_auctions
    active_listing
    contract
    description
    name
    owners
    logo
    volume_24h
    volume_total
    website
    twitter
    items
    floor_price
    type
    collection_type
    creator_address
    collection_id
    path
    token_link
    short_name
    live
    editions
    creator {
      ...UserDefault
      __typename
    }
    __typename
  }
  
  fragment UserDefault on holder {
    address
    alias
    website
    twitter
    description
    tzdomain
    flag
    logo
    __typename
  }
  
  fragment CreatorDefault on token_creator {
    creator_address
    holder {
      ...UserDefault
      __typename
    }
    __typename
  }
  
  `

const getEventsLive = `
  query getEventsLive($where: event_bool_exp!, $order_by: [event_order_by!] = {}, $limit: Int = 100, $offset: Int = 0) {
    event(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
      ...EventLive
      __typename
    }
  }
  
  fragment EventLive on event {
    id
    amount
    price
    event_type
    timestamp
    token_pk
    fa_contract
    ophash
    fa {
      ...FaMinimal
      __typename
    }
    token {
      ...TokenLive
      __typename
    }
    creator {
      ...UserLight
      __typename
    }
    recipient {
      ...UserLight
      __typename
    }
    __typename
  }
  
  fragment FaMinimal on fa {
    contract
    name
    path
    collection_type
    collection_id
    __typename
  }
  
  fragment TokenLive on token {
    pk
    token_id
    artifact_uri
    display_uri
    thumbnail_uri
    fa_contract
    mime
    __typename
  }
  
  fragment UserLight on holder {
    address
    alias
    logo
    __typename
  }
  
  
    `


export default users;
