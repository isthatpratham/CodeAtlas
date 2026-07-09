import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

@Injectable()
export class RepositoryCloneService {
  private readonly tmpBaseDir = path.join(process.cwd(), ".tmp");

  async clone(url: string): Promise<string> {
    try {
      // Ensure base .tmp directory exists
      await fs.mkdir(this.tmpBaseDir, { recursive: true });

      // Create a unique temporary directory
      const tempPath = await fs.mkdtemp(path.join(this.tmpBaseDir, "repo-"));

      // Perform a shallow clone with a 60-second timeout
      await execAsync(`git clone --depth 1 "${url}" "${tempPath}"`, {
        timeout: 60000,
      });
      return tempPath;
    } catch (error: unknown) {
      const execError = error as { message?: string };
      throw new InternalServerErrorException({
        code: "ANALYSIS_FAILED",
        message: `Failed to clone repository: ${execError.message || String(error)}`,
      });
    }
  }

  async cleanup(dirPath: string): Promise<void> {
    try {
      // Safety check: ensure we only delete paths inside our base .tmp directory
      const absolutePath = path.resolve(dirPath);
      const absoluteBase = path.resolve(this.tmpBaseDir);

      if (
        absolutePath.startsWith(absoluteBase) &&
        absolutePath !== absoluteBase
      ) {
        await fs.rm(absolutePath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Failed to clean up directory ${dirPath}:`, error);
    }
  }
}
