# pr-test-repo
Test repo to validate agents and tools for syncing GitHub PRs with a Google sheet.

Context: https://x.com/willccbb/status/1968371980484460953

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
- A new branch with the specified name (plus `_N` suffix for multiple PRs)
- A text file containing the branch name
- A commit and push to origin
- A GitHub pull request

