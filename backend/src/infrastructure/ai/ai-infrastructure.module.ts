import { Global, Module } from '@nestjs/common';
import { AiRouterService } from './ai-router.service';
import { MockAiProvider } from './mock-ai.provider';
import { OpenAiCompatibleProvider } from './openai-compatible.provider';

@Global()
@Module({
  providers: [MockAiProvider, OpenAiCompatibleProvider, AiRouterService],
  exports: [AiRouterService, MockAiProvider, OpenAiCompatibleProvider],
})
export class AiInfrastructureModule {}
