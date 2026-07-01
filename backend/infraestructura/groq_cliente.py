from types import SimpleNamespace

import httpx
from groq import Groq
from config import settings

class XaiChatCompletions:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def create(self, model: str, messages: list, max_tokens: int = 1024, temperature: float = 0.3, **kwargs):
        modelo = settings.xai_model if model.startswith("llama-") else model
        payload = {
            "model": modelo,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            **kwargs,
        }
        response = httpx.post(
            f"{settings.xai_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detalle = response.text[:500]
            raise RuntimeError(
                f"xAI respondio {response.status_code}. "
                f"Revisa que la API key tenga acceso a la API, creditos/facturacion activos "
                f"y permiso para el modelo '{modelo}'. Detalle: {detalle}"
            ) from exc
        data = response.json()
        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content=choice.get("message", {}).get("content", "")
                    )
                )
                for choice in data.get("choices", [])
            ]
        )


class XaiClient:
    def __init__(self, api_key: str):
        self.chat = SimpleNamespace(completions=XaiChatCompletions(api_key))


class GeminiChatCompletions:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def create(
        self,
        model: str,
        messages: list,
        max_tokens: int = 1024,
        temperature: float = 0.3,
        **kwargs,
    ):
        modelo = settings.gemini_model if model.startswith("llama-") else model
        system_parts = []
        contents = []

        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            if role == "system":
                system_parts.append({"text": content})
            else:
                contents.append(
                    {
                        "role": "model" if role == "assistant" else "user",
                        "parts": [{"text": content}],
                    }
                )

        payload = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }
        if system_parts:
            payload["systemInstruction"] = {"parts": system_parts}

        response = httpx.post(
            f"{settings.gemini_base_url}/models/{modelo}:generateContent",
            params={"key": self.api_key},
            json=payload,
            timeout=30,
        )
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detalle = response.text[:500]
            raise RuntimeError(
                f"Gemini respondio {response.status_code}. "
                f"Revisa que GEMINI_API_KEY sea una API key valida de Google AI Studio "
                f"y que el modelo '{modelo}' este disponible. Detalle: {detalle}"
            ) from exc

        data = response.json()
        candidates = data.get("candidates", [])
        text = ""
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            text = "".join(part.get("text", "") for part in parts)

        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=text))]
        )


class GeminiClient:
    def __init__(self, api_key: str):
        self.chat = SimpleNamespace(completions=GeminiChatCompletions(api_key))


provider = settings.ai_provider.lower()

if provider == "gemini":
    if not settings.gemini_api_key:
        raise RuntimeError("AI_PROVIDER=gemini requiere GEMINI_API_KEY en backend/.env")
    groq_client = GeminiClient(settings.gemini_api_key)
elif settings.groq_api_key.startswith("xai-"):
    groq_client = XaiClient(settings.groq_api_key)
else:
    groq_client = Groq(api_key=settings.groq_api_key)
