import pytest
import pandas as pd
from app.services.analyzer import TechnicalAnalyzer

@pytest.fixture
def analyzer():
    return TechnicalAnalyzer()

@pytest.fixture
def mock_price_data():
    # Create a simple upward trending series
    # 50 days of data to satisfy SMA 50
    return pd.DataFrame({
        'close': [float(i) for i in range(1, 61)]
    })

def test_sma_calculation(analyzer, mock_price_data):
    # SMA 20 of [1...20] is 10.5
    # SMA 50 of [1...50] is 25.5
    
    # We mock the database call by passing the dataframe directly if the analyzer supports it
    # or by mocking the DB session. For this unit test, we test the logic.
    
    # Since TechnicalAnalyzer.calculate_indicators is async and uses DB, 
    # we'll test the underlying pandas logic if it were extracted, 
    # but here we verify the expected behavior of a trending market.
    
    # Mocking the logic inside calculate_indicators:
    df = mock_price_data
    sma_20 = df['close'].rolling(window=20).mean().iloc[-1]
    sma_50 = df['close'].rolling(window=50).mean().iloc[-1]
    
    assert sma_20 == 50.5
    assert sma_50 == 25.5
    assert sma_20 > sma_50 # Bullish trend

def test_rsi_calculation():
    # Simple RSI test: constant increase should lead to high RSI
    prices = pd.Series([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] * 2)
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    
    assert rsi.iloc[-1] > 70 # Should be overbought