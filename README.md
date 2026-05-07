CPU Scheduling Simulator
Priority vs SRTF (Shortest Remaining Time First)

Operating Systems Course Project

📌 Overview

A web-based simulator that compares Priority Scheduling and SRTF algorithms using the same process set with real-time visualization and metrics comparison.

✨ Features
Side-by-side comparison of Priority vs SRTF
Interactive Gantt Charts for visualization
Preemptive scheduling simulation
Performance metrics calculation
Pre-built test scenarios + random generator
Input validation system
Responsive design (desktop & tablet)
⚙️ Algorithms Implemented
🔵 Priority Scheduling (Preemptive)
Lower value = higher priority
Can preempt running process if a higher priority arrives
Tie-breaker: Arrival Time → PID
🟢 SRTF (Shortest Remaining Time First)
Selects process with minimum remaining burst time
Preemptive version of SJF
Tie-breaker: Arrival Time → PID
📊 Metrics Used
CT (Completion Time) → When process finishes
WT (Waiting Time) → Time spent in ready queue
TAT (Turnaround Time) → Arrival → Completion
RT (Response Time) → First CPU response
🚀 How to Use
Add processes (PID, Arrival Time, Burst Time, Priority)
Or load a pre-built scenario
Click Run Simulation
View Gantt charts + results comparison

📌 Shortcut: Ctrl + Enter

📁 Project Structure
index.html   → Main UI structure  
style.css    → Styling & layout  
script.js    → Scheduling logic  
▶️ Run Project

Just open index.html in any browser.
