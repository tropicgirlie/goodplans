---
name: Us & About
description: A Dublin social planner with illustrated invitations and a scrapbook-inspired web interface.
colors:
  primary: "#b93825"
  primary-hover: "#c24533"
  coral: "#e94f38"
  violet: "#62539b"
  blue: "#2558b6"
  pink: "#f29ec2"
  orange: "#f68a37"
  cream: "#fff0ca"
  paper: "#fffaf0"
  ink: "#23221b"
  muted-ink: "#665e50"
  rule: "#dbc898"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(3.8125rem, 7.5vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-.035em"
  heading:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  action:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: ".75rem"
    fontWeight: 700
    lineHeight: 1.4
  stamp:
    fontFamily: "DM Mono, monospace"
    fontWeight: 500
rounded:
  square: "0px"
  small: "4px"
  menu: "8px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "12px 18px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "12px 18px"
  text-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    height: "44px"
    padding: "11px 12px"
  idea-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "{spacing.xl}"
  category-tag:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "5px 8px"
  nav-link:
    textColor: "{colors.ink}"
    height: "44px"
---

## Overview

Us & About pairs the warmth of a paper invitation with the clarity people need to settle a date, check a venue, or reply. Cream backgrounds and ink outlines hold together the cut-paper illustration, red actions, and violet lettering. Keep the illustrations at moments where people imagine or share a plan. Let fields, dates, and response states carry the planning screens.

The web brand combines the illustrated calendar and map pin with the lowercase **us & about** wordmark. The custom violet ampersand belongs to the wordmark. Use the accessible name **Us & About** when the wordmark appears on its own and **Us & About home** when it links home. The native app uses the same calendar illustration as its app icon.

The CSS is the runtime source for the web tokens. See [brand and type tokens](src/index.css), [planner and invitation styles](src/planner.css), and [the shared wordmark](src/components/BrandLogo.jsx).

## Colors

| Role | Use |
| --- | --- |
| Cream and paper | Cream for the page, paper for invitations, cards, and fields. |
| Ink and muted ink | Ink for copy and outlines. Muted ink for secondary text and form hints. |
| Red (`--hot`) and coral (`--coral`) | Red with white text for the main action. The header action lightens to `--hot-hover` on hover. Coral is used for accents. |
| Violet (`--olive`) and blue (`--blue`) | Violet for the ampersand, headline emphasis, and Material selection. Blue for links and public-page keyboard focus. |
| Pink and orange | Pink for selected options and offset edges. Orange for the edge of a featured invitation. |
| Rule | Quiet separators on cream and paper. Use ink for controls that need a clearly visible boundary. |

Use a visible outline for keyboard focus. The public site uses a blue `3px` outline with a `4px` offset. The planner uses a warm outline, and Material fields show violet focus within the control. Pair state color with a label, underline, checkmark, or other visible change.

## Typography

| Role | Rule |
| --- | --- |
| Wordmark | Bricolage Grotesque at 750, with a custom ampersand that scales with the letters. The standard header uses `23px`, with an `18px` version on narrow phones. |
| Homepage display | Bricolage Grotesque at 800 and 92% width. The second line is lighter and violet. On phones the scale becomes `clamp(2.5rem, 13.5vw, 4.75rem)`. |
| Titles | Bricolage Grotesque at 650 for the planner, discovery, newsletter, and service pages. Use 700 for major homepage sections. Balance short headings and let event titles wrap naturally. |
| Reading and interaction | DM Sans at 400 for prose, 600 for actions, and 700 for short labels. Use `1rem` for reading copy and phone form fields. Keep long prose to about `65ch`. |
| Stamps | DM Mono at 500 for functional counters, venue indexes, or compact date labels. Use DM Sans for instructions, filters, and navigation. |

`--font-heading`, `--font-body`, and `--font-stamp` are the shared font stacks. Keep the typefaces self-hosted. The [font declarations](public/fonts/fonts.css) load a single variable Bricolage file with weight and width ranges. The browser adjusts its optical size as the heading grows. See the [upstream font and license](https://github.com/ateliertriay/bricolage/tree/84745e5b96261ae5f8c6c856e262fe78d1d6efdd) and [local license](public/fonts/bricolagegrotesque-OFL.txt).

## Elevation

Use crisp offset edges on the surfaces that look like pieces of paper. Homepage idea cards use an ink `5px 5px` offset and the planner dialog uses a pink `5px 5px` offset. Primary planner actions use a smaller ink `3px 3px` offset. Fields and navigation sit flat, and the header action stays flat on hover. Offsets have zero blur.

## Components

| Component | Specification |
| --- | --- |
| Primary and secondary buttons | In the planner, use a red filled pill for the next action and a paper pill for the alternate action. Both have an ink outline and a `44px` minimum target. Show disabled and saving states with the button’s behavior and label. |
| Fields and dropdowns | Place a visible label above the field. Use paper and a `1.5px` ink border in the planner. Use the existing Material dropdown for choice lists. It provides keyboard navigation, typeahead, a `4px` field radius, and `48px` menu rows. Put any error beside its field and associate it programmatically. |
| Cards and tags | Use square paper cards with ink outlines for saved plans and homepage ideas. Use compact pink category tags in the planner. Keep the text label visible for each selected category. |
| Navigation | Keep the brand and primary action aligned on one row. At `1250px` and below, the link group moves to a second scrollable row. Links use `13px` DM Sans at 600 on the homepage and 400 in the workspace. Workspace links underline the active page. Use links for navigation and buttons for actions. |
| Dialogs | Use the existing plan dialog with a paper surface and pink offset. The compact dialog is capped at `480px` and the expanded dialog at `720px`. On phones it fits inside the viewport with a `10px` margin on each side. Keep the title, close control, and save action easy to reach. |
| Invitations | Use the illustrated invitation layout with the host name, time, venue, and response visible as text. Preserve the image’s aspect ratio and let the layout reflow from phone to desktop. Keep ticket links separate from RSVP controls. |

The shared dropdown lives in [MaterialSelect](src/components/MaterialSelect.jsx). The public example and its interactive controls live in [AffinityMatchMatrix](src/components/AffinityMatchMatrix.jsx). Use reduced-motion preferences for transitions and retain native keyboard and focus behavior.

## Do's and Don'ts

- Give each screen a clear heading and one main action. Add a section label when it identifies a task, a collection, or a real step.
- Use the illustrated brand where it helps people picture an outing. Give forms and guest lists room to breathe.
- Check a narrow phone width and keyboard focus when changing a shared component. Verify that long guest names, titles, and locations can wrap.
- Avoid the look of a generic corporate events directory or nightlife-only feed. Show a range of outings and use the existing palette throughout.
- Avoid gender stereotypes in illustrations, categories, and suggestions. Use the interests and context people choose for themselves.
