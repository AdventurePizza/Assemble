// @ts-nocheck
import React, { useCallback } from "react";

export interface IFirebaseContext {
  setModule: (address, module, value, key) => Promise<IFetchResponseBase>;
  getModules: (address) => Promise<IFetchResponseBase>;
  getObjkts: (address) => Promise<IFetchResponseBase>;
  getGoogleImages: (query) => Promise<IFetchResponseBase>;
  getSpotify: (address) => Promise<IFetchResponseBase>;
  getUnfurl: () => Promise<IFetchResponseBase>;
  getNews: (query) => Promise<IFetchResponseBase>;
  getAllProfiles: () => Promise<IFetchResponseBase>;
  getActives: () => Promise<IFetchResponseBase>;
  setUpvote: (address) => Promise<IFetchResponseBase>;
  getUpvote: (address) => Promise<IFetchResponseBase>;
  setDownvote: (address) => Promise<IFetchResponseBase>;
  getVisit: () => Promise<IFetchResponseBase>;
  setVisit: (dayIndex: string) => Promise<IFetchResponseBase>;
  getSales: () => Promise<IFetchResponseBase>;
}

export const FirebaseContext = React.createContext<IFirebaseContext>({
  setModule: () => Promise.resolve({ isSuccessful: false }),
  getModules: () => Promise.resolve({ isSuccessful: false }),
  getObjkts: () => Promise.resolve({ isSuccessful: false }),
  getGoogleImages: () => Promise.resolve({ isSuccessful: false }),
  getSpotify: () => Promise.resolve({ isSuccessful: false }),
  getUnfurl: () => Promise.resolve({ isSuccessful: false }),
  getNews: () => Promise.resolve({ isSuccessful: false }),
  getAllProfiles: () => Promise.resolve({ isSuccessful: false }),
  getActives: () => Promise.resolve({ isSuccessful: false }),
  setUpvote: () => Promise.resolve({ isSuccessful: false }),
  getUpvote: () => Promise.resolve({ isSuccessful: false }),
  setDownvote: () => Promise.resolve({ isSuccessful: false }),
  getVisit: () => Promise.resolve({ isSuccessful: false }),
  setVisit: () => Promise.resolve({ isSuccessful: false }),
  getSales: () => Promise.resolve({ isSuccessful: false }),
});

const fetchBase =
  process.env.NODE_ENV === "development"
    ? ""
    : "https://assemblr-backend.herokuapp.com";

export const FirebaseProvider: React.FC = ({ children }) => {

  const setModule = useCallback(
    async (address, module, value, key): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/module`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: address, module: module, value: value, key: key }),
      });

      if (fetchRes.ok) {
        return { isSuccessful: true };
      }

      return { isSuccessful: false, message: fetchRes.statusText };
    },
    []
  );

  const getModules =
    useCallback(async (address): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/modules/${address}`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);


  const getObjkts =
    useCallback(async (address): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/objkts/${address}`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);

  const getGoogleImages =
    useCallback(async (query): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/search/${query}`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);

  const getSpotify =
    useCallback(async (address): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/spotify/${address}`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);

  const getUnfurl =
    useCallback(async (url): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/unfurl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);

  const getNews =
    useCallback(async (query): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/news/${query}`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);

  const getAllProfiles =
    useCallback(async (): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/allProfiles`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);

  const getActives =
    useCallback(async (): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/actives`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);


  const setUpvote = useCallback(
    async (address): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: address }),
      });

      if (fetchRes.ok) {
        return { isSuccessful: true };
      }

      return { isSuccessful: false, message: fetchRes.statusText };
    },
    []
  );

  const getUpvote =
    useCallback(async (address): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/upvote/${address}`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);

  const setDownvote = useCallback(
    async (address): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/downvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: address }),
      });

      if (fetchRes.ok) {
        return { isSuccessful: true };
      }

      return { isSuccessful: false, message: fetchRes.statusText };
    },
    []
  );


  const getVisit = useCallback(
    async (): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/visit`, {
        method: 'GET'
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    },
    []
  );

  const setVisit = useCallback(
    async (dayIndex: string): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dayIndex: dayIndex })
      });

      if (fetchRes.ok) {
        return { isSuccessful: true };
      }

      return { isSuccessful: false, message: fetchRes.statusText };
    },
    []
  );

  const getSales =
    useCallback(async (): Promise<IFetchResponseBase> => {
      const fetchRes = await fetch(fetchBase + `/users/sales/`, {
        method: "GET",
      });

      if (fetchRes.ok) {
        return await fetchRes.json();
      }
    }, []);
  return (
    <FirebaseContext.Provider
      value={{
        setModule,
        getModules,
        getObjkts,
        getGoogleImages,
        getSpotify,
        getUnfurl,
        getNews,
        getAllProfiles,
        getActives,
        setUpvote,
        getUpvote,
        setDownvote,
        getVisit,
        setVisit,
        getSales
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
