"""
Tests for multi-tenant isolation (Task 1.1.8)

These tests verify that RLS policies properly enforce household boundaries
and prevent users from accessing data from households they don't belong to.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4

from app.services.household_service import HouseholdService
from app.core.errors import AuthorizationError, NotFoundError


@pytest.fixture
def mock_supabase():
    """Mock Supabase client"""
    with patch('app.services.household_service.get_supabase') as mock:
        yield mock.return_value


class TestMultiTenantIsolation:
    """Tests for multi-tenant isolation with RLS policies"""
    
    @pytest.mark.asyncio
    async def test_user_cannot_access_other_household(self, mock_supabase):
        """Test that a user cannot access a household they don't belong to"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock: User is not a member of the household
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(
            data=[]
        )
        
        service = HouseholdService()
        
        with pytest.raises(AuthorizationError) as exc_info:
            await service.get_household_by_id(household_id, user_id)
        
        assert "not a member" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_user_can_only_see_their_households(self, mock_supabase):
        """Test that a user only sees households they belong to"""
        user_id = str(uuid4())
        household1_id = str(uuid4())
        household2_id = str(uuid4())
        
        # Mock: User is member of household1 only
        mock_members = Mock(data=[{'household_id': household1_id}])
        mock_households = Mock(data=[{
            'id': household1_id,
            'name': 'My Household',
            'created_at': '2024-01-21T12:00:00Z',
            'updated_at': '2024-01-21T12:00:00Z'
        }])
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_members
        mock_supabase.table.return_value.select.return_value.in_.return_value.execute.return_value = mock_households
        
        service = HouseholdService()
        households = await service.get_user_households(user_id)
        
        # User should only see household1
        assert len(households) == 1
        assert str(households[0].id) == household1_id
    
    @pytest.mark.asyncio
    async def test_member_cannot_update_household_without_admin_role(self, mock_supabase):
        """Test that a non-admin member cannot update household"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock: User is a member but not admin
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(
            data=[{'role': 'member'}]
        )
        
        service = HouseholdService()
        
        with pytest.raises(AuthorizationError) as exc_info:
            await service.update_household(household_id, 'New Name', user_id)
        
        assert "admin" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_member_cannot_delete_household_without_admin_role(self, mock_supabase):
        """Test that a non-admin member cannot delete household"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock: User is a member but not admin
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = Mock(
            data=[{'role': 'member'}]
        )
        
        service = HouseholdService()
        
        with pytest.raises(AuthorizationError) as exc_info:
            await service.delete_household(household_id, user_id)
        
        assert "admin" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_admin_can_update_household(self, mock_supabase):
        """Test that an admin can update household"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        new_name = 'Updated Household'
        
        # Mock: User is admin
        mock_member = Mock(data=[{'role': 'admin'}])
        mock_household = Mock(data=[{
            'id': household_id,
            'name': new_name,
            'created_at': '2024-01-21T12:00:00Z',
            'updated_at': '2024-01-21T12:00:00Z'
        }])
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_member
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_household
        
        service = HouseholdService()
        household = await service.update_household(household_id, new_name, user_id)
        
        assert household.name == new_name
    
    @pytest.mark.asyncio
    async def test_admin_can_delete_household(self, mock_supabase):
        """Test that an admin can delete household"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock: User is admin
        mock_member = Mock(data=[{'role': 'admin'}])
        mock_delete = Mock(data=[{'id': household_id}])
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_member
        mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = mock_delete
        
        service = HouseholdService()
        
        # Should not raise an exception
        await service.delete_household(household_id, user_id)
    
    @pytest.mark.asyncio
    async def test_user_in_multiple_households_sees_all(self, mock_supabase):
        """Test that a user who belongs to multiple households sees all of them"""
        user_id = str(uuid4())
        household1_id = str(uuid4())
        household2_id = str(uuid4())
        household3_id = str(uuid4())
        
        # Mock: User is member of 3 households
        mock_members = Mock(data=[
            {'household_id': household1_id},
            {'household_id': household2_id},
            {'household_id': household3_id}
        ])
        mock_households = Mock(data=[
            {
                'id': household1_id,
                'name': 'Household 1',
                'created_at': '2024-01-21T12:00:00Z',
                'updated_at': '2024-01-21T12:00:00Z'
            },
            {
                'id': household2_id,
                'name': 'Household 2',
                'created_at': '2024-01-21T12:00:00Z',
                'updated_at': '2024-01-21T12:00:00Z'
            },
            {
                'id': household3_id,
                'name': 'Household 3',
                'created_at': '2024-01-21T12:00:00Z',
                'updated_at': '2024-01-21T12:00:00Z'
            }
        ])
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_members
        mock_supabase.table.return_value.select.return_value.in_.return_value.execute.return_value = mock_households
        
        service = HouseholdService()
        households = await service.get_user_households(user_id)
        
        # User should see all 3 households
        assert len(households) == 3
        household_ids = [str(h.id) for h in households]
        assert household1_id in household_ids
        assert household2_id in household_ids
        assert household3_id in household_ids
    
    @pytest.mark.asyncio
    async def test_household_data_isolated_by_rls(self, mock_supabase):
        """Test that RLS policies prevent cross-household data access"""
        user_id = str(uuid4())
        household_id = str(uuid4())
        
        # Mock: User is member of the household
        mock_member = Mock(data=[{'role': 'member'}])
        mock_household = Mock(data=[{
            'id': household_id,
            'name': 'My Household',
            'created_at': '2024-01-21T12:00:00Z',
            'updated_at': '2024-01-21T12:00:00Z',
        }])
        mock_members = Mock(data=[
            {
                'id': str(uuid4()),
                'user_id': user_id,
                'role': 'member',
                'joined_at': '2024-01-21T12:00:00Z'
            }
        ])
        
        # Setup mock chain - need to handle multiple calls properly
        call_count = [0]
        
        def mock_execute():
            call_count[0] += 1
            if call_count[0] == 1:
                return mock_member  # First call: check membership
            elif call_count[0] == 2:
                return mock_household  # Second call: get household
            else:
                return mock_members  # Third call: get members
        
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.eq.return_value.execute = mock_execute
        mock_table.select.return_value.eq.return_value.execute = mock_execute
        
        service = HouseholdService()
        household = await service.get_household_by_id(household_id, user_id)
        
        # User should only see data from their household
        assert household['id'] == household_id
        assert household['name'] == 'My Household'
        assert household['member_count'] == 1


