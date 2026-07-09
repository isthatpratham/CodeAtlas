import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Octokit } from "@octokit/rest";

@Injectable()
export class GithubService {
  private octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({
      auth: token || undefined,
    });
  }

  async fetchMetadata(owner: string, name: string) {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo: name,
      });
      return response.data;
    } catch (error: unknown) {
      const octokitError = error as { status?: number; message?: string };
      const status = octokitError.status;
      const message = octokitError.message || "";

      if (status === 403 && message.toLowerCase().includes("rate limit")) {
        throw new HttpException(
          {
            code: "RATE_LIMITED",
            message: "GitHub API rate limit exceeded.",
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (status === 404) {
        throw new NotFoundException({
          code: "REPOSITORY_NOT_FOUND",
          message: `Repository ${owner}/${name} was not found on GitHub.`,
        });
      }

      if (status === 403) {
        throw new ForbiddenException({
          code: "PRIVATE_REPOSITORY",
          message: `Access denied to repository ${owner}/${name} (it may be private).`,
        });
      }

      if (status === 401) {
        throw new UnauthorizedException({
          code: "PRIVATE_REPOSITORY",
          message: "Invalid GitHub token. Access denied.",
        });
      }

      throw new ServiceUnavailableException({
        code: "UNKNOWN_ERROR",
        message: `GitHub API error: ${message}`,
      });
    }
  }
}
