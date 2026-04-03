# Save Event System - Visual Guide

---

## System Architecture Diagram

```
                    APPLICATION LAYER
┌──────────────────────────────────────────────────────────┐
│                                                            │
│  Browser Window                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │                                                    │   │
│  │  App Component                                     │   │
│  │  ├─ GlobalSaveNotification (renders toast)        │   │
│  │  ├─ useSaveEventHandler (listens globally)        │   │
│  │  └─ Routes (all 8 log pages)                      │   │
│  │                                                    │   │
│  │  ┌─ BM Log ─────┐                                 │   │
│  │  │              │                                 │   │
│  │  │ Save → emit  │                                 │   │
│  │  │              │ saveEventManager.emit({         │   │
│  │  │ Update → emit│   type: 'save'|'update',       │   │
│  │  │              │   logType: 'bm'|...,          │   │
│  │  │              │   timestamp: ...              │   │
│  │  │              │ })                             │   │
│  │  └──────────────┘                                 │   │
│  │          ▲                                        │   │
│  │          │ Event emitted to all subscribers       │   │
│  │          │                                        │   │
│  │  ┌──────┴─────────────────────────────┐           │   │
│  │  │                                     │           │   │
│  │  │ useSaveEventHandler Hook            │           │   │
│  │  │ ─────────────────────────────────   │           │   │
│  │  │ 1. Subscribe to saveEventManager    │           │   │
│  │  │ 2. Receive event notification       │           │   │
│  │  │ 3. Build notification message       │           │   │
│  │  │ 4. Scroll to top smoothly           │           │   │
│  │  │ 5. Dispatch 'showSuccessNotif.'     │           │   │
│  │  │ 6. Reload page (1500ms delay)      │           │   │
│  │  │                                     │           │   │
│  │  └─────┬──────────────────────────────┘           │   │
│  │        │ Custom event: 'showSuccessNotification'  │   │
│  │        ▼                                          │   │
│  │  ┌─────────────────────────────────┐              │   │
│  │  │ GlobalSaveNotification          │              │   │
│  │  │ ─────────────────────────────── │              │   │
│  │  │ • Listen for custom event       │              │   │
│  │  │ • Display SuccessToast          │              │   │
│  │  │ • Auto-dismiss (3 seconds)      │              │   │
│  │  │                                 │              │   │
│  │  │  Toast (top-right corner)       │              │   │
│  │  │  ┌─────────────────────────┐    │              │   │
│  │  │  │ ✓ Food intake entry     │    │              │   │
│  │  │  │   saved successfully    │    │              │   │
│  │  │  │                      [X]│    │              │   │
│  │  │  └─────────────────────────┘    │              │   │
│  │  │                                 │              │   │
│  │  └─────────────────────────────────┘              │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└──────────────────────────────────────────────────────────┘

                    SERVICE LAYER
┌──────────────────────────────────────────────────────────┐
│                                                            │
│  saveEventManager (Singleton)                             │
│  ─────────────────────────────────────────────────────── │
│                                                            │
│  Listeners Set: {                                         │
│    useSaveEventHandler listener,                         │
│    (+ any other subscribers)                             │
│  }                                                        │
│                                                            │
│  Methods:                                                 │
│  • subscribe(listener) → unsubscribe function            │
│  • emit(event) → calls all listeners                     │
│  • clear() → removes all listeners                       │
│  • getListenerCount() → returns count                    │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │

STEP 1: User navigates to log page (e.g., BM Log)
        ↓
        Renders BMLog component
        └─ Form for logging entry

STEP 2: User fills form with entry data
        ├─ Bristol scale: 4
        ├─ Urgency level: 5
        ├─ Pain level: 1
        └─ Notes: "Everything normal"

STEP 3: User clicks "Save Entry" button
        ↓
        Form validation checks pass
        └─ All required fields filled

STEP 4: handleSubmit() function executes
        ├─ setError('') → Clear errors
        ├─ setMessage('') → Clear messages
        ├─ setSaving(true) → Show loading
        └─ Button text: "Saving..."

STEP 5: INSERT to Supabase (bm_logs table)
        ├─ Success: user_id, bristol_scale, etc.
        │  ├─ if (error) throw error → catch block
        │  └─ Continue to next step
        │
        └─ Failure: Return error
           └─ Show error message
              └─ Stay on page (no reload)

STEP 6: On Success - Emit Save Event
        │
        └─ saveEventManager.emit({
             type: 'save',
             logType: 'bm',
             timestamp: 1712045680000
           })
           ├─ Calls: setMessage(getSuccessMessage('bm'))
           ├─ Calls: setToastVisible(true)
           └─ (Local toast shown, but not used anymore)

STEP 7: Global Listener Triggered
        │
        ├─ buildNotificationMessage(event)
        │  └─ "Bowel movement entry saved successfully"
        │
        ├─ scrollToTop()
        │  └─ window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        │
        ├─ Dispatch custom event
        │  └─ new CustomEvent('showSuccessNotification')
        │
        └─ setTimeout(() => reloadPage(), 1500)
           └─ Schedule page reload

STEP 8: GlobalSaveNotification Component Receives Event
        │
        ├─ setMessage("Bowel movement entry saved successfully")
        ├─ setVisible(true)
        └─ Renders SuccessToast with message

STEP 9: User Sees Results
        ├─ Toast appears (top-right)
        ├─ Page scrolls smoothly to top
        ├─ Toast displays for 3 seconds
        │
        └─ After 1.5 seconds:
           ├─ Page reloads
           ├─ Form clears
           ├─ History refreshes
           └─ New entry visible

STEP 10: Entry Successfully Logged
         └─ Process complete ✓

```