class TestInvitationIsolation:
    """Tests for invitation multi-tenant isolation"""
    
    def test_user_cannot_view_invitations_from_other_household(self):
        """Test that users cannot view invitations from households they don't belong to"""
        # This will be implemented when invitation service is complete
        pass
    
    def test_only_admin_can_create_invitations(self):
        """Test that only admins can create invitations"""
        # This will be implemented when invitation service is complete
        pass


class TestItemInventoryIsolation:
    """Tests for item and inventory multi-tenant isolation"""
    
    def test_user_cannot_view_items_from_other_household(self):
        """Test that users cannot view items from households they don't belong to"""
        # This will be implemented when item service is complete
        pass
    
    def test_user_cannot_update_inventory_in_other_household(self):
        """Test that users cannot update inventory in households they don't belong to"""
        # This will be implemented when inventory service is complete
        pass


class TestReceiptIsolation:
    """Tests for receipt multi-tenant isolation"""
    
    def test_user_cannot_view_receipts_from_other_household(self):
        """Test that users cannot view receipts from households they don't belong to"""
        # This will be implemented when receipt service is complete
        pass
    
    def test_user_cannot_upload_receipt_to_other_household(self):
        """Test that users cannot upload receipts to households they don't belong to"""
        # This will be implemented when receipt service is complete
        pass
