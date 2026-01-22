"""
Tests for Pydantic models
"""
import pytest
from datetime import datetime
from uuid import uuid4

from app.models.common import State, EventType, ReceiptStatus
from app.models.household import (
    HouseholdCreate,
    HouseholdResponse,
    MemberInviteCreate,
    MemberInviteResponse
)
from app.models.item import ItemCreate, ItemUpdate, ItemResponse
from app.models.inventory import InventoryResponse, QuickActionRequest
from app.models.event import EventCreate, EventResponse
from app.models.receipt import (
    ReceiptUploadResponse,
    ReceiptItemResponse,
    ReceiptDetailResponse,
    ReceiptConfirmRequest
)
from app.models.prediction import PredictionResponse
from app.models.restock import RestockItemResponse, RestockListResponse


class TestHouseholdModels:
    """Test household-related models"""
    
    def test_household_create(self):
        """Test household creation model"""
        data = HouseholdCreate(name="Test Household")
        assert data.name == "Test Household"
    
    def test_household_response(self):
        """Test household response model"""
        household_id = uuid4()
        data = HouseholdResponse(
            id=household_id,
            name="Test Household",
            created_at=datetime.utcnow()
        )
        assert data.id == household_id
        assert data.name == "Test Household"
    
    def test_member_invite_create(self):
        """Test member invitation creation"""
        household_id = uuid4()
        data = MemberInviteCreate(
            household_id=household_id,
            email="test@example.com",
            role="member"
        )
        assert data.email == "test@example.com"
        assert data.role == "member"


