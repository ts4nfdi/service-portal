
# Rules and guidelines

before starting:
- Ignore also these directories: `.next`, `out`, `playwright-report`, `test-results`

code structure:
- The components that holds app logic and rendering are in `app/`
- The UI resusable components are in `app/ui/`
- In `app/ui/` there are directories for each component.
- The `app/ui/commons` directory contains components that are used in multiple places.
- The `app/libs` directory contains the reusable code. These codes are not for UI components. Rather they are for the server components and server side logics.
- The `app/widgets` directory contains the reuasable widgets that are wrappers for `@ts4nfdi/terminology-service-suite` library widgets. 
- The `app/clientExports.tsx` file contains the client components exports.
- The `app/api` directory contains the the API calls to backend services.
- The `app/concepts` directory contains the application concepts. These are the schema that other components use. They are the middle layer betweeen the API calls and other components. We never expose API raw data to app components. The API calls must always return these concepts.


Stack:
- Next.js
- Tailwind CSS
- Playwright for E2E testing


# Instructions

General:
- always use typescript.
- Do not build the project unless asked to do so. Only check typescript errors and warnings.

CSS and styling:
- Always use Tailwind CSS
- prefer using classes and define the tailwind classes for it instead of using inline styles.
- Always define new tailwind classes for both light and dark modes.

Test:
- Never changing the app while writing tests.
- Test stragety is `End to End`. Do not focus on unit tests unless asked to do so in the spec or via the prompt.
- define a test for each end to end feature. Do not put all tests in one test case.
- Site has a cookie consent banner. Accept it before running the tests as it overlays the page.
- There is a `tests/libs.ts` file that contains common functions for reuse in the tests. check this for resuseable functions. Also if a new function is reusable, it should be added to this file.
- run test with `npm test`