---

## Event Emission Timeline

```
TIME    ACTION                          VISUAL FEEDBACK
────────────────────────────────────────────────────────────
0ms     User clicks "Save Entry"        Button: "Saving..."
        ↓
        Form submits
        ↓
        Validate & send to Supabase

50ms    Supabase responds (success)     (No visible change yet)
        ↓
        saveEventManager.emit() called

100ms   Event received by listener      Toast starts appearing
        ├─ Message built                (animation)
        ├─ Scroll initiated
        ├─ Custom event dispatched
        └─ Reload scheduled

200ms   Scroll animation begins         Page scrolls up
        Page scrolls from current       Toast fully visible
        position to top

400ms   Scroll animation completes      Page at top
        Toast displayed                 Toast shows message
                                        Example: "Bowel movement
                                                 entry saved
                                                 successfully"

1000ms  Toast still visible             Countdown visible
                                        (notification timer)

1500ms  Page reload triggered           Page reloading...
        (6.33 seconds after event)

2500ms  Toast auto-dismisses            (if still visible)
        (3 seconds from show)

4000ms  Page reload completes           New page loaded
        ├─ Form cleared                 Fresh form displayed
        ├─ History refreshed            New entry visible
        └─ Ready for next entry         in history section

```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         USER INPUT                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Log Page Form (e.g., BMLog.tsx)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ bristol_scale: 4                                     │   │
│  │ urgency_level: 5                                    │   │
│  │ pain_level: 1                                       │   │
│  │ difficulty_level: 1                                 │   │
│  │ incomplete_evacuation: false                        │   │
│  │ blood_present: false                                │   │
│  │ mucus_present: false                                │   │
│  │ amount: 'medium'                                    │   │
│  │ notes: "Entry notes"                                │   │
│  │ logged_at: "2024-04-01T10:00:00"                   │   │
│  └────────────────┬──────────────────────────────────┘   │
│                   │ handleSubmit()                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     SUPABASE INSERT/UPDATE                           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ supabase.from('bm_logs')                             │   │
│  │   .insert({                                          │   │
│  │     user_id: '12345',                               │   │
│  │     bristol_scale: 4,                               │   │
│  │     ... (all fields)                                │   │
│  │   })                                                 │   │
│  │                                                      │   │
│  │ Response: { data: { id: 'abc123', ... }, error }    │   │
│  └────────────────┬──────────────────────────────────┘   │
│                   │ Success?                              │
│                   ├─ No → Show error                      │
│                   │      ↓ STOP                           │
│                   │                                       │
│                   └─ Yes → Continue                       │
│                           ↓                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     SAVE EVENT EMISSION                              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ SaveEvent {                                          │   │
│  │   type: 'save',                                      │   │
│  │   logType: 'bm',                                     │   │
│  │   timestamp: 1712045680123,                          │   │
│  │   entryId: undefined                                 │   │
│  │ }                                                    │   │
│  └────────────────┬──────────────────────────────────┘   │
│                   │ saveEventManager.emit()               │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     EVENT PROCESSING (useSaveEventHandler)           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ 1. buildNotificationMessage(event)                   │   │
│  │    → "Bowel movement entry saved successfully"       │   │
│  │                                                      │   │
│  │ 2. scrollToTop()                                     │   │
│  │    → window.scrollTo(0, 0, 'smooth')                │   │
│  │                                                      │   │
│  │ 3. dispatchEvent('showSuccessNotification')          │   │
│  │    → CustomEvent with message                        │   │
│  │                                                      │   │
│  │ 4. setTimeout(() => reloadPage(), 1500)             │   │
│  │    → window.location.reload()                        │   │
│  └────────────────┬──────────────────────────────────┘   │
│                   │                                       │
│      ┌────────────┴─────────────┐                         │
│      │                          │                         │
│      ▼ (immediately)            ▼ (after 1500ms)         │
│  ┌────────────┐             ┌──────────────┐             │
│  │ Toast      │             │ Page Reload  │             │
│  │ Appears    │             │              │             │
│  │ (3s timer) │             │ Page resets  │             │
│  │            │             │ Form clears  │             │
│  │ Scroll to  │             │ History      │             │
│  │ top        │             │ refreshes    │             │
│  │            │             │              │             │
│  └────────────┘             └──────────────┘             │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## Event Type Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                    LOG TYPE MAPPING                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ logType          File                  Display Name           │
│ ──────────────── ──────────────────── ──────────────────── │
│ 'bm'             BMLog.tsx             Bowel movement      │
│                                                               │
│ 'food'           FoodLog.tsx           Food intake         │
│                                                               │
│ 'symptoms'       SymptomsLog.tsx       Symptom             │
│                                                               │
│ 'sleep'          SleepLog.tsx          Sleep               │
│                                                               │
│ 'stress'         StressLog.tsx         Stress level        │
│                                                               │
│ 'hydration'      HydrationLog.tsx      Hydration           │
│                                                               │
│ 'medication'     MedicationLog.tsx     Medication          │
│                                                               │
│ 'menstrual-      MenstrualCycle        Menstrual cycle     │
│  cycle'          Log.tsx                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Notification Message Examples

