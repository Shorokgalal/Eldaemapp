# Fix: Voting History 30-Day Cycle Logic

## 🐛 Problem Identified

The voting history was showing the **last 30 calendar days** (counting backwards from today), but it should show the **30 days since the user joined/subscribed to the goal**.

### Wrong Logic (Before):
```
Today: Dec 2, 2025
Display: Nov 2 - Dec 2 (last 30 calendar days)
Square 1 = Nov 2, Square 30 = Dec 2
```

### Correct Logic (After):
```
User joined: Nov 1, 2025
Today: Dec 2, 2025 (Day 32 since joining)
Display: Nov 1 - Nov 30 (30-day cycle from join date)
Square 1 = Nov 1 (join date), Square 30 = Nov 30 (30th day after joining)
```

---

## ✅ Solution Applied

### 1. New Date Utility Functions

Created two new functions in `src/utils/date.ts`:

#### `getDaysFromStart(startDate, n)`
Generates N consecutive days starting from a specific date.

```typescript
export const getDaysFromStart = (startDate: Date, n: number): Date[] => {
  const days: Date[] = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < n; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }
  return days;
};
```

**Example:**
```javascript
// User joined Nov 1, 2025
getDaysFromStart(new Date('2025-11-01'), 30)
// Returns: [Nov 1, Nov 2, Nov 3, ..., Nov 30]
// Square 1 = Nov 1, Square 30 = Nov 30
```

#### `getDaysSinceStart(startDate, currentDate)`
Calculates which day number the user is on (1-indexed).

```typescript
export const getDaysSinceStart = (startDate: Date, currentDate: Date = new Date()): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // 1-indexed
};
```

**Example:**
```javascript
// User joined Nov 1, today is Dec 2
getDaysSinceStart(new Date('2025-11-01'), new Date('2025-12-02'))
// Returns: 32
// User is on Day 32, but cycle only shows first 30 days
```

---

### 2. Updated GoalDetails.tsx

#### Fetches Subscription Date
```typescript
// Fetch subscription to get join date
const subscriptionsQuery = query(
  collection(db, 'subscriptions'),
  where('userId', '==', user.uid),
  where('goalId', '==', id)
);
const subscriptionsSnapshot = await getDocs(subscriptionsQuery);

let joinDate = new Date(); // Default to today if no subscription
if (!subscriptionsSnapshot.empty) {
  const subData = subscriptionsSnapshot.docs[0].data();
  joinDate = subData.joinedAt?.toDate() || new Date();
}
```

#### Generates Cycle-Based Voting History
```typescript
// Generate 30 days starting from join date
const cycleDays = getDaysFromStart(joinDate, 30);
const currentDay = getDaysSinceStart(joinDate);

const votesData: VoteHistoryItem[] = cycleDays.map((date, index) => {
  const dateStr = date.toISOString().split('T')[0];
  const dayNumber = index + 1;
  
  // Only show squares up to current day
  if (dayNumber > currentDay) {
    return {
      date,
      vote: 'none' as const,
    };
  }
  
  const vote = votesByDate.get(dateStr) || 'none';
  return {
    date,
    vote: vote as 'yes' | 'no' | 'none',
  };
});
```

---

### 3. Updated GeneralHistoryPage.tsx

Same logic applied to the General History page for consistency.

---

## 📊 How It Works Now

### Example Scenario:

**User joins goal on November 1, 2025**

| Day # | Date | Display |
|-------|------|---------|
| 1 | Nov 1 | Square 1 (leftmost) |
| 2 | Nov 2 | Square 2 |
| 3 | Nov 3 | Square 3 |
| ... | ... | ... |
| 28 | Nov 28 | Square 28 |
| 29 | Nov 29 | Square 29 |
| 30 | Nov 30 | Square 30 (rightmost) |

**Today is December 2 (Day 32):**
- Cycle shows Days 1-30 (Nov 1 - Nov 30)
- Square 1 = Nov 1 (join date)
- Square 30 = Nov 30 (end of first cycle)
- User is currently on Day 32, but cycle only shows first 30 days

**Visual:**
```
Day 1  Day 2  Day 3  Day 4  ...  Day 28  Day 29  Day 30
Nov 1  Nov 2  Nov 3  Nov 4  ...  Nov 28  Nov 29  Nov 30
  🟢     🟢     🔴     ⚪   ...    🟢      🔴      🟢
```

---

## 🎯 Key Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Start Date** | Today minus 30 days | User's join/subscription date |
| **Square 1** | 30 days ago from today | Day 1 after joining |
| **Square 30** | Today | Day 30 after joining |
| **Logic** | Rolling 30-day window | Fixed 30-day cycle from join date |

---

## 🔍 Edge Cases Handled

### 1. User Beyond Day 30
If user is on Day 45:
- Only shows Days 1-30 (first cycle)
- Future feature: Could implement cycle 2, 3, etc.

### 2. No Subscription Found
Falls back to today as join date (shows just today)

### 3. User on Day 15
- Shows squares 1-15 (filled based on votes)
- Squares 16-30 are still visible but show as "not voted"

---

## 🧪 Testing

### Test Case 1: New User (Day 1)
```
Join Date: Today
Expected: Only Square 1 visible, rest gray
```

### Test Case 2: User on Day 10
```
Join Date: 9 days ago
Expected: Squares 1-10 show votes, 11-30 gray
```

### Test Case 3: User on Day 30
```
Join Date: 30 days ago
Expected: All 30 squares active and show votes
```

### Test Case 4: User Beyond Day 30
```
Join Date: 40 days ago
Expected: Shows Days 1-30 of first cycle
```

---

## 📝 Files Modified

1. **`src/utils/date.ts`**
   - Added `getDaysFromStart()` function
   - Added `getDaysSinceStart()` function

2. **`src/pages/GoalDetails.tsx`**
   - Fetches subscription date from Firestore
   - Uses cycle-based logic for voting history
   - Shows squares relative to join date

3. **`src/pages/GeneralHistoryPage.tsx`**
   - Same cycle-based logic applied
   - Consistent with GoalDetails

---

## ✅ Expected Behavior After Fix

1. **Square 1 = Day 1 after joining** (leftmost, oldest)
2. **Square 30 = Day 30 after joining** (rightmost, newest in cycle)
3. **Votes appear in correct squares** based on actual date within cycle
4. **Tooltip shows correct day number** (Day 1, Day 2, etc.) and date
5. **Works correctly regardless of when user joined**

---

## 🚀 What to Test

1. **Hard refresh** browser: `Cmd + Shift + R`
2. **Check voting history**:
   - Hover over Square 1 → Should say "Day 1: [Your join date]"
   - Hover over Square 30 → Should say "Day 30: [30 days after join]"
3. **Vote today** → Should appear in correct square based on your join date
4. **Inspect element** → Check `data-day` attribute matches tooltip

---

**The voting history now correctly shows the 30-day cycle from your subscription date!** 🎉
