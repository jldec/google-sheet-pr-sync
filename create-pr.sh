#!/bin/bash

# Check if argument provided
if [ -z "$1" ]; then
    echo "Usage: $0 <branch-name>"
    exit 1
fi

name="$1"

# Check if current branch is main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
    echo "Error: Must be on main branch. Currently on: $current_branch"
    exit 1
fi

# Create branch and PR
git checkout -b "${name}"
echo "${name}" > "${name}.txt"
git add "${name}.txt"
git commit -m "${name}"
git push -u origin "${name}"
gh pr create -t "${name}" -b ''
git checkout main
