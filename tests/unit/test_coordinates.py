import pytest
from src.utils.coordinates import parse_coordinate

class TestParseCoordinate:

    def test_north_latitude(self):
        assert parse_coordinate("57.05N") == 57.05

    def test_south_latitude(self):
        assert parse_coordinate("23.45S") == -23.45

    def test_east_longitude(self):
        assert parse_coordinate("10.33E") == 10.33

    def test_west_longitude(self):
        assert parse_coordinate("46.64W") == -46.64

    def test_none_input(self):
        assert parse_coordinate(None) is None

    def test_empty_string(self):
        assert parse_coordinate("") is None

    def test_invalid_format(self):
        assert parse_coordinate("invalid") is None