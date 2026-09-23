# iPhone Safari Testing Guide for Packet PWA

## Overview

This guide covers testing Packet on iPhone Safari to ensure optimal PWA experience.

## Prerequisites

### Hardware Requirements
- iPhone with iOS 15+ (recommended: iOS 16+)
- Stable internet connection

### Software Requirements
- Latest iOS version
- Safari browser
- Optional: Xcode Simulator (for developers)

## Testing Checklist

### 1. PWA Installation & Launch

#### Installation from Safari
- [ ] Open Safari on iPhone
- [ ] Navigate to `https://packet-app.vercel.app`
- [ ] Tap Share button (📤)
- [ ] Scroll down and tap "Add to Home Screen"
- [ ] Tap "Add" in top right
- [ ] Verify icon appears on home screen

#### Launch from Home Screen
- [ ] Tap Packet icon on home screen
- [ ] Verify app launches in standalone mode (no Safari UI)
- [ ] Check status bar matches app theme (#8b5cf6)
- [ ] Verify orientation locked to portrait

### 2. Core User Flows

#### Adding a Restaurant from Instagram
- [ ] Copy Instagram post link
- [ ] Open Packet app
- [ ] Tap "+ Add" in navigation
- [ ] Paste link in input field
- [ ] Verify restaurant name extraction (mock for now)
- [ ] Fill additional details
- [ ] Tap "Save Place"
- [ ] Verify place appears in list

#### Adding a Restaurant from Threads
- [ ] Repeat above with Threads link
- [ ] Verify platform detection works

#### Manual Entry
- [ ] Tap "+ Add"
- [ ] Don't paste link (or paste invalid URL)
- [ ] Verify manual entry mode activates
- [ ] Type restaurant name manually
- [ ] Save and verify

#### Browsing Places
- [ ] Tap "Places" in navigation
- [ ] Verify list loads
- [ ] Test scrolling performance
- [ ] Tap on place card
- [ ] Verify detail view (if implemented)
- [ ] Test category filtering
- [ ] Test search functionality

#### Map View
- [ ] Tap "Map" in navigation
- [ ] Allow location access when prompted
- [ ] Verify map loads with markers
- [ ] Test zoom gestures (pinch)
- [ ] Test pan gestures
- [ ] Tap on marker
- [ ] Verify popup with place info
- [ ] Test "Locate me" button

#### Statistics
- [ ] Tap "Stats" in navigation
- [ ] Verify all statistics load
- [ ] Test scrolling
- [ ] Verify leaderboard calculations
- [ ] Check category breakdowns

#### Pairing
- [ ] Tap "Pair" in navigation
- [ ] Generate pair code
- [ ] Verify QR code generates
- [ ] Test copy code functionality
- [ ] On second device, enter pair code
- [ ] Verify pairing success

### 3. Mobile-Specific Testing

#### Touch Interactions
- [ ] All buttons have adequate touch target (min 44×44px)
- [ ] Input fields are easy to tap
- [ ] No accidental taps on close elements
- [ ] Swipe gestures work where applicable

#### Keyboard Handling
- [ ] Input fields bring up correct keyboard type
- [ ] Keyboard doesn't hide important content
- [ ] Form submission works with keyboard "Done"
- [ ] Tap outside closes keyboard

#### Safe Areas & Notch
- [ ] Content doesn't hide under notch
- [ ] Bottom navigation above home indicator
- [ ] Status bar content readable
- [ ] No overlapping with rounded corners

#### Performance
- [ ] App loads within 3 seconds
- [ ] Smooth scrolling (60fps)
- [ ] No janky animations
- [ ] Images load quickly
- [ ] Map tiles load efficiently

### 4. PWA-Specific Testing

#### Offline Functionality
- [ ] Turn on Airplane Mode
- [ ] Reload app
- [ ] Verify app loads (cached)
- [ ] Test adding place offline
- [ ] Turn off Airplane Mode
- [ ] Verify sync occurs

#### Service Worker
- [ ] Open Safari DevTools (via Mac)
- [ ] Check service worker registration
- [ ] Verify cache storage
- [ ] Test update flow

#### App Manifest
- [ ] Verify `manifest.json` loads
- [ ] Check theme color matches
- [ ] Verify icons correct sizes
- [ ] Test display modes

### 5. iOS Safari Quirks

#### Known Issues to Test

**Viewport Height**
- [ ] 100vh includes browser chrome
- [ ] Content doesn't jump on scroll

**Pull-to-Refresh**
- [ ] Disabled in standalone mode
- [ ] If enabled, doesn't break app state

**Safari Specific CSS**
- [ ] `-webkit-overflow-scrolling: touch` on scrollable elements
- [ ] `-webkit-tap-highlight-color` on buttons
- [ ] `touch-action` properties set correctly

**Date/Time Inputs**
- [ ] Native date pickers work
- [ ] Time zone handling correct

### 6. Accessibility Testing

#### VoiceOver
- [ ] Enable VoiceOver in Settings
- [ ] Navigate app with swipe gestures
- [ ] Verify all elements have labels
- [ ] Logical reading order
- [ ] No unlabeled interactive elements

#### Dynamic Type
- [ ] Increase text size in Settings
- [ ] Verify app scales properly
- [ ] No text truncation
- [ ] Layout remains usable

#### Color Contrast
- [ ] Use Color Contrast Analyzer
- [ ] Verify WCAG AA compliance
- [ ] Test in different lighting conditions

### 7. Network Conditions Testing

#### Slow Network (3G)
- [ ] Use Network Link Conditioner (developer)
- [ ] Test app loading
- [ ] Verify graceful degradation
- [ ] Loading states visible

#### Intermittent Connectivity
- [ ] Toggle Airplane Mode rapidly
- [ ] Verify sync handles disconnects
- [ ] No data loss

### 8. Storage Testing

#### Local Storage Limits
- [ ] Add 100+ places
- [ ] Verify performance remains good
- [ ] Test export/backup functionality

#### Data Persistence
- [ ] Force quit app
- [ ] Reopen - verify data intact
- [ ] Clear Safari cache
- [ ] Verify PWA data persists

### 9. Battery & Performance

#### Battery Impact
- [ ] Monitor battery usage
- [ ] Background sync efficient
- [ ] No excessive CPU usage

#### Memory Usage
- [ ] Check memory in DevTools
- [ ] No memory leaks
- [ ] GC runs properly

### 10. Cross-Device Testing

#### iPhone Models
- [ ] iPhone SE (small screen)
- [ ] iPhone 13/14 (standard)
- [ ] iPhone Pro Max (large screen)
- [ ] Verify all screen sizes

#### iOS Versions
- [ ] iOS 15 (minimum)
- [ ] iOS 16
- [ ] iOS 17 (latest)

## Testing Tools

### Developer Tools

#### Safari Web Inspector (Mac required)
1. Connect iPhone to Mac via USB
2. Enable Web Inspector on iPhone: Settings → Safari → Advanced
3. On Mac: Safari → Develop → [Device Name]

#### Simulators (Xcode)
```bash
# Available simulators
xcrun simctl list devices
# Launch specific simulator
open -a Simulator --args -CurrentDeviceUDID [UDID]
```

### Online Testing Services

#### BrowserStack
- Real iPhone devices
- Interactive testing
- Screenshot comparisons

#### LambdaTest
- Similar to BrowserStack
- Automated testing options

#### Responsively App
- Local responsive testing
- Multiple viewports side-by-side

## Test Automation

### Playwright Configuration for iOS
```javascript
// playwright.config.js
const { devices } = require('@playwright/test');

module.exports = {
  projects: [
    {
      name: 'iPhone Safari',
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit',
      },
    },
  ],
};
```

### Test Script Example
```javascript
// tests/iphone.spec.js
test('Add place on iPhone', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Add');
  await page.fill('input[placeholder="Paste link"]', 'https://instagram.com/p/sample');
  await page.click('text=Next');
  await page.fill('input[placeholder="Restaurant name"]', 'Test Restaurant');
  await page.click('text=Save Place');
  await expect(page.locator('text=Test Restaurant')).toBeVisible();
});
```

## Common Issues & Solutions

### Issue: PWA not installing
**Solution**: 
- Verify `manifest.json` served with correct MIME type
- Check `start_url` is same origin
- Ensure service worker scope includes whole app

### Issue: White flash on launch
**Solution**:
- Add splash screen in `manifest.json`
- Preload critical resources
- Use app shell architecture

### Issue: Keyboard hides input
**Solution**:
```css
/* Scroll input into view */
input:focus {
  scroll-margin-top: 100px;
}
```

### Issue: 100vh includes browser chrome
**Solution**:
```css
/* Use dvh units */
height: 100dvh;

/* Or JavaScript fallback */
const setVh = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};
```

### Issue: Pull-to-refresh in standalone
**Solution**:
```javascript
// Disable overscroll
document.body.style.overscrollBehavior = 'none';
```

## Performance Metrics Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## Security Testing

### Data Protection
- [ ] Local storage encrypted
- [ ] No sensitive data in URLs
- [ ] HTTPS enforced

### Privacy
- [ ] Location permission requested appropriately
- [ ] Clear privacy policy
- [ ] Data deletion available

## Regression Testing

### After Updates
1. [ ] Test all core flows
2. [ ] Verify PWA still installs
3. [ ] Check service worker updates
4. [ ] Test data migration (if any)

### Browser Updates
- [ ] Test with Safari Technology Preview
- [ ] Monitor WebKit release notes
- [ ] Update polyfills if needed

## User Acceptance Testing (UAT)

### Test with Real Users
1. **Ronald** (technical)
   - [ ] Test advanced features
   - [ ] Verify sync works
   - [ ] Check performance

2. **Kerry** (non-technical)
   - [ ] Test intuitive design
   - [ ] Verify easy onboarding
   - [ ] Check error messages helpful

### Feedback Collection
```javascript
// Simple feedback mechanism
const showFeedback = () => {
  if (localStorage.getItem('feedback_shown')) return;
  
  setTimeout(() => {
    const usedApp = confirm('Enjoying Packet? Tap OK for quick feedback!');
    if (usedApp) {
      // Open feedback form
    }
    localStorage.setItem('feedback_shown', 'true');
  }, 10000);
};
```

## Deployment Checklist

Before marking testing complete:

- [ ] All core flows work on iPhone Safari
- [ ] PWA installs correctly
- [ ] Performance targets met
- [ ] Accessibility requirements satisfied
- [ ] No critical bugs remaining
- [ ] User feedback incorporated

## Maintenance

### Ongoing Testing
- Monthly regression tests
- Test with new iOS versions
- Monitor error reports
- Performance monitoring

### Analytics
```javascript
// Track PWA metrics
const metrics = {
  installed: window.matchMedia('(display-mode: standalone)').matches,
  launchCount: localStorage.getItem('launch_count') || 0,
  offlineUsage: navigator.onLine ? 'online' : 'offline'
};
```

## Support Contacts

### Technical Issues
- Developer: [Your Contact]
- Supabase: support@supabase.com
- Cloudflare: community.cloudflare.com

### User Support
- Help documentation in app
- Email support: support@packet-app.com
- In-app feedback form

---

*Last Updated: September 22, 2026*  
*Tested iOS Versions: 15-17*  
*Target Devices: iPhone SE to iPhone 15 Pro Max*