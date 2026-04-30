📚 StudyDP — Knapsack-Based Study Planner

A smart study planner that uses the 0/1 Knapsack Algorithm (Dynamic Programming) to generate an optimal study schedule based on your available time, subject priority, and difficulty.

🚀 Features
📌 Add subjects with:
Study hours
Priority (Low / Medium / High)
Difficulty (Easy / Medium / Hard)
Optional deadlines
⚡ Automatically computes optimal schedule
📊 Visual representation of:
Benefit scores
Time utilization
Selected vs skipped subjects
🎯 Maximizes study efficiency within limited time
💡 Clean and modern UI with animations
🧠 How It Works

This project is based on the 0/1 Knapsack Problem.

Problem Mapping:
Concept	Study Planner Equivalent
Item	Subject
Weight	Hours required
Value	Benefit score
Capacity	Total available hours
📐 Benefit Formula
Benefit = (Priority × 30) + (Difficulty × 15)
High priority + high difficulty ⇒ higher importance
⚙️ Algorithm
Uses Dynamic Programming (DP)
Builds a table dp[i][w]:
i → number of subjects
w → time capacity (in half-hours)
Decision:
dp[i][w] = max(
  dp[i-1][w],                          // skip subject
  dp[i-1][w - weight[i]] + value[i]    // take subject
)
🔍 Backtracking

After filling the DP table:

Traverse backwards to identify selected subjects
Generates optimal study plan
🖥️ Tech Stack
HTML5
CSS3
JavaScript (Vanilla JS)
No external frameworks used
📂 Project Structure
StudyDP/
│
├── index.html       # Main UI
├── style.css        # Styling
├── app.js           # Logic (Knapsack + UI)
└── README.md        # Documentation
▶️ How to Run
Download or clone the repository
Open index.html in your browser
git clone <your-repo-link>
cd StudyDP
open index.html
📸 Screens (What You’ll See)
Subject planner dashboard
Dynamic cards with benefit bars
Optimal schedule view
Skipped subjects section
🎯 Example

Input:

Total hours = 6
Subjects = DSA, Math, OS, EEE, English

Output:

Best subset of subjects maximizing benefit
Ordered study schedule
📈 Complexity
Time Complexity: O(n × W)
Space Complexity: O(n × W)
n = number of subjects
W = total half-hours
💡 Why 0/1 Knapsack?

Because:

You either study a subject fully or skip it
No partial selection allowed
🔮 Future Improvements
⏰ Time-slot based scheduling (hour-by-hour planner)
📱 Mobile responsiveness
💾 Save data using Local Storage / Database
📊 Graph analytics (progress tracking)
🤖 AI-based personalized recommendations
🙌 Author

Developed as part of a Data Structures & Algorithms project.

⭐ If you like this project

Give it a ⭐ on GitHub and share with your friends!
