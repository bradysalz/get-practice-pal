### **PracticePal Product Req Doc**

**1. Introduction & Overview:**

- **Purpose**: This page outlines the product requirements for _PracticePal_, a website that helps users log their practice sessions for music. It takes a lot of inspiration from workout apps: sessions, tracking goals over time (tempo, not weight), and goals. Those apps are great at telling me what I need to do in order to make the most of time while practicing.

* **Goal:** To help musicians track their practice time and activities effectively,.

**2. Goals & Objectives:**

- Specific, measurable outcomes to achieve:
    - Start a practice session within seconds
    - Add + edit new source material quickly in a user's library
    - Track practice time + improvement to tempo to specific exercises or pieces
    - Be able to see total practice time per day, week
    - Plot and see improvements over time to each exercise

**3. User Stories / Use Cases:**

- As a musician, I want to quickly start + log a new practice session with date, time, and duration, so that I can easily log my practice.
- As a musician, I want to see the last tempo I practiced at alongside my goal tempo for a piece, so I know if I need to keep practicing
- As a musician, I want to add notes to my practice session, so I can see if I was having a good or bad day.
- As a musician, I want to view a list of my past practice sessions, so that I can see my history.
- As a musician, I want to be able to have a library of pieces that matches my physical library, so I can log what I'm playing
- As a musician, I want to be able to select specific exercises from a book, so I can track my progress throughout the box
- As a musician, I want to be able to define a "playlist" or "setlist" for a session, so I can focus on just playing during practice
- As a musician, I want to be able to pause a session midway if I get interrupted, so I don't have to keep creating new sessions

**4. Features & Requirements:**

- Practice Sessions
    - Start Session Button -> Integrated Timer with Pause / Play -> End Session Button
    - Ability to create a practice session, stop it, and log the duration
    - Ability to select and associate one or more Library items (Exercises, Songs) with an active or completed Practice Session
        - Association will be done with nested searches (serach Book -> list setions. search Sections -> list exercises. choose exercises)
    - Ability to log tempo of each practiced item during a session
    - Ability to add notes to a session (but not per exercise)
    - Ability to start a session from a setlist (but then add more items while active)
    - Ability to edit logged tempo and notes for Library items associated with a completed session.
- Library
    - Ability to add two types of media with the following links: Books -> Sections -> Exercises and Artists -> Songs
    - Examples are _Stick Control, Flams, Exercise 1-5_
    - Ability to set goal tempo for each item
    - Ability to set goal tempo for a whole section or book, which will apply to all items contained within (goal tempo always lives at the exercise or song level)
- Setlists
    - Ability to create and edit setlists of various items from the library
    - Ability to manage each setlist
- Stats
    - View progress through a book (single stat number, graph over timeseries)
    - All stats reference global max to ever recordings
    - View progress of an exercise to a goal tempo
    - Change timeseries from 1 week, 1 month, 6 month, 1 year, all time basis

**5. Scope (In/Out):**

- In Scope
    - Core logging of sessions
    - Core creation of library items (Books -> Sections -> Exercises and Artists -> Songs)
    - Form validation for sessions (all tempo > 0, must be numeric)
    - Basic graphs of tempo over time for a single piece
    - Ability to set a goal tempo by piece
    - Editing sessions after they've completed
    - Basic graphing for two forms
        - Progress to a goal tempo over time
        - Progress though a book over time (% of items that have been practied at goal tempo)
- Out of Scope
    - Any musical aide implements (tuner or metronome)
    - A unique web front end (app is the priority, mobile comes first)
    - Lookups to external sources for defining the library (users start with just writing names)
    - Any sheet music reference or similar imagery: this is just tracking titles
    - Goals for specific times/durations of each piece
    - More open ended schema (not all Books have Sections, but they will for the prototype)

**6. Non-Functional Requirements (Optional but helpful):**

- User Interface: Modern, clean, sleek, intuitive. Nothing too flash-y or gradient-y, it should get out of your way while practicing
- Platform+Tooling: Use DaisyUI, React, Vercel, NextJS, Supabase
- Icons: No design team currently, rely on open source icon packs
- Stats: All stats are global, no concept of "resetting" to a local starting point

**7. Open Questions / Decisions Needed:**

- Navigation: Tabbed layout, sidebar: Sessions, Setlists, Library, and Stats
    - Active Practice Session will tap off Sessions
    - Setlists could part of Library but feels better standalone (like "Workouts")
    - Not sure how to get to a "user/account" screen, maybe a settings gear?
- Session Edge Cases
    - Need to figure out how to see if an existing session is happening, and if so, show it immediately upon opening app. But maybe not V1
- Exercise Ranges
    - Exercises are rarely chosen as standalone objects. I think we'll need to be very deliberate on how they both are selected in a setlist/exercise and show up in a session/stats
    -
