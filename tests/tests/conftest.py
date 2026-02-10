import pytest
import pandas as pd

@pytest.fixture
def sample_global_data():
    """Dados de exemplo para testes."""
    return pd.DataFrame({
        'dt': ['2010-01-01', '2010-02-01', '2010-03-01'],
        'LandAverageTemperature': [3.5, 4.2, 7.8],
        'LandAverageTemperatureUncertainty': [0.5, 0.4, 0.3],
    })

@pytest.fixture
def sample_city_data():
    """Dados de cidade para testes."""
    return pd.DataFrame({
        'dt': ['2010-01-01', '2010-02-01'],
        'AverageTemperature': [10.5, 12.3],
        'AverageTemperatureUncertainty': [0.5, 0.4],
        'City': ['Sao Paulo', 'Rio de Janeiro'],
        'Country': ['Brazil', 'Brazil'],
        'Latitude': ['23.55S', '22.91S'],
        'Longitude': ['46.64W', '43.17W'],
    })