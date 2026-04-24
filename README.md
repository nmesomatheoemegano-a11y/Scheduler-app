**Scheduler app**

This app was created to eliminate dependence on cued active recall spaced repetition programs, such as flashcards, and utilize free active recall speced repetition-based programs.

The basis of scheduling utilizes the concept of active spaced repetition, which is a process that spaces out review of material learnt, to reinforce and commit to memory better. The two main types of active spaced repetition include free and cued active recall, and while they are equally effective in improving the ability to remember learnt material, free recall may be more beneficial as one is able to directly recall information from memory, rather than on the cue of a flash card (either digital or physical).

This app schedules topics based on your comfortability with materials learnt that day, and also based on the 2,3,5,7 method of spaced repetition. If you schedule a task/topic, you can choose the desired frequency, and once you tick off the task, you are prompted to evaluate your comfortability on topics learnt (again, hard, good and easy). The scheduler automatically places the task/topic on following days based on your evaluation.


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
