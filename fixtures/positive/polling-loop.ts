async function waitForJob(jobId: string): Promise<unknown> {
  while (true) {
    const response = await fetch(`https://api.example.com/jobs/${jobId}`);
    const job = await response.json();

    if (job.status === 'completed') {
      return job;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

void waitForJob('job-123');