```
┌──────────────────────────────────────────────────────┐
│            NOTIFICATION MESSAGE EXAMPLES              │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Save      LOG TYPE: 'bm'                      │
│ ──────────────────────────────────                    │
│ MESSAGE: "Bowel movement entry saved successfully"    │
│                                                        │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Update    LOG TYPE: 'food'                    │
│ ──────────────────────────────────                    │
│ MESSAGE: "Food intake entry updated successfully"     │
│                                                        │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Delete    LOG TYPE: 'sleep'                   │
│ ──────────────────────────────────                    │
│ MESSAGE: "Sleep entry deleted successfully"           │
│                                                        │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Save      LOG TYPE: 'stress'                  │
│ ──────────────────────────────────                    │
│ MESSAGE: "Stress level entry saved successfully"      │
│                                                        │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Update    LOG TYPE: 'hydration'               │
│ ──────────────────────────────────                    │
│ MESSAGE: "Hydration entry updated successfully"       │
│                                                        │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Save      LOG TYPE: 'medication'              │
│ ──────────────────────────────────                    │
│ MESSAGE: "Medication entry saved successfully"        │
│                                                        │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Update    LOG TYPE: 'symptoms'                │
│ ──────────────────────────────────                    │
│ MESSAGE: "Symptom entry updated successfully"         │
│                                                        │
├──────────────────────────────────────────────────────┤
│                                                        │
│ ACTION: Save      LOG TYPE: 'menstrual-cycle'         │
│ ──────────────────────────────────                    │
│ MESSAGE: "Menstrual cycle entry saved successfully"   │
│                                                        │
└──────────────────────────────────────────────────────┘
```

