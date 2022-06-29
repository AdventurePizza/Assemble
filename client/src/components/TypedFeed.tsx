// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react';
import { Card, Button } from "@material-ui/core";


export const TypedFeed = () => {
  const [tokens, setTokens] = useState();
  const [more, setMore] = useState(-1);

  useEffect(() => {
    //get tokens KT1J6NY5AU61GzUX51n59wwiZcGJ9DrNTwbK
    async function getTokens(query) {
      let created;
      await fetch('https://unstable-do-not-use-in-production-api.teztok.com/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: {},
        }
        ),
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result)
          if (result.data && result.data.tokens)
            setTokens(result.data.tokens)
        });


    }
    getTokens(query_latest);
  }, []);

  return (
    <Card style={{ width: "100%", height: "100%", backgroundColor: "black", color: "white", overflowY: "scroll", padding: 2 }}>
      <div style={{ textAlign: "center", fontSize: "1.2em", marginTop: 10 }}>Typed Art</div>
      {tokens && tokens.map((token, index) => (
        <div style={{ marginBlock: 20, border: "dashed 1px black", padding: 2 }}>
          <div style={{ display: "flex", justifyContent: "right" }}>
            <Button size="small" onClick={() => { window.open(`https://typed.art/${token.token_id}`, "_blank") }} style={{ color: "white" }}>{token.token_id}#</Button>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', WebkitLineClamp: more === index ? 50 : 8, WebkitBoxOrient: "vertical", display: "-webkit-box", overflowWrap: "break-word", overflow: "hidden" }}>
            {token.description}
          </p>
          <div style={{ display: "flex", alignItems: "center" }}>
            {token.description && token.description.split(/\r\n|\r|\n/).length > 8 && <Button size="small" onClick={() => { setMore(index) }} style={{ color: "white" }}>{more !== index ? "more" : "less"}</Button>}
            <div style={{ marginLeft: "auto" }}>
              <Button size="small" onClick={() => { window.open(`https://assemblr.xyz/?profile=${token.creators[0]}`, "_blank") }} style={{ color: "white" }}>{token.creators[0] && token.creators[0].slice(0, 10) + "..." + token.creators[0].slice(28, 36)}</Button>
            </div>
          </div>
        </div>
      ))

      }
    </Card>
  );
}

const query_latest = `
query MyQuery {
  tokens(where: {fa2_address: {_eq: "KT1J6NY5AU61GzUX51n59wwiZcGJ9DrNTwbK"}}, order_by: {minted_at: desc}, limit: 300) {
    name
    fa2_address
    token_id
    description
    creators
  }
}


`
