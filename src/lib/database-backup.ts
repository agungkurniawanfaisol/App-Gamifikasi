import { spawn } from "child_process";

export type DatabaseConnection = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
};

export function parseDatabaseUrl(url: string): DatabaseConnection {
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URL is missing a database name.");
  }

  return {
    host: parsed.hostname,
    port: parsed.port || "3306",
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  };
}

function getConnection(): DatabaseConnection {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  return parseDatabaseUrl(url);
}

function runCommand(
  command: string,
  args: string[],
  stdin?: Buffer
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));

    child.on("error", (error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        reject(
          new Error(
            `${command} is not installed. Install mysql-client in the app container.`
          )
        );
        return;
      }
      reject(error);
    });

    child.on("close", (code) => {
      const errText = Buffer.concat(stderr).toString("utf8").trim();
      const filteredErr = errText
        .split("\n")
        .filter(
          (line) =>
            !line.includes("Using a password on the command line interface")
        )
        .join("\n")
        .trim();

      if (code !== 0) {
        reject(new Error(filteredErr || `${command} exited with code ${code}`));
        return;
      }

      if (filteredErr) {
        reject(new Error(filteredErr));
        return;
      }

      resolve(Buffer.concat(stdout));
    });

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

export function createDatabaseDump(): Promise<Buffer> {
  const config = getConnection();

  return runCommand("mysqldump", [
    "-h",
    config.host,
    "-P",
    config.port,
    `-u${config.user}`,
    `-p${config.password}`,
    "--single-transaction",
    "--routines",
    "--triggers",
    "--add-drop-table",
    config.database,
  ]);
}

export function importDatabaseDump(sql: Buffer): Promise<void> {
  const config = getConnection();

  return runCommand(
    "mysql",
    [
      "-h",
      config.host,
      "-P",
      config.port,
      `-u${config.user}`,
      `-p${config.password}`,
      config.database,
    ],
    sql
  ).then(() => undefined);
}

export function backupFilename(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "-");
  return `gamifikasi-${stamp}.sql`;
}
