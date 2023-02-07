import {useAppDispatch, useAppSelector} from 'app/storeHooks';
import * as InvokeAI from 'app/invokeai';

import {setChallenge} from "./systemSlice";
import {systemSelector} from "./systemSelectors";
import {useEffect} from "react";

export function useFreshChallengeWatcher() {
  const dispatch = useAppDispatch();

  const {
    challenge
  } = useAppSelector(systemSelector);

  useEffect(() => {

    const getChallenge = async () => {
      const response = await fetch(window.location.origin + '/get_challenge', {
        method: 'GET',
      });

      //console.log(await response);
      const res = (await response.json()) as InvokeAI.GetChallengeResponse;
      console.log(res);

      dispatch(setChallenge(res.challenge));
    };

    if (challenge == '') {
      console.log('ch:' + challenge)
      getChallenge();
    }

  }, [challenge, dispatch]);


}