---

## UI Layout - Toast Notification

```
        BROWSER WINDOW
┌─────────────────────────────────────────────────┐
│                                                  │
│  [SIDEBAR] [MAIN CONTENT AREA]  ┌──────────┐   │
│            Content is here       │    ✓     │   │
│            Page scrolls up       │ Bowel    │   │
│            with smooth           │ movement │   │
│            animation             │ entry    │   │
│                                  │ saved    │   │
│                                  │ success- │   │
│                                  │ fully    │   │
│                                  │          │   │
│                                  │    [X]   │   │
│                                  └──────────┘   │
│                                  Toast appears  │
│                                  in top-right   │
│                                  (fixed position)
│                                                  │
│                                                  │
│  [CONTENT AREA]                                 │
│  Page displays from top (y=0)                   │
│                                                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App (React Component)
├── Router (BrowserRouter)
│   └── AuthProvider (Context)
│       └── AppContent (NEW wrapper)
│           ├── GlobalSaveNotification (NEW)
│           │   └── SuccessToast
│           │
│           ├── useSaveEventHandler() (NEW hook)
│           │   └── Listens via saveEventManager
│           │
│           └── Routes
│               ├── Route: /dashboard
│               │   └── Dashboard
│               ├── Route: /bm-log
│               │   └── BMLog (UPDATED - emits events)
│               ├── Route: /food-log
│               │   └── FoodLog (UPDATED - emits events)
│               ├── Route: /symptoms-log
│               │   └── SymptomsLog (UPDATED - emits events)
│               ├── Route: /sleep-log
│               │   └── SleepLog (UPDATED - emits events)
│               ├── Route: /stress-log
│               │   └── StressLog (UPDATED - emits events)
│               ├── Route: /hydration-log
│               │   └── HydrationLog (UPDATED - emits events)
│               ├── Route: /medication-log
│               │   └── MedicationLog (UPDATED - emits events)
│               ├── Route: /menstrual-cycle-log
│               │   └── MenstrualCycleLog (UPDATED - emits events)
│               └── ... other routes
```

---

## Error Handling Flow

```
Save Entry
   │
   ├─ Supabase Error?
   │  │
   │  ├─ Yes: Catch & Handle
   │  │  ├─ setError(error.message)
   │  │  ├─ No event emission
   │  │  ├─ No page reload
   │  │  └─ Show error to user
   │  │
   │  └─ No: Continue
   │     │
   │     ├─ Emit event
   │     ├─ Scroll attempt
   │     │  │
   │     │  ├─ Fails: Fallback to instant scroll
   │     │  └─ Success: Smooth scroll
   │     │
   │     ├─ Dispatch custom event
   │     │  │
   │     │  ├─ Component receives: Continue
   │     │  └─ Component error: Logged, no crash
   │     │
   │     └─ Schedule reload
   │        │
   │        ├─ Reload succeeds: New page loaded
   │        └─ Reload fails: Browser handles
```

---

**Status:** ✅ PRODUCTION READY
**Date:** April 1, 2026
