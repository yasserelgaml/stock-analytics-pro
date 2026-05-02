from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Index
from app.db.base_class import Base

class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    # Composite index for optimized time-series queries for a specific stock
    __table_args__ = (
        Index("ix_stock_timestamp", "stock_id", "timestamp"),
    )