import asyncio
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agent import create_agent

app = FastAPI(title="LangChain Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    agent = create_agent()
    queue: asyncio.Queue[str | None] = asyncio.Queue()

    async def run_agent() -> None:
        try:
            async for event in agent.astream_events(
                {"input": request.message},
                version="v2"
            ):
                kind = event["event"]
                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"].content
                    if chunk:
                        await queue.put(json.dumps({"type": "token", "content": chunk}))
                elif kind == "on_tool_start":
                    tool_name = event["name"]
                    await queue.put(json.dumps({"type": "tool_start", "content": f"Using tool: {tool_name}"}))
        except Exception as e:
            await queue.put(json.dumps({"type": "error", "content": str(e)}))
        finally:
            await queue.put(None)  # 结束信号

    async def generate():
        task = asyncio.create_task(run_agent())
        try:
            while True:
                try:
                    item = await asyncio.wait_for(queue.get(), timeout=15.0)
                    if item is None:
                        yield f"data: {json.dumps({'type': 'done'})}\n\n"
                        break
                    yield f"data: {item}\n\n"
                except asyncio.TimeoutError:
                    # 每 15 秒发送心跳，防止连接超时
                    yield ": keep-alive\n\n"
        finally:
            await task

    return StreamingResponse(generate(), media_type="text/event-stream")
