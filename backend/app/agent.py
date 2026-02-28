import ast
import operator
import os
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.tools import tool

_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
}


def _safe_eval(node: ast.expr) -> float:
    """Recursively evaluate AST node, only allows numbers and basic arithmetic."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.BinOp) and type(node.op) in _OPERATORS:
        return _OPERATORS[type(node.op)](_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _OPERATORS:
        return _OPERATORS[type(node.op)](_safe_eval(node.operand))
    raise ValueError(f"Unsupported expression: {ast.dump(node)}")


@tool
def calculator(expression: str) -> str:
    """Safely evaluate a basic math expression (e.g. '2 + 3 * 4'). Supports +, -, *, /, **."""
    if len(expression) > 200:
        return "Error: expression too long (max 200 characters)"
    try:
        tree = ast.parse(expression, mode="eval")
        result = _safe_eval(tree.body)
        return str(result)
    except Exception as e:
        return f"Error: {e}"


def create_agent() -> AgentExecutor:
    llm = ChatOpenAI(
        model=os.environ.get("LLM_MODEL", "Pro/zai-org/GLM-5"),
        temperature=0,
        streaming=True,
        base_url=os.environ.get("LLM_BASE_URL", "https://api.siliconflow.cn/v1"),
        api_key=os.environ.get("LLM_API_KEY"),
    )
    tools = [DuckDuckGoSearchRun(), calculator]

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI assistant with search and calculation capabilities. Answer in the same language as the user."),
        MessagesPlaceholder("chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ])

    agent = create_openai_tools_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)
