# Atllas Takehome

Welcome! We're excited that you’ve applied to be an engineer, and we’re looking forward to
evaluating your takehome! This project is meant to showcase your ability to write a
simple, full-stack CRUD application.

This is a bit of a long read, but it’s all important information so make sure you take the time!

### Time Requirements

There are no hard time requirements. Please take as much time as you need to do your best work.
However, we won't consider the next phase without the takehome being attempted.

### Tech Requirements

* You must use NextJS for the front-end. Feel free to use the Next 13 app router feature if you
  prefer. You are encouraged to use any other third-party libraries such as a form validation
  library for your own convenience.
* We have set up the front-end with the Tailwind CSS framework, which is what we use in our own
  product. You're not required to use Tailwind, but demonstrating proficiency with it is a plus.
* The back-end must be done with the provided express server. Add on to it as much as you’d like,
  but the assignment must be completed using express.
* You must implement your solution using the provided database schema, since this is what we'll be
  using to test your code. The schema is in `packages/back-end/src/services/db.ts`.
* No lint issues - neither warnings nor errors are allowed.
* No type issues are allowed.
* We must be able to build and run a production build on the first try.

### Important Information

* You must install dependencies first: `npm i`.
* Then, you can use the following command to start up the front-end and back-end: `npm run start`.
* We've provided a seed script that will scaffold the database with 1,000 users to test and prototype
  with: `npm run seed`.
* Once you’re ready for hand-off, there’s a script called “seed-prod” that adds 5,000 members.
  **This is what we will be testing with**, so it’d be a good idea to test it once with “production”
  data to make sure it meets your own expectations: `npm run seed-prod`.

# Assignment

You've been tasked with writing a back-office tool to display all members currently in the database.
Product owners have also signaled that they would like to be able to manage users (add, edit,
delete) and search through the database. Both POs also mentioned that they would like to be able to
do all this on their phone as well since they find themselves out of the office quite a bit.

With the business needs of the POs in mind, you have created the following user stories that your
application must fulfill:

* As a user, I want to be able to use the application on both desktop and mobile.
* As a user, I want to be able to add a new user to the database.
* As a user, I want to be able to update a user in the database.
* As a user, I want to be able to delete a user from the database.
* As a user, I want to be able to sort the table by column.
* As a user, I want to be able to search the table by name and email.
* As a user, I want to be able to infinitely scroll the table to view more users.

You are not limited to the requirements listed above. As long as you complete the
user stories, you’re free to add whatever else you want, but you’re not required to do
anything extra. We’re not expecting extra features beyond the user stories and engineering
requirements, but we do expect the stories to hold up when we use the tool the way the
POs would. Beyond that, it’s completely up to you as to how far you go.

# Claude Code Requirement

We use Claude Code heavily and want to see how you use it.

Submit alongside your code:

1. **Your Claude Code session files.** Copy the `.jsonl` for each session you used from
   `~/.claude/projects/<url-encoded-cwd>/<session-id>.jsonl` into the [`claude-sessions/`](claude-sessions/)
   folder at the root of this repo. Both the Claude Code CLI and the VSCode extension write to
   this same location, so whichever surface you use is fine. Keep the original filenames or
   rename them however you like.
2. **A short writeup (~½ page) in [`CLAUDE_WRITEUP.md`](CLAUDE_WRITEUP.md)** at the root of the
   repo, covering:
   * What you delegated to Claude Code, and what you wrote yourself.
   * Where Claude failed, hallucinated, or led you down the wrong path — and how you caught it.

This is **not** a test of whether you can get Claude to write the whole thing for you. It's a test
of judgment: knowing what to delegate, what to verify, and what to own. Your git history should
reflect this — we'll look at commit sizes, messages, and the shape of the work — so commit
incrementally and write meaningful messages rather than dumping everything in one commit.

Using Claude (or any other AI tool) is encouraged. Pretending you didn't, or submitting code you
can't explain in a follow-up conversation, is not.

# Submission

_Important: What we expect you submit is **not** just a zipped folder of your source tree._

There are a couple of things to do once you’re ready for hand-off. First and foremost, it’s
important to **make sure everything is committed to the “master” branch**, including
`CLAUDE_WRITEUP.md` and your session file(s) in `claude-sessions/`. Once that’s
done, run the NPM script “prepare-submission” in the
top-level of the workspace, and that will generate a binary file called “submission.bundle”. Zip
this file up and submit it to [this google form](https://forms.gle/wLifwTeipsfshekw9).

# Evaluation

Your submission will be evaluated according to:
1. The quality of the implementation - Is the code clear, concise, and correct in implementing the desired experience?
2. The quality of the user experience - Is it the best user experience for mobile and desktop users?

# Questions/More Information

If you have any questions or concerns, please reach out to us
at [developers@atllas.com](mailto:developers@atllas.com?subject=[Atllas%20Takehome]%20) and include
“[Atllas Takehome]” in the subject line. We’ll be more than happy to answer your questions to the
best of our ability!

Thank you, and good luck!