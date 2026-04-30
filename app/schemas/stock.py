from pydantic import BaseModel, ConfigDict
from typing import Optional

class StockBase(BaseModel):
    ticker: str
    name: str
    exchange: Optional[str] = None
    sector: Optional[str] = None

class StockCreate(StockBase):
    pass

class StockRead(StockBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)