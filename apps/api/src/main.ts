import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DEFAULT_PORT } from "@codeatlas/config";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS as requested
  app.enableCors();

  // Register global filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || DEFAULT_PORT;
  await app.listen(port);
  console.log(`CodeAtlas API is running on: http://localhost:${port}`);
}
bootstrap();
