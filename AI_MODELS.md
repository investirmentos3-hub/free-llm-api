# IA Providers and Models

## Supported Providers

- OpenAI
- Anthropic / Claude
- Mistral
- Groq
- Together AI
- Cohere
- Ollama / Local LLMs
- Hugging Face Inference API

## Recommended Provider Setup

### 1) OpenAI
- Model: `gpt-4o-mini`, `gpt-4o`, `gpt-4.1-mini`
- Best for: general reasoning, coding

### 2) Anthropic Claude
- Model: `claude-3-5-sonnet-20241022`, `claude-3-haiku-20240307`
- Best for: reasoning, chat, long context

### 3) Mistral AI
- Model: `mistral-large-latest`, `mistral-small-latest`, `codestral-latest`
- Best for: fast responses, low cost

### 4) Groq
- Model: `llama-3.1-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`
- Best for: ultra fast inference

### 5) Together AI
- Model: `meta-llama/Llama-3.1-70B-Instruct-Turbo`, `mistralai/Mixtral-8x7B-Instruct-v0.1`
- Best for: low latency + open-source models

### 6) Cohere
- Model: `command-r-plus`, `command-r`, `command-light`
- Best for: enterprise search and chat

### 7) Ollama Local
- Model: `llama2`, `mistral`, `codellama`, `phi3`, `qwen2.5`, `deepseek-r1`
- Best for: privacy, self-hosting, offline usage

### 8) Hugging Face Inference
- Model: provider-specific, e.g. `meta-llama/Llama-3.1-8B-Instruct`
- Best for: model experimentation

## Default Models for Production

- `claude-3-5-sonnet-20241022`
- `gpt-4o-mini`
- `llama3.1-70b-versatile`
- `mistral-large-latest`
- `llama2`
