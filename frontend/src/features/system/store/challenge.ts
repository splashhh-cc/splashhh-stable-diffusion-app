import {useAppDispatch, useAppSelector} from 'app/storeHooks';
import * as InvokeAI from 'app/invokeai';

import {setChallenge} from "./systemSlice";
import {systemSelector} from "./systemSelectors";
import {useEffect} from "react";
import {Challenge} from "app/invokeai";

export function useChallengeWatcher() {
  const dispatch = useAppDispatch();

  const {
    challenge
  } = useAppSelector(systemSelector);

  useEffect(() => {

    if (challenge === null) {
      //console.log('useFreshChallengeWatcher: challenge is empty, fetching a new challenge');
      getChallenge().then(solve_challenge).then((solved) => {
        dispatch(setChallenge(solved));
      });
    }

  }, [challenge, dispatch]);
}

export async function getChallenge() : Promise<InvokeAI.Challenge> {
  const response = await fetch(window.location.origin + '/get_challenge', {
    method: 'GET',
  });

  return (await response.json()) as InvokeAI.Challenge;
}

async function deriveKey(password: string, salt: string, iterations: number, keyLength: number): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const pwArray = encoder.encode(password);
  const saltArray = encoder.encode(salt);

  const pbkdf2Algorithm: Pbkdf2Params = {
    name: "PBKDF2",
    hash: "SHA-256",
    salt: saltArray,
    iterations: iterations
  };

  const derivedKey = await crypto.subtle.importKey(
    'raw',
    pwArray,
    {name: 'PBKDF2'},
    false,
    ['deriveBits']
  );

  const key = await crypto.subtle.deriveBits(
    pbkdf2Algorithm,
    derivedKey,
    keyLength * 8
  );

  return new Uint8Array(key);
}

function normalize(num_array: Uint8Array): number {
  // convert derived key to a number between 0 and 1 when 1 is the max value
  // that can be represented by the number of bytes in the derived key
  const max = Math.pow(2, num_array.length * 8);
  const num = num_array.reduce((acc, byte) => acc * 256 + byte, 0);
  return num / max;
}

// the function should return the solution to the challenge
// difficulty is the expected number of guesses
export async function solve_challenge(c: Challenge): Promise<Challenge> {
  const challenge = c.challenge
  const difficulty = c.difficulty.valueOf()

  let guess = 'as good as any';
  const normalized_difficulty: number = 1 / difficulty;

  const iterations = 100;
  const keyLength = 32;

  let guess_count = 0;
  const startTime = performance.now()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const derivedKey = await deriveKey(challenge, guess, iterations, keyLength);
    guess_count++;
    const normalized = normalize(derivedKey);

    if (normalized < normalized_difficulty) {
      const time_taken_ms = performance.now() - startTime;
      return {challenge, difficulty, solution: guess, guess_count, time_taken_ms};
    }
    // generate a random string of the same length as the guess
    guess = Array.from({length: guess.length}, () => Math.random().toString(36)[2]).join('');
  }

}
