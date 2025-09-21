# Google Sheet GitHub PR sync
This is a case study of using shell scripts and a Google Apps script to sync GitHub PRs with a Google sheet.

## How it works
Shell scripts [create-pr](https://github.com/jldec/google-sheet-pr-sync/blob/main/create-pr), [close-pr](https://github.com/jldec/google-sheet-pr-sync/blob/main/close-pr), and [list-prs](https://github.com/jldec/google-sheet-pr-sync/blob/main/list-prs) use git and the [gh CLI](https://cli.github.com/) to manipulate PRs from within the cloned repo directory. Only `list-prs` is required for sync'ing.

Calling [./sheet sync](https://github.com/jldec/google-sheet-pr-sync/blob/main/sheet) invokes `./list-prs --json` and pipes the JSON output into curl, which POSTs the data to the Google Apps script installed as a Web App on the Google sheet.

```sh
if [ "$1" = "sync" ]; then
    ./list-prs --json | curl -L -H "Content-Type: application/json" -d @- "$WEB_APP_URL"
```

The [Apps script](https://github.com/jldec/google-sheet-pr-sync/blob/main/google-apps-script.js) compares incoming PRs to existing rows in the sheet and syncs those which are new or changed.

## Getting Started with this repo
This project assumes a working git repo with a main branch and gitHub origin. Besides git, the scripts depend on [`gh`](https://cli.github.com/), `curl`, `jq`, `sed`, `tr`, and `printf`.

### 1. Install shell scripts
- Copy the shell scripts (or everything from this repo) into the root of your repo

### 2. Prepare your Google sheet and install the [Apps script](https://developers.google.com/apps-script)
- Go to sheets.google.com, create new spreadsheet and name it.
- Share with edit access for “Anyone with the link”.
- Leave the sheet empty for automatic header-row creation on first sync.
- Click Extensions > Apps Script.
- Replace the default code with the contents of `google-apps-script.js`.
- Click Deploy > New deployment.
- Select Type > Web app.
- Provide a description, set execute as me, anyone access.
- Click Deploy, confirm google auth permissions on the sheet.
- Copy the Web App URL and edit the `sheet` script to set a new value for WEB_APP_URL.

## Example
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
https://docs.google.com/spreadsheets/d/1Z087r5rTkvivT3sjDW70pfkfzib4DCjBJ5b0Cx-fAZg/edit

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
Use the `create-pr` script to create test pull requests.

The script must be run from the `main` branch and creates:
- A new branch with the specified name (plus `_n` suffix for multiple PRs)
- A text file containing the branch name
- A commit and push to origin
- A GitHub pull request

```bash
# Creates one PR: test-pr
./create-pr test-pr

# Creates three PRs: test-batch_1, test-batch_2, test-batch_3
./create-pr test-batch 3
```

## Listing PRs
Use the `list-prs` script to list all PRs (up to 1000). Outputs ID, state, title, isDraft, createdAt, updatedAt, and url for all PRs (including closed/merged ones).

```bash
# Tab-separated format with header row
./list-prs

# JSON format
./list-prs --json
```

## Closing PRs
Use the `close-pr` script to close PRs. The script deletes the branch after closing the PR using the `-d` flag.

```bash
# Close a specific PR by number
./close-pr <pr-number>

## Refs
- [Google Apps script](https://developers.google.com/apps-script)

# Close all open PRs
./close-pr --all
```

## Next steps toward a low-code AI-chat solution
1. Evaluate general-purpose MCP servers for GitHub PRs and Google sheets (like [1](https://workspacemcp.com/quick-start), [2](https://mcp.composio.dev/googlesheets), or [3](https://github.com/github/github-mcp-server)), and how to connect them.
2. Implement a custom MCP server specifically for JSON sync with Google sheets. Start by porting the Apps script in this repo to use the externally-accessible Google [sheets api](https://developers.google.com/workspace/sheets/api/guides/concepts).
3. Explore alternative low-code integration tools like Zapier and n8n. (see [grok thread](https://grok.com/share/bGVnYWN5_be30da93-02e9-45ff-ad55-1031dbaab587))

