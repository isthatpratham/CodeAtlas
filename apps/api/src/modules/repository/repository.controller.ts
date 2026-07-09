import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { RepositoryService } from "./repository.service";

export interface AnalyzeRepositoryDto {
  repositoryUrl: string;
}

@Controller("api/v1/repositories")
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  @Post("analyze")
  @HttpCode(HttpStatus.OK)
  async analyze(@Body() body: AnalyzeRepositoryDto) {
    return this.repositoryService.analyzeRepository(body.repositoryUrl);
  }
}
