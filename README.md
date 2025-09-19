# GitHub PR sync example
Demo scripts for syncing GitHub PRs with a Google sheet.
Context: https://x.com/willccbb/status/1968371980484460953

Shell scripts were developed using Amp - [thread-1](https://ampcode.com/threads/T-3cd81dfc-3569-4154-8b9e-7c89da9260cc), [thread-2](https://ampcode.com/threads/T-9f0d37fd-68db-4828-814a-26b1095a0ad5), [thread-3](https://ampcode.com/threads/T-5eccdc48-f5d2-48a8-969f-da184b540a42)
The google apps script was developed using grok - [thread](https://grok.com/c/fc1a62af-93a0-4b5c-a2ac-720adad7247b).

## Overview
1. Shell scripts `create-pr.sh`, `close-pr.sh`, and `list-prs.sh` designed to be run on the main branch of a cloned repo.
2. `sheet.sh` makes GET or POST in `google-apps-script.js` which has to be installed as an [apps script](https://developers.google.com/apps-script) on the google sheet.

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
- Copy the Web App URL into `sheet.sh` WEB_APP_URL.

## Example
https://docs.google.com/spreadsheets/d/1Z087r5rTkvivT3sjDW70pfkfzib4DCjBJ5b0Cx-fAZg/edit

```
$ ./create-pr.sh test 5
Switched to a new branch 'test_1'
   ...
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
Created PR for test_5

$ ./list-prs.sh
ID	state	title	isDraft	createdAt	updatedAt	url
5	OPEN	test_5	false	2025-09-19T22:10:06Z	2025-09-19T22:10:06Z	https://github.com/jldec/pr-test-repo-2/pull/5
4	OPEN	test_4	false	2025-09-19T22:10:02Z	2025-09-19T22:10:03Z	https://github.com/jldec/pr-test-repo-2/pull/4
3	OPEN	test_3	false	2025-09-19T22:09:59Z	2025-09-19T22:09:59Z	https://github.com/jldec/pr-test-repo-2/pull/3
2	OPEN	test_2	false	2025-09-19T22:09:57Z	2025-09-19T22:09:57Z	https://github.com/jldec/pr-test-repo-2/pull/2
1	OPEN	test_1	false	2025-09-19T22:09:53Z	2025-09-19T22:09:53Z	https://github.com/jldec/pr-test-repo-2/pull/1

$ ./sheet.sh sync
{"status":"success","message":"Data processed and sorted","updatedIds":[],"insertedIds":[5,4,3,2,1]}

$ close-pr --all
-bash: close-pr: command not found
jurgen@jldec.me main ~/amp/pr-test-repo-2$ ./close-pr.sh --all
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

$ ./list-prs.sh
ID	state	title	isDraft	createdAt	updatedAt	url
5	CLOSED	test_5	false	2025-09-19T22:10:06Z	2025-09-19T22:19:17Z	https://github.com/jldec/pr-test-repo-2/pull/5
4	CLOSED	test_4	false	2025-09-19T22:10:02Z	2025-09-19T22:19:20Z	https://github.com/jldec/pr-test-repo-2/pull/4
3	CLOSED	test_3	false	2025-09-19T22:09:59Z	2025-09-19T22:19:22Z	https://github.com/jldec/pr-test-repo-2/pull/3
2	CLOSED	test_2	false	2025-09-19T22:09:57Z	2025-09-19T22:19:24Z	https://github.com/jldec/pr-test-repo-2/pull/2
1	CLOSED	test_1	false	2025-09-19T22:09:53Z	2025-09-19T22:19:26Z	https://github.com/jldec/pr-test-repo-2/pull/1

$ ./sheet.sh sync
{"status":"success","message":"Data processed and sorted","updatedIds":[5,4,3,2,1],"insertedIds":[]}

$ ./create-pr.sh test1
Switched to a new branch 'test1_1'
  ...
Created PR for test1_1

$ ./sheet.sh sync
{"status":"success","message":"Data processed and sorted","updatedIds":[],"insertedIds":[6]}
```

## Creating Test PRs
Use the `create-pr.sh` script to create test pull requests:

```bash
# Create a single PR
./create-pr.sh <branch-name>

# Create multiple PRs sequentially
./create-pr.sh <branch-name> <count>
```

Examples:
```bash
# Creates one PR: test-pr
./create-pr.sh test-pr

# Creates three PRs: test-batch_1, test-batch_2, test-batch_3
./create-pr.sh test-batch 3
```

The script must be run from the `main` branch and creates:
- A new branch with the specified name (plus `_n` suffix for multiple PRs)
- A text file containing the branch name
- A commit and push to origin
- A GitHub pull request

## Listing PRs
Use the `list-prs.sh` script to list all PRs (up to 1000)

```bash
# Tab-separated format with header row
./list-prs.sh

# JSON format
./list-prs.sh --json
```

Outputs ID, state, title, isDraft, createdAt, updatedAt, and url for all PRs (including closed/merged ones).

## Closing PRs
Use the `close-pr.sh` script to close PRs

```bash
# Close a specific PR by number
./close-pr.sh <pr-number>

# Close all open PRs
./close-pr.sh --all
```

The script deletes the branch after closing the PR using the `-d` flag.

## Google sheet
test sheet
https://docs.google.com/spreadsheets/d/1xyRHC2T34sxOBB4ZwyVdJmcELVRlQpJnJ7oJ4pVefh4/edit


### To merge PR Data from GitHub into the sheet
```bash
./sheet.sh sync
```

### To fetch JSON data from the sheet
```bash
./sheet.sh get
```

## Tips
- You can rearrange or add/remove columns in the sheet.
- mapping from JSON keys to column names is case insensitive
- To show the available PR fields, run `gh pr list --json`
- NOTE: There is currently no access control on the apps script.
