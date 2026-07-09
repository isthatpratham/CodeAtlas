import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module";
import { GithubModule } from "./modules/github/github.module";
import { RepositoryModule } from "./modules/repository/repository.module";
import { ParserModule } from "./modules/parser/parser.module";
import { GraphModule } from "./modules/graph/graph.module";

@Module({
  imports: [
    HealthModule,
    GithubModule,
    RepositoryModule,
    ParserModule,
    GraphModule,
  ],
})
export class AppModule {}
