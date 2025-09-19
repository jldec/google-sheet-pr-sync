#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Error: No arguments provided"
    echo "Usage: $0 <pr-number> | --all"
    exit 1
fi

if [ "$1" = "--all" ]; then
    echo "Closing all open PRs..."
    # Get all open PR numbers
    pr_numbers=$(gh pr list -L 1000 --json number --jq '.[].number' -s open)

    if [ -z "$pr_numbers" ]; then
        echo "No open PRs found"
        exit 0
    fi

    for pr_num in $pr_numbers; do
        echo "Closing PR #$pr_num..."
        gh pr close -d "$pr_num"
    done
    echo "All open PRs closed"
else
    # Close specific PR number
    echo "Closing PR #$1..."
    gh pr close -d "$1"
fi
