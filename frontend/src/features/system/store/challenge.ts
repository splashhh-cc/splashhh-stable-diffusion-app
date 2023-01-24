import {AnyAction, ThunkAction} from '@reduxjs/toolkit';
import {RootState} from 'app/store';
import * as InvokeAI from 'app/invokeai';
import {setChallenge} from "./systemSlice";


export const getChallenge =
  (): ThunkAction<void, RootState, unknown, AnyAction> =>
    async (dispatch) => {

      const response = await fetch(window.location.origin + '/get_challenge', {
        method: 'GET',
      });

      const res = (await response.json()) as InvokeAI.GetChallengeResponse;
      console.log(res);


      dispatch(setChallenge(res.challenge));
    };
