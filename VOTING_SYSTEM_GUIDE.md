# Voting System - Complete Implementation Guide

## 📋 Overview

This document explains the complete voting system logic implemented in the Eldaem app. The system manages daily voting cycles over 30-day periods with reflection capabilities and automatic renewal.

---

## 🎯 Core Requirements

### 1. **One Vote Per Day**
- Users can vote **once per day** (either YES ✅ or NO ❌)
- Once voted, the vote buttons are disabled for the rest of the day
- Vote is locked at midnight and a new voting opportunity begins

### 2. **Reflection Rules**
- **Can add reflection with both YES and NO votes**
- **Quantity input only available for YES votes**
- **Reflection form stays open until end of day**
- User can add reflection anytime during the day after voting
- Once reflection is added, form closes until next vote

### 3. **30-Day Cycles**
- Each goal subscription starts a 30-day cycle from the **joining day** (Day 1)
- Voting is available for exactly 30 days
- Day 1 = Joining date, Day 30 = 30th day after joining
- After Day 30, voting stops and renewal form appears

### 4. **Renewal After 30 Days**
- When 30 days complete, a renewal form appears automatically
- **Three required questions:**
  1. "What is this cycle and why?"
  2. "When will you work on this goal?"
  3. "What do you want to achieve in this 30 days?"
- After renewal, a new 30-day cycle starts (Cycle 2, Cycle 3, etc.)
- Vote history resets for the new cycle

---

## 🗂️ Database Schema

### Subscriptions Collection
```typescript
{
  id: string;
  userId: string;
  goalId: string;
  joinedAt: Date;              // Original join date
  status: 'active' | 'paused' | 'completed';
  currentCycle: number;         // 1, 2, 3, etc.
  cycleStartDate: Date;         // Start date of current cycle
  joinAnswers?: {
    why: string;
    when: string;
    what: string;
  };
}
```

### Votes Collection
```typescript
{
  id: string;
  userId: string;
  goalId: string;
  subscriptionId: string;       // Link to subscription
  cycleNumber: number;          // Which cycle this vote belongs to
  vote: 'yes' | 'no';
  date: Date;                   // Vote timestamp
  quantity?: number;            // Only for 'yes' votes
  hasReflection?: boolean;      // Whether user added reflection
}
```

### Renewals Collection (New)
```typescript
{
  id: string;
  userId: string;
  goalId: string;
  subscriptionId: string;
  cycleNumber: number;          // The new cycle number
  createdAt: Date;
  cycleWhy: string;             // Answer to question 1
  workSchedule: string;         // Answer to question 2
  goals: string;                // Answer to question 3
}
```

---

## 🔧 Implementation Details

### File Structure

```
src/
├── components/
│   ├── forms/
│   │   ├── ReflectionForm.tsx     ✅ Updated - handles optional reflection
│   │   └── RenewalForm.tsx        🆕 NEW - 30-day renewal form
│   └── layout/
│       └── BottomActionBar.tsx    ✅ Updated - daily vote logic
├── pages/
│   ├── GoalDetails.tsx            ✅ Updated - main voting page
│   └── JoinRequest.tsx            ✅ Updated - initialize cycle fields
├── types/
│   └── goal.types.ts              ✅ Updated - added cycle types
└── locales/
    ├── en/translation.json        ✅ Updated - added translations
    └── ar/translation.json        ✅ Updated - added translations
```

---

## 📱 User Flow

### First Time Joining a Goal

1. **User clicks "Join" on a goal**
2. **Fills join request form** (why, when, what)
3. **Subscription created** with:
   - `joinedAt = now`
   - `currentCycle = 1`
   - `cycleStartDate = now`
4. **Redirected to GoalDetails page**
5. **Can vote immediately** (Day 1 starts)

### Daily Voting Process

#### Scenario A: User hasn't voted today
```
┌─────────────────────────────────────┐
│  Did you achieve your goal today?  │
│                                     │
│           [✅]      [❌]            │
└─────────────────────────────────────┘
```
- User sees question with YES/NO buttons
- Clicks one button
- Vote is saved immediately
- Reflection form appears

