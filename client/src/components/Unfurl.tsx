// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react';
import { Card } from "@material-ui/core";
import { FirebaseContext } from "../firebaseContext";
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import { Button } from "@material-ui/core";
import { Tweet } from 'react-twitter-widgets'

type UnfurlProps = {
  url: string
}

export const Unfurl = ({ url }: UnfurlProps) => {
  const [data, setData] = useState();
  const { getUnfurl } = useContext(FirebaseContext);
  const [tweet, setTweet] = useState();

  useEffect(() => {
    async function grab() {
      let res = await getUnfurl(url);

      ////console.log(res);

      if (res && (res.image) && (res.image).startsWith("./")) {
        let temp = url.split("/");

        res.image = url.replace(temp[temp.length - 1], (res.image).slice(2));
      }

      if (url.startsWith("https://twitter.com")) {
        let temp = url.split("/");

        ////console.log(temp);
        if (temp & temp[5]) {
          let temp2 = temp[5].split("?");
          setTweet(temp2[0]);
        }

      }

      setData(res);
    }
    grab();
  }, [getUnfurl, url]);

  return (
    <Card>

      {tweet &&
        <Tweet tweetId={tweet} />
      }

      {!tweet && <>
        {data && !(url.includes("youtube.com") || url.includes("https://youtu.be")) && data.image &&
          <div onClick={() => window.open(url, "_blank")}>
            <img alt={url} src={data.image} width="100%" />
            <h4>{data.title}</h4>

            <p>{data.description}</p>
            <p><small>{url}</small></p>
          </div>
        }
        {data && !data.image &&
          <LinkPreview url={url} fallbackImageSrc={"https://www.pngitem.com/pimgs/m/43-430934_magnifying-glass-magnifying-glass-png-icon-transparent-png.png"} />
        }
        {!data &&
          <div>
            <Button
              size={"small"}
              title={"unsync"}
              onClick={() => { window.open(url, "_blank") }}
            >
              <u>{url.length > 60 ? url.slice(0, 30) + "..." + url.slice(url.length - 31, url.length - 1) : url}</u>{" "}
            </Button>
          </div>

        }
      </>}
    </Card>
  );
}

