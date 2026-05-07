# CPU Scheduling Simulator  
## Priority vs SRTF (Shortest Remaining Time First)  
### Operating Systems Course Project  

---

## Overview  
A web-based simulator designed to compare Priority Scheduling and SRTF algorithms using the same set of processes.  
The project focuses on visualization and performance analysis of CPU scheduling techniques.

---

## Features  
- Side-by-side comparison of Priority and SRTF scheduling  
- Interactive Gantt chart visualization  
- Preemptive scheduling support  
- Automatic calculation of performance metrics  
- Pre-built test cases and random process generator  
- Input validation system  
- Responsive design for desktop and tablet  

---

## Algorithms Implemented  

### Priority Scheduling (Preemptive)  
- Lower priority value means higher execution priority  
- Can interrupt currently running process if a higher priority process arrives  
- Tie-breaking order: Arrival Time → PID  

---

### SRTF (Shortest Remaining Time First)  
- Selects process with the smallest remaining burst time  
- Preemptive version of Shortest Job First (SJF)  
- Tie-breaking order: Arrival Time → PID  

---

## Performance Metrics  

- Completion Time (CT): Time at which a process finishes execution  
- Waiting Time (WT): Total time a process spends in the ready queue  
- Turnaround Time (TAT): CT − Arrival Time  
- Response Time (RT): Time until the process gets CPU for the first time  

---

## How to Use  

1. Add processes with the following details:
   - Process ID (PID)  
   - Arrival Time  
   - Burst Time  
   - Priority  

2. Alternatively, load a pre-defined scenario  
3. Run the simulation  
4. View results:
   - Gantt charts for both algorithms  
   - Comparison of performance metrics  

---

## Keyboard Shortcut  
Ctrl + Enter → Run Simulation  

---

## Project Structure  


index.html → Main interface (UI)
style.css → Styling and layout
script.js → Scheduling logic and algorithms


---

## Running the Project  

Open `index.html` directly in any modern web browser.  
No installation or dependencies required.
