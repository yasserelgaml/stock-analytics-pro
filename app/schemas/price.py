from pydantic import BaseModel, ConfigDict
from datetime import datetime

class PriceBase(BaseModel):
    stock_id: int
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

class PriceCreate(PriceBase):
    pass

class PriceRead(PriceBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)