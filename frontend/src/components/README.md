# Component Organization Structure
```
components/
├── admin/
│   ├── AdminDashboard.tsx          // Admin dashboard page component
│   ├── DeletionSubs.tsx            // Component for sub deletion tab (Will likely delete or repurpose this)
│   ├── EquipManagement.tsx         // Component for equipment management tab (Need to rethink how this will work)
│   ├── PendingSubs.tsx             // Component for pending submissions tab (Accept, Reject for now)
│   └── TagManagement.tsx           // Component for tag management tab (Add new tags or deactivate existing tags)
├── gallery/
│   ├── Gallery.tsx                 // Gallery page component
│   ├── GalleryCard.tsx             // Gallery Card component (Used in a bunch of things now)
│   └── TagsComboBox.tsx            // ComboBox component for tags (Used for tag searching/filter)
├── navbartop/
│   ├── Navigation.tsx              // Fixed navbar at the top of the page
│   ├── SearchBarComboBox.tsx       // Absoluted search bar that's under the UserCollapse component
│   └── UserCollapse.tsx            // Shows the login/signup buttons or the active user with a dropdown for options
├── news/
│   ├── ArticlePage.tsx             // The news article component
│   ├── NewsCard.tsx                // The card-looking component found in the news page (Need to fix this)
│   ├── NewsPage.tsx                // Page component for showing all the news articles
│   └── NewsPanel.tsx               // Some panel component to show the recent news articles on home page
├── static/
│   ├── ABOUT.md                    // Markdown file for the about page (Placeholder AI slop, will eventually remove)
│   ├── About.tsx                   // About page component (Will redo it at some point)
│   ├── PRIPOL.md                   // Placeholder AI slop for the privacy policy (I need to edit this)
│   ├── PrivacyPolicy.tsx           // Page component for the privacy policy
│   ├── RULES.md                    // Placeholder AI slop for the rules (Need to edit this too)
│   ├── Rules.tsx                   // Page component for the site rules
│   ├── TermsConditions.tsx         // Page component for the terms and conditions
│   └── TNC.md                      // Placeholder AI slop for T&C (I don't know how to write this)
├── submission/
│   ├── CardImageHandler.tsx        // Handles images that will be displayed on the style's gallery card
│   ├── EquipmentAccordion.tsx      // The accordion component in the upload and editing pages for equips
│   ├── EquipmentComboBox.tsx       // ComboBox component inside the accordion for respective equip searching
│   ├── GalleryImageHandler.tsx     // Handles optional three images displays on the style's page
│   ├── PreviewCard.tsx             // Basically the gallery card but just for preview purposes
│   ├── SubmissionEdit.tsx          // Editing page for styles, basically the upload page without images handling
│   ├── SubmissionPage.tsx          // Page component for style submissions
│   ├── SubmissionUpload.tsx        // Uploading page for styles
│   └── TagsComboBox.tsx            // ComboBox component for handling tag searching
├── user/
│   ├── AccountSettings.tsx         // The account settings page component
│   ├── AvatarSettings.tsx          // Component specifically for handling user avatars
│   ├── DashboardDropdown.tsx       // Dropdown component used in the dashboard, mainly My Styles and Favorites cards
│   ├── LoginPage.tsx               // The login page component
│   ├── NewDashboard.tsx            // The current dashboard component (Should've renamed it to Dashboard.tsx but w/e)
│   ├── OAuthAccounts.tsx           // Component used in the settings, specifically for OAuth handling
│   ├── OAuthLoginAndRecovery.tsx   // Component used in login page for OAuth logins and password recovery w/ code
│   ├── PwChangeForm.tsx            // Ugly ass password changing form
│   ├── RecoveryCodeGen.tsx         // Component used in settings page, handles the recovery code (re)generation
│   ├── SignUpPage.tsx              // The sign up page component
│   ├── TitleBadge.tsx              // Title badge component used in UserCollapse, UserNameplate, UserProfile
│   ├── TitleModalBody.tsx          // Body component for the dialog modal for showing/changing your title
│   ├── UserNameplate.tsx           // Nameplate component used wherever I need to show the user
│   └── UserProfile.tsx             // The profile component
├── Footer.tsx                      // Footer component
├── Home.tsx                        // Home page component, idk I didn't feel like grouping it anywhere
├── Layout.tsx                      // Component for handling the page layout and the theme function
├── README.md (this)                // What you're looking at right now
├── UsersList.tsx                   // Page for just listing all of the active registered user accounts on the site
```