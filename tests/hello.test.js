// to run the test in a browser: npx playwright test --headed ./helloPage.test.js
// to run the test without browser: npx playwright test ./helloPage.test.js

import { createMachine, assign, interpret, send, sendTo, spawn, sendUpdate, sendParent, actions } from 'xstate';
import { expect, test, defineConfig } from '@playwright/test';
import { createModel } from '@xstate/test';

export default defineConfig({
  timeout: 10 * 5 * 60 * 1000,
  retries: 1,
  use: {
    // trace: 'on-first-retry',
    // headless: false,          // <--- Show the browser
    // viewport: { width: 1280, height: 720 },
    // ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // launchOptions: {
  //   // slowMo: 50,               // slows down each action by 50ms
  // }
});

function wait(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

const pause = 10 * 60 * 1000;

const states = {
  start: {
    meta: {
      test: async (page, params) => {
        // console.log("Params: ", params)
        // Go to Google
        await page.goto('https://www.google.com');

        // Wait until the title contains "Google"
        // await page.waitForFunction(() => document.title.includes('Google'));

        // Read and log the title
        const title = await page.title();
        console.log('Page title is:', title);

        // Optional assertion
        await expect(title).toContain('Google');

        console.log('Test completed successfully!');
      }
    }
  }
}

const testMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBc7ILIEMDGALAlgHZgB0symATsgMQByAogBoAqA2gAwC6ioADgHtY+ZPgGFeIAB6IAjABZZJABwB2AEwdZHeQDYArBw761AGhABPRMt0lts1co6rHy-QE5l6gL6-zhAQg4SVRyLDwiMElBYVFxSRkEAFp1ZRJ1AGYM5w4s5Vl3XV1VXXMrZLTXXQKjQ315VVkMvxBQjBwCYjIKamihETEJJGk5dxIS3Xd1QuqnLPV5MsRVMd1FDl1leWzNxRa28M7SMEIIPtjBhMQFtIWFDMz9DNkFDmUlhEcSDPcHjP1ZE5Gtt5L5fEA */
  id: 'testMachine',
  predictableActionArguments: true,
  initial: 'start',
  context: {
    testContext: 'sampleTestContext'
  },
  states: {
    "start": {
      description: "todo: ?",
      meta: states.start.meta,
      on: {
        "NEXT": {
          description: "todo: ?",
          target: "end"
        }
      }
    },
    "end": {
      description: "todo: ?",
      type: "final"
    }
  }
})

const testModel = createModel(testMachine, {
  events: {
    "NEXT": async (page, type) => {
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
    test.describe(plan.description, () => {
      plan.paths.forEach(path => {
        // console.log("path: ", path.description);
        test(path.description, async ({ page }) => {
          const service = interpret(testMachine).start();
          
          // service.onTransition(state => {
          //   console.log("state: ", state);
          //   console.log("state: ", state.value);
          // });

          await path.test(page);

          service.stop();
        });
      });
    });
  });
});

// it('should have full coverage', () => {
//   return testModel.testCoverage();
// });