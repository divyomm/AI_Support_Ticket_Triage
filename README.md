# AI-Powered Support Ticket Triage

This is a full-stack web application built to analyze incoming support tickets using local keyword logic without relying on external AI APIs. It categorizes tickets, assigns priority and urgency, stores them in a database, and displays the results on a simple UI.

## How to Run the Project (Locally)

### With Docker
1. Make sure Docker Desktop is open.
2. Run `docker-compose up --build`.
3. Open `http://localhost:5173` in your browser.

### Without Docker
1. Open up two separate terminal windows.
2. In the first window, start the Backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. In the second window, start the Frontend UI:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Tech Stack Used

- **Backend:** Node.js with Express. I chose this because it allows for a very clean separation between the API routes and the business logic.
- **Frontend:** React (via Vite) and vanilla CSS. Vite makes the development setup very fast and clean.
- **Database:** SQLite. This creates a simple `tickets.db` file automatically, preventing the need for complex database server installations.

## Architecture & Logic

- **Separation of Concerns:** My code is structured into `controllers` (handling HTTP requests), `services` (handling database storage), and `analyzer.js` (handling all categorization logic).
- **Core Logic:** The logic checks for keyword Arrays (`'error'`, `'payment'`, `'password'`). It dynamically boosts the ticket's priority if urgency words (like `'asap'` or `'broken'`) are found.
- **Confidence Scoring:** The confidence score dynamically calculates using the formula `min(100, keywordMatches * 20)` instead of relying on hardcoded percentages.
- **Transparency Signals:** Every logical decision made by the system is saved as a "Signal" array stored in the SQLite database and displayed on the UI.

## Custom Overrides (The Required Twist)

I created two absolute Override Rules to handle mission-critical tickets instantly before general logic runs:
1. **The "Refund" Rule:** If a user mentions "refund," the ticket is forced to **Billing** and given a minimum strict **P1** priority level since financial issues need instant routing.
2. **The "Security/Hacked" Rule:** If "security" or "hacked" is mentioned, the ticket completely bypasses normal categorization. It is locked to **Technical** and given the maximum **P0 Critical** status to prevent data breaches.

---

## Reflection (Design Decisions & Trade-offs)

**Why this Data Model and API?**
I chose to use SQLite and a single `tickets` table because it is really simple to set up. I didn't want to create complicated database relationships for a small assignment. The API just saves the ticket to the table and then sends back exactly what the frontend UI needs to display.

**Why this Classification Approach?**
Since we couldn't use real AI APIs like OpenAI, I decided to just use simple JavaScript arrays and loops. Instead of writing fifty messy `if/else` statements, I put my keywords into dictionaries (`keywordConfig`) and added a point system if words matched. It makes the code way easier to read and update.

**Trade-offs & Limitations**
My method using `.includes()` is super fast, but it's not actually "smart". For example, if a user types "I was NOT hacked", my app still sees the word "hacked" and triggers a security emergency. I chose to trade exact context accuracy for pure simplicity to perfectly match the assignment rules.

**Future Improvements**
If I had more time, I would:
1. Use Regex (Regular Expressions) so my program checks for exact words. Right now, if someone types "debug", it might accidentally trigger the "bug" keyword logic. 
2. Add a language library like `natural.js` to understand that words like "run", "ran", and "running" all mean the same thing, instead of having to type them all out in my keyword lists manually.
