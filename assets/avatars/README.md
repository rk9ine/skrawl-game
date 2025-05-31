# Custom Avatars

This folder contains custom avatar images for the Skrawl app.

## Instructions

1. Add your custom avatar images here with the following naming convention:
   - `avatar_cat.png`
   - `avatar_dog.png`
   - `avatar_robot.png`
   - `avatar_alien.png`
   - `avatar_wizard.png`
   - `avatar_ninja.png`
   - `avatar_pirate.png`
   - `avatar_knight.png`

2. **Image Specifications:**
   - Format: PNG, JPG, or GIF (GIFs will animate automatically!)
   - Size: 128x128px or 256x256px (square)
   - Background: Transparent or solid color
   - Style: Consistent with your app's design
   - GIF Notes: Keep file size reasonable (<500KB) for smooth performance

3. **Current Status:**
   - ✅ `avatar_pirate.gif` - Pirate character (animated GIF)
   - ✅ `avatar_cat.gif` - Cat character (animated GIF)
   - ✅ `avatar_dog.gif` - Dog character (animated GIF)
   - ✅ `avatar_laugh.gif` - Laughing expression (animated GIF)
   - ✅ `avatar_ninja.gif` - Ninja character (animated GIF)
   - ✅ `avatar_sad.gif` - Sad expression (animated GIF)
   - ✅ `avatar_shocked.gif` - Shocked expression (animated GIF)
   - ✅ `avatar_smile.gif` - Smiling expression (animated GIF)
   - ✅ `avatar_upset.gif` - Upset expression (animated GIF)
   - ✅ `avatar_weird.gif` - Weird expression (animated GIF)
   - ✅ `avatar_wizard.gif` - Wizard character (animated GIF)

   **Total: 11 animated GIF avatars + 12 fallback icon avatars = 23 total options**

   The ProfileSetupScreen is configured to use all these custom images with fallback to Ionicons for additional variety.

4. **Adding More Avatars:**
   To add more avatars, simply:
   - Add the image file to this folder
   - Update the `avatarOptions` array in `ProfileSetupScreen.tsx`
   - Add the require statement for your new image

## Current Avatar Options Structure

```javascript
const avatarOptions = [
  // Custom GIF avatars (your actual files)
  { id: '1', name: 'Pirate', image: require('../../../assets/avatars/avatar_pirate.gif') },
  { id: '2', name: 'Cat', image: require('../../../assets/avatars/avatar_cat.gif') },
  { id: '3', name: 'Dog', image: require('../../../assets/avatars/avatar_dog.gif') },
  { id: '4', name: 'Laugh', image: require('../../../assets/avatars/avatar_laugh.gif') },
  { id: '5', name: 'Ninja', image: require('../../../assets/avatars/avatar_ninja.gif') },
  { id: '6', name: 'Sad', image: require('../../../assets/avatars/avatar_sad.gif') },
  { id: '7', name: 'Shocked', image: require('../../../assets/avatars/avatar_shocked.gif') },
  { id: '8', name: 'Smile', image: require('../../../assets/avatars/avatar_smile.gif') },
  { id: '9', name: 'Upset', image: require('../../../assets/avatars/avatar_upset.gif') },
  { id: '10', name: 'Weird', image: require('../../../assets/avatars/avatar_weird.gif') },
  { id: '11', name: 'Wizard', image: require('../../../assets/avatars/avatar_wizard.gif') },
  // Plus 12 fallback icon avatars...
];
```