#### Scenario B: User voted but hasn't added reflection
```
┌─────────────────────────────────────┐
│   ✅ You voted today!               │
│                                     │
│   [Add Reflection]                 │
└─────────────────────────────────────┘
```
- User can add reflection anytime during the day
- Reflection form opens with:
  - Quantity input (only if voted YES)
  - Text area for reflection
  - Submit / Skip buttons

#### Scenario C: User voted and added reflection
```
┌─────────────────────────────────────┐
│   ✅ All done for today!            │
│   Come back tomorrow to vote again  │
└─────────────────────────────────────┘
```
- No actions available
- User must wait until next day

### Voting History Display

```
Day 1 → Day 2 → Day 3 → ... → Day 30
[✅]   [❌]    [⬜]         [⬜]
```

- **Green square (✅)**: Voted YES on that day
- **Red square (❌)**: Voted NO on that day
- **Grey square (⬜)**: No vote yet OR future day
- Squares display **left to right** (Day 1 to Day 30)
- Current day is the rightmost non-grey square

### After 30 Days - Renewal

When user opens GoalDetails after Day 30:

```
┌─────────────────────────────────────────┐
│  🎉 Start New 30-Day Cycle             │
│                                         │
│  Congratulations on completing your     │
│  cycle! Let's plan the next one.        │
│                                         │
│  Goal: [Goal Title]                     │
│                                         │
│  [Three text fields for questions]      │
│                                         │
│  [Start New Cycle]                      │
└─────────────────────────────────────────┘
```

After submitting renewal:
- `currentCycle` increments (2, 3, 4...)
- `cycleStartDate` = now
- Vote history resets (new 30-day grid)
- User can vote on Day 1 of new cycle

---

## 🎨 UI States

### BottomActionBar States

| State | Condition | Display |
|-------|-----------|---------|
| **Not voted** | `!hasVotedToday` | Question + YES/NO buttons |
| **Voted, no reflection** | `hasVotedToday && canAddReflection` | "You voted today" + Add Reflection button |
| **Voted with reflection** | `hasVotedToday && !canAddReflection` | "All done for today" message |
| **Just voted (local)** | `voted && !showReflection` | "Well done!" button |
| **Reflection form open** | `showReflection` | ReflectionForm component |

### ReflectionForm States

| Vote Type | Quantity Input | Text Area | Buttons |
|-----------|----------------|-----------|---------|
| **YES** | ✅ Visible | ✅ Optional | Submit / Skip |
| **NO** | ❌ Hidden | ✅ Optional | Submit / Skip |

---

## 🔒 Business Rules

### Vote Rules
1. ✅ One vote per day per goal
2. ✅ Cannot change vote after submission
3. ✅ Cannot vote on future days
4. ✅ Cannot vote before joining
5. ✅ Cannot vote after 30 days (must renew first)

### Reflection Rules
1. ✅ Reflection is optional for both YES and NO votes
2. ✅ Quantity only for YES votes (defaults to 0)
3. ✅ Can add reflection anytime during the day after voting
4. ✅ Once added, cannot add another reflection same day
5. ✅ Minimum 10 characters for renewal form answers

### Cycle Rules
1. ✅ Each cycle is exactly 30 days
2. ✅ Cycles count from 1 (Cycle 1, Cycle 2, etc.)
3. ✅ Must complete renewal form to start new cycle
4. ✅ Cannot skip cycles
5. ✅ Each cycle has independent vote history

---

## 🔍 Key Functions

### `getDaysSinceStart(startDate, currentDate?)`
```typescript
// Returns day number (1-indexed)
// Example: If startDate is Jan 1, today is Jan 5
// Returns: 5 (meaning Day 5)
```

### `getDaysFromStart(startDate, n)`
```typescript
// Returns array of n consecutive dates starting from startDate
// Example: getDaysFromStart(Jan 1, 30)
// Returns: [Jan 1, Jan 2, Jan 3, ..., Jan 30]
```

### `isSameDay(date1, date2)`
```typescript
// Checks if two dates are the same day (ignores time)
// Used to check if user voted today
```

---

## 🚀 Deployment Checklist

### Database Updates Required

You need to update Firestore with these changes:

