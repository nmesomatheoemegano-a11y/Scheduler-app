**Free recall scheduler app**


This app was created to eliminate dependence on cued active recall spaced repetition programs, such as flashcards, and utilize free active recall speced repetition-based programs. This app helps you schedule tasks/topics that you may want to commit to memory, and is geared towards professional exams like the Medical College Admissions Test (MCAT).

The basis of the application utilizes the concept of active spaced repetition, which is a process that spaces out review of material learnt, to reinforce and commit to memory better. The two main types of active spaced repetition include free and cued active recall, and while they are equally effective in improving the ability to remember learnt material, free recall may be more beneficial as one is able to directly recall information from memory, rather than on the cue of a flash card (either digital or physical).

This app schedules topics based on your comfortability with materials learnt that day, and also based on the 2,3,5,7 method of spaced repetition. If you schedule a task/topic, you can choose the desired frequency, and once you tick off the task, you are prompted to evaluate your comfortability on topics learnt (again, hard, good and easy). The scheduler automatically places the task/topic on following days based on your evaluation.


Here is a comprehensive, user-friendly summary of everything this app evaluates and does to help you study effectively!

1. **Smart Calendar & Task Management**
Dual Views: You can view your schedule in a Weekly View to see the big picture or zoom into a Daily View (Focus Mode) to concentrate only on today's objectives.

Drag-and-Drop: You can easily move tasks between different days simply by clicking and dragging them across the screen.

MCAT-Tailored Subjects: When you create a task, you can tag it with specific subjects (Biology, Biochemistry, CARS, Physics, Practice Exams, etc.), which visually color-codes them so you can see what your week entails at a glance.



2. **Automated Spaced Repetition**
"Chapter" Scheduling: If you learn a new chapter, you shouldn't just review it once. When you set a task's recurrence to Spaced Repetition (Chapter), the app automatically maps out a sequence of future review days for that topic (e.g., repeating 1 day later, then 3 days, then 7 days, then two weeks, etc.).

Test Date Boundary: You can set your official Test Date at the top right. Your spaced repetition reviews will intelligently stop scheduling themselves past your exam date so you aren't overwhelmed with reviews on test day.


3. **Mastery-Based Adaptive Learning**
When you check off a study task, the app will ask you to rate how well you knew the material:

Again: Extreme difficulty grasping the subject/topic. The app will automatically create a high-priority review for tomorrow.

Hard: Difficulty in remembering concepts, but have minimal idea of the concepts. The app will schedule an "Extra Review" for two days from now.

Good: Concepts were understood to an efficient capacity. The schedule remains as planned.

Easy: Mastery of the topic/concepts with little to no difficulty. The schedule is adjusted accordingly. 


4. **AI Study Coach**
Natural Language Scheduling: At the top of the screen, there is an "AI Coach" text box. Instead of manually clicking and creating tasks, you can type things like, "Schedule a Bio Chapter 3 review for tomorrow and a full Practice Exam for Saturday" and the AI will automatically create and place those tasks on your calendar for you.


5. **Smart Sequence Control**
Intelligent Deletion: Because the app creates long sequences of events (for your spaced repetition), deleting things could get messy. If you click the trash-can icon on a task that is part of a sequence, the app will prompt: "Do you want to delete just this specific task, or the entire sequence including future reviews?"


6.**Cloud Sync & Portability**
Google Login: You can log in securely using your Google Account.


**Save Anywhere:** Once logged in, your entire schedule, mastery ratings, and test dates use Firebase cloud syncing. This means your schedule is safely backed up and you can access it on any device without losing your configuration. If you are not logged in, it will save to your current browser's local storage.


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/585591cb-b4ec-4ee2-b294-a6fa76e8a10d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
