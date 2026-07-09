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

  await app.listen(DEFAULT_PORT);
  console.log(`CodeAtlas API is running on: http://localhost:${DEFAULT_PORT}`);
}
bootstrap();
