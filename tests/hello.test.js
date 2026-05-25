// to run the test in a browser: npx playwright test --headed ./helloPage.test.js
// to run the test without browser: npx playwright test ./helloPage.test.js

import { createMachine, assign, interpret, send, sendTo, spawn, sendUpdate, sendParent, actions } from 'xstate';
import { expect, test, defineConfig } from '@playwright/test';
import { createModel } from '@xstate/test';
import { toDirectedGraph } from '@xstate/graph';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'models');
const CURRENT_HASH_FILE = path.join(DATA_DIR, 'current.hash');

function createHash(content) {
  return crypto
    .createHash('sha256')
    .update(content, 'utf8')
    .digest('hex');
}

async function updateModelIfChanged(modelText) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const newHash = createHash(modelText);
    let oldHash = null;
    try {
      oldHash = (await fs.readFile(CURRENT_HASH_FILE, 'utf8')).trim();
    } catch (err) {
      // File may not exist yet — that's fine
    }

    console.log('Old hash:', oldHash);
    console.log('New hash:', newHash);

    // TODO: 🤔
    // if (oldHash === newHash) {
    //   console.log('No change detected.');
    //   return oldHash;
    // }

    const newFilePath = path.join(DATA_DIR, `${newHash}.json`);

    const data = {
      hash: newHash,
      model: modelText,
      date: new Date()
    };

    await fs.writeFile(newFilePath, JSON.stringify(data, null, 2), 'utf8');
    await fs.writeFile(CURRENT_HASH_FILE, newHash, 'utf8');

    console.log(`New model saved: ${newFilePath}`);
    return newHash
  } catch (err) {
    console.error('Error:', err);
  }
}

export default defineConfig({
  timeout: 10 * 5 * 60 * 1000,
  retries: 1,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});

function hashString(str) {
  return crypto
    .createHash('sha256')
    .update(str)
    .digest('hex');
}

const pause = 10 * 60 * 1000;

const states = {
  void: {
    meta: {
      test: async (_, params) => {
        expect(true).toBe(true)
      }
    }
  },
  isPatronRegistered: {
    meta: {
      test: async (_, params) => {
        expect(["regular-UUID1", "researcher-UUID2"]).toContain(params.context.patronType)
      }
    }
  },
  isBookRequested: {
    meta: {
      test: async (_, params) => {
        expect(params.context.requestedBookId).toBe("AliceInWonderland")
      }
    }
  },
}

const testMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBc7ILIEMDGALAlgHZgB0AbgPb4QDEAagIIAyAkgCIMAqAogPoBCAeUEBpANoAGALqJQABwqx8yfBUKyQAD0QBGAGwBOEjokBWCQGYA7AZsSAHFZ1WANCACeiAEw7TJewAs9npWel72Ojr2plYWAL5xbqiwGDgExCT4sPwUFADWdJgANtQ0DGxsAsLi0hoKSipqGtoIAQY6JDH2BsEWOl4WMaYWbp4IPn6BwaHhkdGxCUloWHhEpFk5+QwQEJD0zOxcfKz8AEoMpwCakjJIIPXKqup3LVbBxgFtn916jgamo28vn8QRCYQiURi8USIGSqVWGSyTHwACMAE6YNHuU5gTAQdw0U7cADiLAAyjxTrwAApcU6CAByNzqikeTReul8XmMsSGfWcBkGgPGwKmYNmkIWMLhK3S61g1MwyDRahxUCyqDReyJAEUAKrcClVUTMu4PRrPUAtXwBPQkCwRAI2W1BSwjDxAyagmYQ+bQpYpWVrTLZXJ5NUasBa2gAYQAEtwYyJeII6NxTmwDWTTfJWRbmroDBIjBIJF5bHoLG0qwYAsKJiDpuC5lDFrDlmlg7hMAqlSrCAyKIIyFGIABXOA0eOJ5NCUS8BiMFhMBj8ZcsTjXWpmvNPAvjCzlkgBaylisTLz10Xe5uS-3twOdxGhrZkTD4IqYFFFMBThNJ41k2YJhBAAdQYBkY24HN7l3dkrW8KwrAke1uisAZBldewry9JsJT9NsZSfeVNjyBgiiKCgAHc9jJbgmETTheDjQQmEqal0xYQQ2Bg809w5BA+h6D4bBsQI2mcHDG3FX1W2lDsEXlOMKCKCBqSjVQIDJMAf2wVBaGAsDAOY1ieO3XMGn4hDBMrKx-H5JxMJ8PQpLFH0WylAN4TlENSOU1S9hYtjeAAMUEKlDNA7h2M47jeLgy0tEQAJSzs4Z7C8LxYlifpXJvfC5K8oNn0HZB-LUjSKAgbhNDkfBo0JbhOD1U4GUA+LLPgpLWlMZx-C8X5zE+XqqzyvDZM8h9vODDYw34HA8hoPVqQ4HhjKJThThYbhGCYbNzNgzrEpaIIjwsSsLGLKsnD0AEPRFXCZI8+8iMUkhMTAUicWVfAwDfIpYD1OQICVPYY0ZEKWFOdBeBOc4rmY7hmE4OMOrZY7EFMAJTCMdDTF+bH8YMMJhQiYwIkCYm9GLLwAkIhSfI+r6wB+v7ikB4HQdjCGoZhuGLkuRHkdRnRbgs9H91OoxzosS7BSdfQ7rGf4SGptpqYMTLyxPOm20IKq4A0V65RZI79wAWhc+7zb8Aw7fth2HZehng0oahTYlgSAkve6TA6CQwX+ewHDt5C9Hpx83tm-JChKCAPfzATBm5WxSz0b2HSrLL3TGBtYgkKJwi8MsQl1oriN8sNtl2eOdzNgTKz8fHQjtobLGJqT8+cLKdDaWnKwj6bn2RdFMWxXF8QTqzup6XHztMHwIiyzKlc9Egu-Qpw+6dQfivlRVlVVMB1RSKNICnrrrUwkhiwCXvuiiQVMs7y6dFrWs9BCRx7F3ivo-DY+kZowXwxggbudk3iy3Qt0Yu9hAgvwLu-W0X83i-zet2Xsh8BxDhHGicchs66e2sj4SI9ohhhFfovOs9086v03r3TWO95KRx8v-Bgb4Pxfh-CA-cA0yzGHOoYKwTpug5zXhvHu28rBoNYS+MiFFqLn0IYnayl1rDk0-uWKwphAg6Flgg8BDDabSOYUPJSKkKpok0tpXS+keFJ29nZHwyFnCmDcQ6ewYiHrrzoZIxhJjy5RzkeVJR4sVHdQdAveyLdqxuM8Qg5xzhAiHm0TImasBSrlXUlYqqNU6rAOUdPE65YULWFpt7CQyFPheNoWWZwSSTxZVMGk58pF5rYDyPY6ytoiwkFsHo6I51+h3wMfQ7eP9TF73elqZmrN-ocxBnYwpl9MYkPXgvPQ-RnDFlusKEwFhOiBx0SHfpZcppTKRKiDEWI4y4iKMgXAYwwlFMxp4lCsQBobKQjLPZlhDkt2Od0U5CQEhAA */
  id: 'testMachine',
  predictableActionArguments: true,
  initial: 'void',
  context: {
    patronType: undefined,
    isTTLCounter: 0,
    counter: 0
  },
  states: {
    "void": {
      on: {
        "VALIDATE_BOOK": [
          {
            target: "isBookValid",
          },
        ]
      }
    },
    "isBookValid": {
      on: {
        "ADD_BOOK": [
          { target: "isBookAdded" }
        ]
      }
    },
    "isBookAdded": {
      on: {
        "VALIDATE_LIBRARY": [
          { target: "isLibraryReady" }
        ]
      }
    },
    "isLibraryReady": {
      on: {
        "REGISTER_PATRON": [
          { target: "isPatronRegistered" }
        ]
      }
    },
    "isPatronRegistered": {
      on: {
        "REQUEST_BOOK": [
          { target: "isBookRegistered" }
        ]
      }
    },
    "isBookRegistered": {
      on: {
        "CHECK_OVERDUES": [
          { target: "hasPatronNoOverdues" }
        ]
      }
    },
    "hasPatronNoOverdues": {
      on: {
        "CHECK_BOOK_AVAILABILITY": [
          { target: "isBookAvailable" }
        ]
      }
    },
    "isBookAvailable": {
      on: {
        "CHECK_BOOK_ALLOWANCE": [
          { target: "isBookAllowed" }
        ]
      }
    },
    "isBookAllowed": {
      on: {
        "SELECT_HOLD_PERIOD": [
          { target: "isHoldPeriodSelected" }
        ]
      }
    },
    "isHoldPeriodSelected": {
      on: {
        "ALLOW_BOOK_HOLD": [
          { target: "isBookHolded" }
        ]
      }
    },
    "isBookHolded": {
      on: {
        "HOLD_FOR_ALLOWED_PERIOD": [
          { target: "isNotHoldPeriodExpired" }
        ]
      }
    },
    "isNotHoldPeriodExpired": {
      on: {
        "RETURN_BOOK": [
          { target: "isBookBack" }
        ]
      }
    },
    "isBookBack": {
      on: {
        "UPDATE_BOOK_RETRIEVALS": [
          { target: "areBookRetrievalsUpdated" }
        ]
      }
    },
    "areBookRetrievalsUpdated": {
      on: {
        "CONFIRM_LIBRARY_HEALTH": [
          {
            cond: "isNoTTL",
            actions: "inc",
            target: "isLibraryHealthy",
          },
          {
            target: "void"
          }
        ]
      }
    },
    "isLibraryHealthy": {}
  }
}, {
  guards: {
    "isNoTTL": (context) => {
      console.log("[isNoTTL] counter: ", context.counter)
      return context.counter <= 1
    }
  },
  actions: {
    "inc": assign({
      counter: (context) => {
        console.log("INC: ", context.counter)
        return context.counter + 1
      }
    }),
    "register": assign({ patronType: (context) => "regular-UUID1" }),
    "updateTTLCounter": assign({ isTTLCounter: (context) => context.isTTLCounter + 1 }),
    // "registerAsResearcher": assign({ patronType: (context) => "researcher-UUID2" }),
    // "requestValidBook": assign({ requestedBookId: (context) => "AliceInWonderland" }),
  }
})

const curHash = await updateModelIfChanged(JSON.stringify(testMachine))

const pp = toDirectedGraph(testMachine)

const testModel = createModel(testMachine, {
  events: {
    "REVERSE": async (page, type, ...params) => {
    },
  },
  actions: {},
  guards: {},
  services: {},
  activities: {},
  delays: {}
});

// https://stately.ai/docs/xstate-v4/xstate/packages/xstate-test#testplanpaths
const testPlans = testModel.getSimplePathPlans()
test.describe('testMachine', () => {

  testPlans.forEach(plan => {
    test.describe(plan.description + "-" + curHash, () => {
      plan.paths.forEach(path => {
        test(path.description + " from  " + curHash, async ({ page }) => {
          await path.test(page);
        });
      });
    });
  });
});

// it('should have full coverage', () => {
//   return testModel.testCoverage();
// });