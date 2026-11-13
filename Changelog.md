# Changelog

## 11/12/2026
Title system and small UI changes.

- Added a title system with over 50 titles to unlock, each with varying requirements.
  - Some titles are hidden by default and have multiple requirements to unlock them.

- Added a modal in the user dashboard to integrate the title system.

- Updated all user components that feature a title to use the new title badge component instead of that placeholder Member badge.

- Updated the site background with a gradient and images.
  - Gradient color depends on the theme used.
  - Coco and Ropa featured to fill in empty space on the sides for larger screens.
    - Since they're the beauty shop NPCs, I thought it would be fitting to find a use for their portraits since they're not seen in-game anymore.

- Added a slight background gradient for the footer.

## 11/9/2026
Changes to the submission page component and other things.

- Integrated an image "carousel" to replace the old flex box.
  - This works better for the new gallery images, previously all the images were mapped to 9/16 aspect ratio.

- Added indicators to the submission uploading & updating, and user signup.
  - Respective buttons for confirmation should now show text for better user feedback on processing.

- Added more options to dropdown for my styles tab in dashboard.
  - You can now delete (softly), unlist, and relist submissions.

- Fixed z-index on the tags dropdown so it doesn't get overlapped by the X buttons on the card images.

## 11/8/2026
Updated image handling for the submission uploading and follow displays.

- Added two new components for managing images in the submissions.
  - Card images are handled with one component, max images is 2.
  - Other gallery images are handled with another component, max images is 3, requires all card image slots to be used.
  - The new components allow users to remove specific images. Previously, they would need to reselect all images again if they wanted to remove any.
  - This also allows users to share full-sized images if they want to show more scenery or whatnot, something that the previous handling prevented.

- Updated the user nameplate component with a better layout.
  - This is also utilized for showing the user's followers and who the user is following.

- Added display modals in the user profile for followers and following.
  - Those will show up when you click the respective containers in the profile header.

- Populated the tabs for followers and following in the user dashboard.
  - If you don't have any followers or you're not following anyone, respective messages will appear instead.

- Fixed the avatar update logic, forgot to correct the user variable. Avatars work now.

## 11/7/2026
Small fixes and changes.

- Fixed the refresh when a user's on the dashboard and logs out.
  - Properly redirects back to login now.

- Changed the column count in dashboard for styles and favorites to always be 5 columns.

- Added the views count when fetching submissions in the gallery.

## 11/6/2026
Dashboard update and other minor site tweaks.

- Started building out the new dashboard.
  - Currently, it functions with managing your style submissions and favorites.
  - Still in the process of deciding how to implement the user profile editor.
  - Also need to create a component for followers/following. Might reuse the nameplate found on submission pages.

- Added status badges for the style cards in under My Styles tab if the submission's not approved.

- Changed the buttons for pagination in the gallery.
  - Switched them from text saying Previous/Next to left/right chevron icons.

- Removed the scaling effect on the style cards, replaced it with an outline glow.
  - This was mainly to introduce the dropdown menu for the cards inside the dashboard.

- Changed the text regarding the profile in the user collapse, switched from View Profile to Public Profile.

- Modified the user collapse to show or hide the menu using the entire component rather than the avatar.
  - Also added the placeholder title to give it more character.

- Added views to the submissions table, and an associated icon and value to the GalleryCard

## 11/4/2026
Small error fix.

- Fixed an error with news posting when assigning to the admin that I didn't catch. Super small, but super annoying.

## 10/29/2026
Small changes.

- Updated color transition duration for theme change and button.
  - Now it switches instantly.
  - Click wisely.

- Updated changelog to include previous changes done before the site went up and running on October 1st.
  - I need to make note of updating this more frequently.

## 10/28/2026
We can edit submissions now, yay!

- Added a submission edit page.
  - Basically the upload page minus anything related to the images... because I don't want that function implemented yet.

- Fixed the filter with pending pages where it would deny even the style's creator from viewing it.

- Modified the navigation so that the search bar is always displayed, placed underneath the UserCollapse.

- Updated top margin for the layout to add some space between so that the search bar isn't cramped.

- Changed the gap size on the home page so that all components are closer together, reduce the amount of empty space.

- Removed the rounded corners on all containers, exception is anything that is interacted with like buttons and gallery cards.


## 10/26/2026
Small change.

- Moved equipment display and description in submission page under one column to remove the empty space.

That's it.

## 10/14/2026
Reorganized the user settings page.

