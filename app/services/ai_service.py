import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    """
    Service to integrate with Hugging Face Inference API for generating stock insights.
    """
    
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY
        # Using a powerful general-purpose model for financial analysis
        self.model_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

    async def generate_summary(self, ticker: str, technicals: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Generates a professional AI summary based on technical indicators.
        """
        if not self.api_key:
            logger.warning("Hugging Face API key not configured. Falling back to rule-based summary.")
            return None

        # Construct a detailed prompt for the AI
        prompt = (
            f"<s>[INST] You are a professional stock market analyst. "
            f"Provide a concise, professional technical analysis summary for {ticker}. "
            f"Current Technicals: "
            f"- Price: {technicals.get('current_price')} "
            f"- RSI: {technicals.get('rsi')} "
            f"- SMA 20: {technicals.get('sma_20')} "
            f"- SMA 50: {technicals.get('sma_50')} "
            f"- Signal: {technicals.get('signal')} "
            f"Analyze these indicators and provide a summary (2-3 sentences) and a sentiment (Bullish, Bearish, or Neutral). "
            f"Format the response exactly as JSON: {{\"summary\": \"...\", \"sentiment\": \"...\"}} [/INST]"
        )

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.model_url,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"inputs": prompt},
                    timeout=10.0
                )
                response.raise_for_status()
                
                # The HF Inference API returns a list of dicts
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    content = result[0].get("generated_text", "")
                    
                    # The model often repeats the prompt, we need the part after [/INST]
                    if "[/INST]" in content:
                        content = content.split("[/INST]")[-1].strip()
                    
                    # Try to parse JSON from the response
                    import json
                    # Simple cleanup to find JSON block
                    start = content.find('{')
                    end = content.rfind('}') + 1
                    if start != -1 and end != 0:
                        return json.loads(content[start:end])
                    
                    # Fallback if not JSON
                    return {
                        "summary": content,
                        "sentiment": "Neutral"
                    }
                
        except Exception as e:
            logger.error(f"Hugging Face API error for {ticker}: {str(e)}")
            return None

        return None