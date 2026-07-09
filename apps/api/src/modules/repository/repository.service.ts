import { Injectable, BadRequestException } from "@nestjs/common";
import { GithubService } from "../github/github.service";
import { RepositoryCloneService } from "./repository-clone.service";
import { ParserService } from "../parser/parser.service";
import { validateGitHubUrl, parseGitHubUrl } from "@codeatlas/utils";
import { RepositoryResponse, RepositoryGraph } from "@codeatlas/types";

@Injectable()
export class RepositoryService {
  constructor(
    private readonly githubService: GithubService,
    private readonly repositoryCloneService: RepositoryCloneService,
    private readonly parserService: ParserService,
  ) {}

  async analyzeRepository(url: string): Promise<RepositoryResponse> {
    const startTime = Date.now();

    if (!url) {
      throw new BadRequestException({
        code: "INVALID_URL",
        message: "Repository URL cannot be empty.",
      });
    }

    const isValid = validateGitHubUrl(url);
    if (!isValid) {
      throw new BadRequestException({
        code: "INVALID_URL",
        message: `The URL '${url}' is not a valid GitHub repository URL.`,
      });
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      throw new BadRequestException({
        code: "INVALID_URL",
        message: "Failed to parse owner and name from the repository URL.",
      });
    }

    const { owner, name } = parsed;

    // 1. Fetch metadata from GitHub
    const metadata = await this.githubService.fetchMetadata(owner, name);

    // 2. Clone repository to temp directory
    const tempPath = await this.repositoryCloneService.clone(
      metadata.clone_url || url,
    );

    let scanResult;
    try {
      // 3. Scan and analyze files/AST/relationships
      scanResult = await this.parserService.scan(tempPath);
    } finally {
      // 4. Force cleanup of temporary files immediately
      await this.repositoryCloneService.cleanup(tempPath);
    }

    const duration = Date.now() - startTime;

    const graph: RepositoryGraph = {
      version: "1.0.0",
      repository: {
        id: String(metadata.id),
        owner: metadata.owner.login,
        name: metadata.name,
        fullName: metadata.full_name,
        description: metadata.description || "",
        branch: metadata.default_branch,
        url: metadata.html_url,
        createdAt: metadata.created_at,
        updatedAt: metadata.updated_at,
        language: metadata.language || "Unknown",
        stars: metadata.stargazers_count,
        forks: metadata.forks_count,
      },
      statistics: scanResult.statistics,
      layout: {
        algorithm: "none",
        generatedAt: new Date().toISOString(),
        nodeSpacing: 100,
        layerSpacing: 200,
        zoomLevel: 1.0,
      },
      nodes: scanResult.nodes,
      edges: scanResult.edges,
      analysis: {
        analyzedAt: new Date().toISOString(),
        duration,
        parserVersion: "1.0.0",
        supportedLanguages: [
          "TypeScript",
          "JavaScript",
          "TSX",
          "JSX",
          "HTML",
          "CSS",
          "SCSS",
          "JSON",
          "Markdown",
          "YAML",
        ],
        warnings: [],
        circularDependencies: scanResult.circularDependencies,
        externalPackages: scanResult.externalPackages,
      },
    };

    return {
      success: true,
      data: graph,
    };
  }
}
