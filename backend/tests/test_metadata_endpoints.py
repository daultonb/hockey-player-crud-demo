"""
Tests for metadata and utility endpoints.

This module tests endpoints that provide metadata and configuration information.
"""

import pytest
from fastapi.testclient import TestClient


class TestColumnMetadataEndpoint:
    """Test the column metadata endpoint."""

    @pytest.mark.integration
    def test_get_column_metadata(self, client: TestClient):
        """
        Test that column metadata endpoint returns proper structure.
        Input: GET /column-metadata
        Expected: Returns columns with capabilities and default visible columns
        """
        response = client.get("/column-metadata")
        assert response.status_code == 200

        data = response.json()

        # Check structure
        assert "columns" in data
        assert "count" in data
        assert "default_visible_columns" in data

        # Verify we have columns
        assert len(data["columns"]) > 0
        assert data["count"] == len(data["columns"])

        # Check default visible columns exist
        assert len(data["default_visible_columns"]) > 0
        assert "name" in data["default_visible_columns"]
        assert "jersey_number" in data["default_visible_columns"]

    @pytest.mark.integration
    def test_column_metadata_structure(self, client: TestClient):
        """
        Test that each column has the expected structure.
        Input: GET /column-metadata
        Expected: Each column has key, label, required, capabilities, field_type
        """
        response = client.get("/column-metadata")
        data = response.json()

        for column in data["columns"]:
            assert "key" in column
            assert "label" in column
            assert "required" in column
            assert "capabilities" in column
            assert "field_type" in column

            # Capabilities should be a list
            assert isinstance(column["capabilities"], list)

            # Valid capabilities
            valid_capabilities = ["searchable", "sortable", "filterable"]
            for cap in column["capabilities"]:
                assert cap in valid_capabilities

    @pytest.mark.integration
    def test_column_metadata_excludes_id_and_team(self, client: TestClient):
        """
        Test that ID and team (nested object) are excluded from metadata.
        Input: GET /column-metadata
        Expected: No 'id' or 'team' in column keys
        """
        response = client.get("/column-metadata")
        data = response.json()

        column_keys = [col["key"] for col in data["columns"]]

        assert "id" not in column_keys, "ID should be excluded"
        assert "team" not in column_keys, "Team (nested object) should be excluded"

    @pytest.mark.integration
    def test_column_metadata_special_labels(self, client: TestClient):
        """
        Test that special case labels are applied correctly.
        Input: GET /column-metadata
        Expected: jersey_number -> 'Number', active_status -> 'Status'
        """
        response = client.get("/column-metadata")
        data = response.json()

        # Find specific columns
        columns_by_key = {col["key"]: col for col in data["columns"]}

        assert "jersey_number" in columns_by_key
        assert columns_by_key["jersey_number"]["label"] == "Number"

        assert "active_status" in columns_by_key
        assert columns_by_key["active_status"]["label"] == "Status"

        assert "birth_date" in columns_by_key
        assert columns_by_key["birth_date"]["label"] == "Birth Date"

    @pytest.mark.integration
    def test_column_metadata_ordered_correctly(self, client: TestClient):
        """
        Test that columns are returned in the desired order.
        Input: GET /column-metadata
        Expected: Common columns like jersey_number, name, position come first
        """
        response = client.get("/column-metadata")
        data = response.json()

        column_keys = [col["key"] for col in data["columns"]]

        # jersey_number should be first
        assert column_keys[0] == "jersey_number"

        # name should be second
        assert column_keys[1] == "name"

        # position should be third
        assert column_keys[2] == "position"
