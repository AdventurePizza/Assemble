// @ts-nocheck
import React, { useEffect, useState, useContext } from 'react';
import { Card } from "@material-ui/core";
import { FirebaseContext } from "../firebaseContext";
import { Unfurl } from './Unfurl';
import loading from '../assets/loading.svg';

type NewsProps = {
  query: string
}

export const News = ({ query }: NewsProps) => {
  const [data, setData] = useState();
  const { getNews } = useContext(FirebaseContext);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    async function grab() {
      let res = await getNews(query);

      ////console.log(res);
      setData(res);
      setLoadingNews(false);
    }
    grab();
  }, [getNews, query]);

  return (
    <Card>
      {!loadingNews &&
        data && data.items && (data.items.slice(0, 10)).map(({ title, description, link }) => (
          <div >
            <Unfurl url={link} />
          </div>
        ))
      }
      {loadingNews && <img src={loading} alt={loading} width="100%" />}
    </Card>
  );
}