1. **Update existing subscriptions** (if any):
```javascript
// Run this in Firebase Console or migration script
subscriptions.forEach(sub => {
  sub.currentCycle = 1;
  sub.cycleStartDate = sub.joinedAt;
});
```

2. **Update existing votes** (if any):
```javascript
// Run this in Firebase Console or migration script
votes.forEach(vote => {
  vote.subscriptionId = '[find subscription id]';
  vote.cycleNumber = 1;
  vote.hasReflection = false; // or check if reflection exists
});
```

3. **Create renewals collection**:
   - No action needed - will be created automatically when first renewal is submitted

4. **Update Firestore Rules** (Already done in previous session):
```javascript
match /renewals/{renewalId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

---

## 🧪 Testing Scenarios

### Test 1: First Vote
1. Join a new goal
2. Verify Day 1 square appears
3. Click YES or NO
4. Verify vote is saved
5. Verify reflection form appears

### Test 2: Add Reflection
1. After voting, add reflection text
2. If YES vote, add quantity
3. Click Submit
4. Verify reflection appears in feed
5. Verify "All done for today" message

### Test 3: Skip Reflection
1. After voting, click Skip
2. Verify vote is saved without reflection
3. Verify "Add Reflection" button available

### Test 4: Second Vote Same Day (Should Fail)
1. Vote once
2. Refresh page
3. Verify vote buttons are disabled
4. Verify appropriate message is shown

### Test 5: Vote on Day 2
1. Wait for next day (or change system date)
2. Visit goal page
3. Verify new vote buttons appear
4. Vote again
5. Verify Day 2 square is filled

### Test 6: 30-Day Completion
1. Complete 30 days of voting (or set cycleStartDate to 31 days ago)
2. Visit goal page
3. Verify renewal form appears
4. Fill all three questions
5. Submit renewal
6. Verify new cycle starts
7. Verify vote history reset

---

## 📊 Translation Keys

### English (`en/translation.json`)

```json
{
  "renewal": {
    "title": "Start New 30-Day Cycle",
    "subtitle": "Congratulations on completing your cycle! Let's plan the next one.",
    "question1": "What is this cycle and why?",
    "question2": "When will you work on this goal?",
    "question3": "What do you want to achieve in this 30 days?",
    "submit": "Start New Cycle"
  },
  "voting": {
    "alreadyVoted": "You have already voted today!",
    "votedToday": "You voted today!",
    "addReflection": "Add Reflection",
    "allDoneToday": "All done for today!",
    "comeBackTomorrow": "Come back tomorrow to vote again"
  },
  "goalDetails": {
    "wellDone": "Well done!",
    "quantity": "Add quantity"
  }
}
```

### Arabic translations are also complete in `ar/translation.json`

---

## 🐛 Known Limitations

1. **No vote editing**: Once voted, cannot change vote
2. **No cycle pausing**: Cannot pause a cycle midway
3. **No backfilling**: Cannot vote for past days
4. **Midnight timing**: Uses device time for day boundaries
5. **No cycle history UI**: Can't view previous cycles (data is saved though)

---

## 🔮 Future Enhancements

1. **Cycle History Page**: View all past cycles with statistics
2. **Vote Editing Window**: Allow changing vote within first hour
3. **Streak Tracking**: Highlight consecutive voting days
4. **Reminder Notifications**: Daily reminders to vote
5. **Cycle Analytics**: Success rate, completion patterns
6. **Export Data**: Download cycle reports
7. **Goal Templates**: Pre-filled renewal answers based on past cycles

---

## 💡 Tips for Users

1. **Set a reminder**: Vote at the same time each day
2. **Add reflections**: They help track your progress
3. **Be honest**: Voting NO is just as important as YES
4. **Review cycles**: Use renewal time to reflect on what worked
5. **Stay consistent**: Even on hard days, log your vote

---

## 📞 Support

For issues or questions:
- Check Firestore rules are deployed
- Verify subscription has `currentCycle` and `cycleStartDate` fields
- Check browser console for errors
- Ensure date utilities are working correctly

---

**Last Updated**: December 2, 2025
**Version**: 1.0
**Status**: ✅ Complete Implementation
