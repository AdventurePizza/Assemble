// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react';
import { Card, Button } from "@material-ui/core";
import { FirebaseContext } from "../firebaseContext";
import loading from '../assets/loading2.gif';

export const ProfileList = () => {
  const [data, setData] = useState();
  const { getAllProfiles } = useContext(FirebaseContext);
  const [loadingWallets, setLoadingWallets] = useState(true);

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
    async function grab() {
      let res = await getAllProfiles();
      //console.log(res);

      const profilePreview = await Promise.all(res.map(async ({ address }) => {
        let owned = await getTokens(address, query_owned);
        let created = await getTokens(address, query_created);
        let randomBG;
        let createdCount = 0;
        let ownedCount = 0;

        //console.log(created)
        //console.log(owned)

        if (owned.data && created.data) {
          createdCount = created.data.tokens.length;
          ownedCount = owned.data.tokens.length;

          let randomIndex = Math.floor(Math.random() * ownedCount);
          if ((owned.data.tokens[randomIndex]) && ((owned.data.tokens[randomIndex]).display_uri))
            randomBG = ((owned.data.tokens[randomIndex]).display_uri).replace('ipfs://', 'https://ipfs.io/ipfs/');
          else {
            //console.log("error")
          }
        }
        return { wallet: address, bg: randomBG, created: createdCount, owned: ownedCount }
      }));
      //console.log(await profilePreview)
      setData(await profilePreview);
      setLoadingWallets(false);
    }
    grab();


  }, [getAllProfiles]);

  return (
    <Card style={{ height: "100vh", overflow: "auto", backgroundColor: "black", fontFamily: "Neue-regular" }}>

      <Button
        size={"large"}
        title={"Return Back"}
        onClick={() => {
          window.open(`https://assemblr.xyz/`, "_blank")
        }}
        style={{ color: "white" }}
      >
        <u>Return Back</u>
      </Button>
      <br></br>
      <div>
        {loadingWallets && <img src={loading} alt={loading} height="100%" />}
      </div>
      {data && data.map((profile) => (
        profile &&
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card style={{ backgroundImage: `url(${profile.bg})`, width: "100%", textAlign: "center", height: "20vh" }}>
            <Button
              size={"small"}
              title={profile.wallet}
              onClick={() => {
                window.open(`https://assemblr.xyz/?profile=${profile.wallet}`, "_blank")
              }}
              style={{ backgroundColor: "black", width: "100%", color: "white" }}
            >
              <u>{profile.wallet}</u>&nbsp;

              created: {profile.created}/100&nbsp;
              owned: {profile.owned}/100
            </Button>
          </Card>
        </div>
      ))
      }


    </Card>
  );
}


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