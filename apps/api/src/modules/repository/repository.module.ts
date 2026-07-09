import { Module } from "@nestjs/common";
import { RepositoryController } from "./repository.controller";
import { RepositoryService } from "./repository.service";
import { RepositoryCloneService } from "./repository-clone.service";
import { GithubModule } from "../github/github.module";
import { ParserModule } from "../parser/parser.module";

@Module({
  imports: [GithubModule, ParserModule],
  controllers: [RepositoryController],
  providers: [RepositoryService, RepositoryCloneService],
})
export class RepositoryModule {}
