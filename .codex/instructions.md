
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



