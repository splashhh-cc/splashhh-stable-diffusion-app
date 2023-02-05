import {useAppDispatch, useAppSelector} from 'app/storeHooks';
import {setChallenge} from "./systemSlice";
import {systemSelector} from "./systemSelectors";
import {useEffect} from "react";

import {getChallenge, solve_challenge} from "../../../app/utils";

export default function useChallengeWatcher() {
  const dispatch = useAppDispatch();

  const {
    challenge
  } = useAppSelector(systemSelector);

  useEffect(() => {

    if (challenge === null) {
      getChallenge().then(solve_challenge).then((solved) => {
        dispatch(setChallenge(solved));
      });
    }

  }, [challenge, dispatch]);
}

