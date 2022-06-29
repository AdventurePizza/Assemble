// @ts-nocheck
import React, { useState } from 'react';
import { Button, TextField, Card } from "@material-ui/core";


import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";


export const Minter = ({ deployContract }) => {
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [supply, setSupply] = useState();
  const [icon, setIcon] = useState();
  const [description, setDescription] = useState();


  //[{"name":"namea","symbol":"symb","decimals":"2","supply":"1000","description":"desc","icon":"iconurl"}]

  const nameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  };
  const symbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(event.target.value)
  };
  const supplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSupply(event.target.value)
  };
  const iconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIcon(event.target.value)
  };
  const descriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value)
  };


  async function deploy() {
    let addr = "tz2DNkXjYmJwtYceizo3LwNVrqfrguWoqmBE";
    try {
      let tokensString = `[{"name":"${name}","symbol":"${symbol}","decimals":"2","supply":"${supply}","description":"${description}","icon":"${icon}"}]`
      const tokens = JSON.parse(tokensString);
      let metadata = MichelsonMap.fromLiteral({
        "": Buffer("tezos-storage:contents", "ascii").toString("hex"),
        contents: Buffer(
          JSON.stringify({
            version: "v0.0.1",
            name: "contractName",
            description: "contractDescription",
            authors: ["FA2 Bakery"],
            source: {
              tools: ["Ligo"],
            },
            interfaces: ["TZIP-012", "TZIP-016"],
          }),
          "ascii"
        ).toString("hex"),
      });
      const storage = {
        admin: {
          admin: "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg",
          pending_admin: null,
          paused: false,
        },
        assets: {
          token_total_supply: MichelsonMap.fromLiteral({}),
          ledger: MichelsonMap.fromLiteral({}),
          operators: MichelsonMap.fromLiteral({}),
          token_metadata: MichelsonMap.fromLiteral({}),
        },
        metadata: metadata,
      };
      tokens.forEach((token, index) => {
        const tokenSupply = token.supply * new BigNumber(10).pow(token.decimals);
        storage.assets.token_total_supply.set(index, tokenSupply);
        storage.assets.ledger.set([addr, index], tokenSupply);
        storage.assets.token_metadata.set(index, {
          token_id: index,
          token_info: MichelsonMap.fromLiteral({
            symbol: Buffer(token.symbol, "ascii").toString("hex"),
            name: Buffer(token.name, "ascii").toString("hex"),
            decimals: Buffer(token.decimals, "ascii").toString("hex"),
            shouldPreferSymbol: Buffer("true", "ascii").toString("hex"),
            description: Buffer(token.description, "ascii").toString("hex"),
            thumbnailUri: Buffer(token.icon, "ascii").toString("hex"),
          }),
        });
      });
      ////console.log(fa2MultiAsset);

      deployContract(storage)
      /*
            await dAppClient.requestOperation({
              operationDetails: [
                {
                  kind: TezosOperationType.ORIGINATION,
                  code: fa2MultiAsset,
                  storage,
                },
              ],
            });
      
      */

    } catch (e) {
      console.error(e);
    } finally {

    }
  }

  return (
    <Card variant="elevation" elevation={24} style={{ width: "90%", height: "100%", paddingInline: "5%" }}>
      <h1 style={{ textAlign: "center" }}>Assemblr Bakery</h1>

      <div style={{ display: "flex", marginTop: 6 }}>
        <TextField label={"Name*"} fullWidth style={{ marginRight: 10 }} variant="outlined"
          onChange={nameChange}
          value={name}
        />
        <TextField label={"Symbol*"} fullWidth variant="outlined"
          onChange={symbolChange}
          value={symbol}
        />
      </div>
      <TextField style={{ marginTop: 6 }} label={"Supply*"} fullWidth variant="outlined"
        onChange={supplyChange}
        value={supply}
      />
      <TextField style={{ marginTop: 6 }} label={"Icon*"} fullWidth variant="outlined"
        onChange={iconChange}
        value={icon}
      />
      <TextField style={{ marginTop: 6 }} multiline="true" rows={3} label={"Description*"} fullWidth variant="outlined"
        onChange={descriptionChange}
        value={description}
      />


      <div style={{ display: "flex", justifyContent: "center", marginBlock: 10 }}>
        <Button
          variant="contained" color="primary"
          style={{ marginLeft: 10 }}
          onClick={() => {
            deploy()
          }}>
          Deploy
        </Button>
      </div>

    </Card>
  );
}

