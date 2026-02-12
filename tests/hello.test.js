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
  /** @xstate-layout N4IgpgJg5mDOIC5QBc7ILIEMDGALAlgHZgB0symATsgMQByAogBoAqA2gAwC6ioADgHtY+ZPgGFeIAB6IAjADYALCVkcArBwAcWjgGYATB31q1AGhABPRJoDsJJcc36bNzbvm6AnAF9f5wgIQcJKo5Fh4RGCSgsKi4pIyCAC08uZWyfJ+IKEYOATEZBTU0UIiYhJI0oiK+mnWsiqasrYciroczU2aWTnh+aRghBAlseUJiPry8iS6zfI2np6Kih11CKr6JEYc8rJq8vqH+rKyvr5AA */
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