class TestItemModels:
    """Test item-related models"""
    
    def test_item_create(self):
        """Test item creation model"""
        household_id = uuid4()
        data = ItemCreate(
            household_id=household_id,
            name="Milk",
            category="dairy",
            location="fridge"
        )
        assert data.name == "Milk"
        assert data.category == "dairy"
        assert data.location == "fridge"
    
    def test_item_update(self):
        """Test item update model"""
        data = ItemUpdate(name="Whole Milk", location="pantry")
        assert data.name == "Whole Milk"
        assert data.location == "pantry"
        assert data.category is None
    
    def test_item_response(self):
        """Test item response model"""
        item_id = uuid4()
        household_id = uuid4()
        data = ItemResponse(
            id=item_id,
            household_id=household_id,
            name="Milk",
            category="dairy",
            location="fridge",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        assert data.id == item_id
        assert data.name == "Milk"


class TestInventoryModels:
    """Test inventory-related models"""
    
    def test_inventory_response(self):
        """Test inventory response model"""
        item_id = uuid4()
        household_id = uuid4()
        data = InventoryResponse(
            id=uuid4(),
            item_id=item_id,
            household_id=household_id,
            state=State.OK,
            confidence=0.85,
            last_updated=datetime.utcnow(),
            item_name="Milk",
            item_category="dairy",
            item_location="fridge"
        )
        assert data.state == State.OK
        assert data.confidence == 0.85
        assert data.item_name == "Milk"
    
    def test_quick_action_request(self):
        """Test quick action request model"""
        item_id = uuid4()
        data = QuickActionRequest(
            item_id=item_id,
            action="used",
            idempotency_key="test-key-123"
        )
        assert data.action == "used"
        assert data.idempotency_key == "test-key-123"


class TestEventModels:
    """Test event-related models"""
    
    def test_event_create(self):
        """Test event creation model"""
        household_id = uuid4()
        item_id = uuid4()
        data = EventCreate(
            household_id=household_id,
            event_type=EventType.INVENTORY_USED,
            item_id=item_id,
            payload={"previous_state": "OK", "new_state": "Low"},
            confidence=0.9
        )
        assert data.event_type == EventType.INVENTORY_USED
        assert data.confidence == 0.9
    
    def test_event_response(self):
        """Test event response model"""
        event_id = uuid4()
        household_id = uuid4()
        item_id = uuid4()
        data = EventResponse(
            id=event_id,
            household_id=household_id,
            event_type=EventType.INVENTORY_RESTOCKED,
            item_id=item_id,
            payload={"quantity": 2},
            confidence=0.95,
            created_at=datetime.utcnow()
        )
        assert data.id == event_id
        assert data.event_type == EventType.INVENTORY_RESTOCKED


class TestReceiptModels:
    """Test receipt-related models"""
    
    def test_receipt_upload_response(self):
        """Test receipt upload response"""
        receipt_id = uuid4()
        data = ReceiptUploadResponse(
            id=receipt_id,
            status=ReceiptStatus.UPLOADED,
            file_url="https://storage.example.com/receipts/123.jpg"
        )
        assert data.id == receipt_id
        assert data.status == ReceiptStatus.UPLOADED
    
    def test_receipt_item_response(self):
        """Test receipt item response"""
        data = ReceiptItemResponse(
            raw_name="ORG MLK 2% 1GAL",
            normalized_name="Milk 2%",
            quantity=1,
            unit="gallon",
            price=4.99,
            confidence=0.85,
            suggested_item_id=uuid4(),
            suggested_item_name="Milk",
            match_score=0.92
        )
        assert data.normalized_name == "Milk 2%"
        assert data.match_score == 0.92
    
    def test_receipt_confirm_request(self):
        """Test receipt confirmation request"""
        item_id = uuid4()
        data = ReceiptConfirmRequest(
            confirmed_items=[
                {"receipt_item_index": 0, "item_id": item_id, "quantity": 2}
            ]
        )
        assert len(data.confirmed_items) == 1
        assert data.confirmed_items[0]["quantity"] == 2


class TestPredictionModels:
    """Test prediction-related models"""
    
    def test_prediction_response(self):
        """Test prediction response model"""
        item_id = uuid4()
        data = PredictionResponse(
            id=uuid4(),
            item_id=item_id,
            predicted_state=State.LOW,
            confidence=0.78,
            days_to_low=2,
            days_to_out=5,
            reason_codes=["consistent_usage_pattern", "receipt_confirmed_3_days_ago"],
            model_version="rules-v1.0",
            created_at=datetime.utcnow()
        )
        assert data.predicted_state == State.LOW
        assert data.confidence == 0.78
        assert len(data.reason_codes) == 2


class TestRestockModels:
    """Test restock-related models"""
    
    def test_restock_item_response(self):
        """Test restock item response"""
        item_id = uuid4()
        data = RestockItemResponse(
            item_id=item_id,
            item_name="Milk",
            current_state=State.LOW,
            predicted_state=State.ALMOST_OUT,
            confidence=0.82,
            days_to_low=1,
            days_to_out=3,
            reason_codes=["recent_usage_events"],
            urgency="need_soon"
        )
        assert data.item_name == "Milk"
        assert data.urgency == "need_soon"
    
    def test_restock_list_response(self):
        """Test restock list response"""
        item_id = uuid4()
        item = RestockItemResponse(
            item_id=item_id,
            item_name="Milk",
            current_state=State.OUT,
            predicted_state=None,
            confidence=1.0,
            days_to_low=None,
            days_to_out=None,
            reason_codes=["current_state_out"],
            urgency="need_now"
        )
        data = RestockListResponse(
            need_now=[item],
            need_soon=[],
            nice_to_top_up=[]
        )
        assert len(data.need_now) == 1
        assert data.need_now[0].urgency == "need_now"


class TestEnums:
    """Test enum values"""
    
    def test_state_enum(self):
        """Test State enum values"""
        assert State.PLENTY == "Plenty"
        assert State.OK == "OK"
        assert State.LOW == "Low"
        assert State.ALMOST_OUT == "Almost out"
        assert State.OUT == "Out"
    
    def test_event_type_enum(self):
        """Test EventType enum values"""
        assert EventType.INVENTORY_USED == "inventory.used"
        assert EventType.INVENTORY_RESTOCKED == "inventory.restocked"
        assert EventType.INVENTORY_RAN_OUT == "inventory.ran_out"
    
    def test_receipt_status_enum(self):
        """Test ReceiptStatus enum values"""
        assert ReceiptStatus.UPLOADED == "uploaded"
        assert ReceiptStatus.PROCESSING == "processing"
        assert ReceiptStatus.PARSED == "parsed"
        assert ReceiptStatus.CONFIRMED == "confirmed"
        assert ReceiptStatus.FAILED == "failed"
