# Claude Code Writeup

## What I delegated vs. what I wrote myself

I had Claude write the front-end and back-end adding new user logic. I wrote, very detailed and specific prompt for claude to implement. Thought process: AI is quicker at writing code, so I point it to files to look at, how I want the logic implemented, gave it the exact schema structure, and reviewed AI written code. Instead of manually writing everything myself I check for security issues/bugs (Final code decisions are always made by me through Manual Claude Code mode).  

<!-- A few sentences. Be specific — "I had Claude scaffold the express CRUD routes, then I rewrote the validation layer by hand because the version Claude generated didn't match our schema." -->

## Where Claude led me wrong

Claude started implementing two separate but identical validation logic for front and back end, stopped it mid process and had it create a shared folder. 


<!-- A few sentences. Hallucinated APIs, wrong library versions, plausible-but-incorrect SQL, a fix that masked the real bug, etc. How did you catch it? -->
