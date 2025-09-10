export const spawnProcess = async (command: string[]) => {
  const p = Bun.spawn(command, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout: string[] = [];
  const stderr: string[] = [];

  for await (const chunk of p.stdout) {
    const message = new TextDecoder().decode(chunk).trim();
    stdout.push(message);
  }

  for await (const chunk of p.stderr) {
    const message = new TextDecoder().decode(chunk).trim();
    stderr.push(message);
  }

  const code = await p.exited;
  if (code == 0) {
    return stdout.join("\n");
  } else {
    throw new Error(stderr.join("\n"));
  }
};
