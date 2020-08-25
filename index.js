import { getInput, setFailed } from '@actions/core';
import { context as _context, getOctokit } from '@actions/github';


async function run() {
    try {
        const token = getInput('GITHUB_TOKEN');
        const taskNumber = getInput('task_number');
        const urlPrefix = getInput('url_prefix');
        const url = String(urlPrefix) + String(taskNumber)

        const pr_number = _context.payload.pull_request.number;

        const octokit = getOctokit(token);

        const repository = process.env.GITHUB_REPOSITORY;
        const [owner, repo] = repository.split("/");

        const { data: comments } = await octokit.issues.listComments({
            owner: owner,
            repo: repo,
            issue_number: pr_number,
        });

        const botLogin = 'github-actions[bot]'

        const comment = comments.find(c => {
            return c.user.login == botLogin && c.body.match(urlPrefix)
        })

        if (comment) {
            octokit.issues.updateComment({
                ..._context.repo,
                comment_id: comment.id,
                issue_number: pr_number,
                body: url
            })
        } else {
            octokit.issues.createComment({
                ..._context.repo,
                issue_number: pr_number,
                body: url
            })
        }

    } catch (error) {
        setFailed(error.message);
    }
}

run()