- Changed organization of certain components.
  - Moved password changing to security tab.
  - Moved profile editing to account settings.

- Enhanced the styling of login and signup pages to reflect the light/dark theming.

- Changed the response whenever a password or username is updated, removed modals.

## 10/13/2026
Little changes for site responsiveness.

- Changed timeout times for all page components so that they display much quicker.

- Fixed scroll position whenever a component is mounted, forced to the top on page change.

## 10/12/2026
Site fixes and changes.

- Added light/dark themes to the website, button to change between in the navigation.

- Implemented following functionality, added displays to the user profile.

- Fixed avatar ID handling and modified the profile data response in the endpoint.

- Fixed handling of new profiles whenever a new user is registered.

## 10/11/2026
Small feature update and UI changes.

- Implemented avatars for users.

- Modified the navigation bar UI, in particular the user collapse on the right side.

- Added the ability to show/hide the search bar, hidden by default.

- Updated the styling to be more global to the UI and better incorporate the search bar when shown.

## 10/4/2026
Minor updates.

- Implemented a search bar that queries relative to string matching.

- Updated the login to align more to SPA routing rather than force a refresh.

## 10/3/2026
Improvements and more fixes.

- Implemented Alembic for database table data preservation and schema updating.

- Added password updating functionality, username confirmation modal to User Settings.

- Fixed user registration checks for passwords.

- Fixed displayed joined date on user profiles.

## 10/1/2026
Website, API, and database are hosted, up and running. Woohoo!

- Fixed environment variable usages.

- Updated URLs for all fetches, specifically with image fetching.

- Fixed cookie settings when logging in and out, especially so users can properly log out.

- Just fixed a lot of break-in bugs.

### Changelog from here on is guessed based on commit history.

## 9/14/2026
Updated profile management, submission page.

- Enhanced the profile updating functionality.

- Added username availability check to the settings page.

- Modified some containers for submission information inside the submission page.

## 9/9/2026
New components for users.

- Added a new table for user profiles.

- Added components for a user profile, settings pages, user dashboard.

- Implemented session check so that associated components are only available to respective and logged in users.

## 9/7/2026
Few changes and enhancements with submissions and admin work.

- Implemented functionality for approval and rejection of submissions.

- Added more information for equipment, in this case part colors.

- Added function to inflate a submission's image and display it in full size within a modal.

## 9/6/2026
Updates with gallery, admin-related things.

- Created an admin dashboard and associated router & endpoints for... admin stuff.

- Added things for admin dashboard... yeah.

- Changed the file structure for gallery components, updated respective imports.

- Added a ComboBox for tags in the gallery specifically for tag querying.

- Changed the redirect when logging in.

## 9/2/2026
Minor changes for registration, favorites, logout.

- Updated the registration endpoint's algorithm to use Form rather than OAuth2 password form, clean up.

- Updated error handling for the sign up page, modified auth context and provider to reflect.

- Changed the navigation logic for when a user logs out.

- Added a count for favorites.

## 9/1/2026
More updates and some fixes.

- Changed the equipment handling for weapon slots.

- Added miscellaneous routing to the API.

- Implemented a ComboBox for tags, links for tags on the submission page that redirect and query in gallery.

- Fixed loading state handling for the UserCollapse.

- Updated the signup page with logic for registering and form validation, added unique username check.

- Updated login logic to handle wrong email and/or password.

- Updated authentication context and provider to handle the new logic.

## 8/29/2026
Auth update for users, some other changes.

- Added context and provider for user authentication.

- Created endpoints to support login and logout.

- Updated the frontend for supporting authentication-related features.

- Integrated equipment searching to the equipment accordion.

- Enhanced the submission uploading with new metadata.

- Added functionality for submission favoriting.

- Organized endpoints into respective routing files for the API.

- Removed deprecated components.

## 8/24/2026
The Tags update.

- Added a new ORM model BaseTags for a base tags table.

- Added new endpoints to support tag querying.

- Updated any state handling for equipment accordions and the overall submission upload page.

- Fixed the Sort By state to default to "newest" in all undercase.

## 8/23/2026
Small updates to .gitignore, gallery page and submission components.

- Added pycache to .gitignore.

- Added more filters to gallery.

- Fixed some styling in the gallery and submissions.

## 8/22/2026
Created GitHub repository and pushed.

At this point, only some things are implemented.

- Gallery displays submissions.

- Submission upload with images and basic equipment accordions working.

- Submission images held in respective folder for time being.

- Submission page working.