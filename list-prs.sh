#!/bin/bash
gh pr list --json number,state,title --template '{{range .}}{{.number}} {{.state}} {{.title}}
{{end}}' -s all
