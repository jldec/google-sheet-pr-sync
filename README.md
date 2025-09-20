# GitHub PR sync example
This is a demo of using shell scripts and a google Apps script to sync GitHub PRs with a Google sheet.

The idea came from this [tweet](https://x.com/willccbb/status/1968371980484460953)
<img width="1157" height="582" alt="Screenshot 2025-09-20 at 16 13 28" src="https://github.com/user-attachments/assets/89d198c4-ba53-45f5-92e0-12ab96c6b14c" />

Even though the thread above is looking for a no-code solution, this code provides a working example which helps to identify integration decision details and guage the complexity of the task. It also serves as a handy set of tools to evaluate alternative approaches.

All the shell scripts were developed using Amp - threads [1](https://ampcode.com/threads/T-3cd81dfc-3569-4154-8b9e-7c89da9260cc), [2](https://ampcode.com/threads/T-9f0d37fd-68db-4828-814a-26b1095a0ad5), [3](https://ampcode.com/threads/T-5eccdc48-f5d2-48a8-969f-da184b540a42), and [4](https://ampcode.com/threads/T-9fafe09f-9d85-4c01-af71-176c5c37b0a0). The google Apps script was developed using Grok - [thread](https://grok.com/c/fc1a62af-93a0-4b5c-a2ac-720adad7247b).

## Overview
Shell scripts `create-pr`, `close-pr`, and `list-prs` are meant to be run from the main branch of a cloned repo. 

Calling `./list-prs` extracts the PR data from GitHub using the `gh` CLI. It can output JSON or tab-delimited text.

Calling `./sheet sync` invokes `list-prs` and pipes the JSON output into curl, which POSTs the data to the google [Apps script](https://developers.google.com/apps-script) installed as a Web App on the sheet. The Apps script compares incoming PRs to existing rows in the sheet and syncs those which are new or changed. 

## Prerequisites
Ensure that you have to the following command line utilities
- curl
- gh from https://cli.github.com/
- jq from https://jqlang.org/download/

## repo scripts
- Copy the 4 scripts into the root of your repo

## Google sheet installation
- Go to sheets.google.com, create new spreadsheet and name it.
- Leave the sheet empty for automatic header-row creation on first sync.
- Share with edit access “Anyone with the link” (for public access).
- Click Extensions > Apps Script.
- Replace the default code with the contents of `google-apps-script.js`.
- Click Deploy > New deployment.
- Select Type > Web app.
- Provide description, Set execute as me, anyone access.
- Click Deploy, confirm permissions
- Copy the Web App URL into `sheet` WEB_APP_URL.

## Example
https://docs.google.com/spreadsheets/d/1Z087r5rTkvivT3sjDW70pfkfzib4DCjBJ5b0Cx-fAZg/edit

```
$ ./create-pr test 5
Switched to a new branch 'test_1'
   ...
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
Created PR for test_5

$ ./list-prs
ID	state	title	isDraft	createdAt	updatedAt	url
5	OPEN	test_5	false	2025-09-19T22:10:06Z	2025-09-19T22:10:06Z	https://github.com/jldec/pr-test-repo-2/pull/5
4	OPEN	test_4	false	2025-09-19T22:10:02Z	2025-09-19T22:10:03Z	https://github.com/jldec/pr-test-repo-2/pull/4
3	OPEN	test_3	false	2025-09-19T22:09:59Z	2025-09-19T22:09:59Z	https://github.com/jldec/pr-test-repo-2/pull/3
2	OPEN	test_2	false	2025-09-19T22:09:57Z	2025-09-19T22:09:57Z	https://github.com/jldec/pr-test-repo-2/pull/2
1	OPEN	test_1	false	2025-09-19T22:09:53Z	2025-09-19T22:09:53Z	https://github.com/jldec/pr-test-repo-2/pull/1

$ ./sheet sync
{"status":"success","message":"Data processed and sorted","updatedIds":[],"insertedIds":[5,4,3,2,1]}

$ ./close-pr --all
Closing all open PRs...
Closing PR #5...
✓ Closed pull request jldec/pr-test-repo-2#5 (test_5)
✓ Deleted branch test_5
Closing PR #4...
✓ Closed pull request jldec/pr-test-repo-2#4 (test_4)
✓ Deleted branch test_4
Closing PR #3...
✓ Closed pull request jldec/pr-test-repo-2#3 (test_3)
✓ Deleted branch test_3
Closing PR #2...
✓ Closed pull request jldec/pr-test-repo-2#2 (test_2)
✓ Deleted branch test_2
Closing PR #1...
✓ Closed pull request jldec/pr-test-repo-2#1 (test_1)
✓ Deleted branch test_1
All open PRs closed

$ ./list-prs
ID	state	title	isDraft	createdAt	updatedAt	url
5	CLOSED	test_5	false	2025-09-19T22:10:06Z	2025-09-19T22:19:17Z	https://github.com/jldec/pr-test-repo-2/pull/5
4	CLOSED	test_4	false	2025-09-19T22:10:02Z	2025-09-19T22:19:20Z	https://github.com/jldec/pr-test-repo-2/pull/4
3	CLOSED	test_3	false	2025-09-19T22:09:59Z	2025-09-19T22:19:22Z	https://github.com/jldec/pr-test-repo-2/pull/3
2	CLOSED	test_2	false	2025-09-19T22:09:57Z	2025-09-19T22:19:24Z	https://github.com/jldec/pr-test-repo-2/pull/2
1	CLOSED	test_1	false	2025-09-19T22:09:53Z	2025-09-19T22:19:26Z	https://github.com/jldec/pr-test-repo-2/pull/1

$ ./sheet sync
{"status":"success","message":"Data processed and sorted","updatedIds":[5,4,3,2,1],"insertedIds":[]}

$ ./create-pr test1
Switched to a new branch 'test1_1'
  ...
Created PR for test1_1

$ ./sheet sync
{"status":"success","message":"Data processed and sorted","updatedIds":[],"insertedIds":[6]}
```

<img width="1029" height="383" alt="Screenshot 2025-09-19 at 18 24 10" src="https://github.com/user-attachments/assets/f11265c0-1be7-411d-8c74-9c9ef8e7b8ab" />


## To merge PR Data from GitHub into the sheet
```bash
./sheet sync
```

## To fetch JSON data from the sheet
```bash
./sheet get
```

## Tips
- You can rearrange or add/remove columns in the sheet.
- mapping from JSON keys to column names is case insensitive
- To show the available PR fields, run `gh pr list --json`
- NOTE: There is currently no access control on the apps script.

## Creating Test PRs
Use the `create-pr` script to create test pull requests - examples:

```bash
# Creates one PR: test-pr
./create-pr test-pr

# Creates three PRs: test-batch_1, test-batch_2, test-batch_3
./create-pr test-batch 3
```

The script must be run from the `main` branch and creates:
- A new branch with the specified name (plus `_n` suffix for multiple PRs)
- A text file containing the branch name
- A commit and push to origin
- A GitHub pull request

## Listing PRs
Use the `list-prs` script to list all PRs (up to 1000)

```bash
# Tab-separated format with header row
./list-prs

# JSON format
./list-prs --json
```

Outputs ID, state, title, isDraft, createdAt, updatedAt, and url for all PRs (including closed/merged ones).

## Closing PRs
Use the `close-pr` script to close PRs

```bash
# Close a specific PR by number
./close-pr <pr-number>

# Close all open PRs
./close-pr --all
```

The script deletes the branch after closing the PR using the `-d` flag.
