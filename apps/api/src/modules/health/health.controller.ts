import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return {
      name: "CodeAtlas API",
      status: "running",
      version: "1.0.0",
    };
  }

  @Get("api/v1/health")
  getHealth() {
    return {
      name: "CodeAtlas API",
      status: "running",
      version: "1.0.0",
    };
  }
}
