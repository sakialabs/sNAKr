"""
Item service for business logic

This service handles item CRUD operations, fuzzy search, and category management.
It ensures proper multi-tenant isolation and provides human-friendly item management.
"""
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime
import logging

from app.services.supabase_client import get_supabase
from app.models import Item, ItemCreate, ItemUpdate, Category, Location, State
from app.core.errors import NotFoundError, ValidationError, AuthorizationError

logger = logging.getLogger(__name__)


class ItemService:
    """Service for item management operations"""
    
    def __init__(self):
        self.supabase = get_supabase()
    
    async def create_item(
        self,
        household_id: str,
        user_id: str,
        name: str,
        category: Category,
        location: Location
    ) -> Dict[str, Any]:
        """
        Create a new item in the household catalog
        
        Args:
            household_id: Household UUID
            user_id: User UUID making the request
            name: Item name
            category: Item category
            location: Storage location
            
        Returns:
            Created item with initial inventory state
            
        Raises:
            ValidationError: If item data is invalid
            AuthorizationError: If user is not a member
        """
        # Verify user is a member of the household
        await self._verify_household_member(household_id, user_id)
        
        # Validate item name
        if not name or not name.strip():
            raise ValidationError(
                "Item name cannot be empty",
                user_message="Please provide a name for the item.",
                next_steps="Enter an item name and try again."
            )
        
        if len(name) > 255:
            raise ValidationError(
                "Item name too long",
                user_message="Item name is too long.",
                next_steps="Please use a shorter name (max 255 characters)."
            )
        
        try:
            # Create item
            item_response = self.supabase.table('items')\
                .insert({
                    'household_id': household_id,
                    'name': name.strip(),
                    'category': category.value,
                    'location': location.value
                })\
                .execute()
            
            if not item_response.data:
                raise Exception("Failed to create item")
            
            item_data = item_response.data[0]
            item_id = item_data['id']
            
            logger.info(f"Item {item_id} created: '{name}' in household {household_id}")
            
            # Create initial inventory entry with "OK" state
            inventory_response = self.supabase.table('inventory')\
                .insert({
                    'household_id': household_id,
                    'item_id': item_id,
                    'state': State.OK.value,
                    'confidence': 1.0
                })\
                .execute()
            
            if not inventory_response.data:
                # Rollback: delete the item if inventory creation fails
                logger.error(f"Failed to create inventory for item {item_id}")
                self.supabase.table('items').delete().eq('id', item_id).execute()
                raise Exception("Failed to create inventory entry")
            
            inventory_data = inventory_response.data[0]
            
            logger.info(f"Inventory created for item {item_id} with state OK")
            
            # Return combined item and inventory data
            return {
                'id': item_data['id'],
                'household_id': item_data['household_id'],
                'name': item_data['name'],
                'category': item_data['category'],
                'location': item_data['location'],
                'created_at': item_data['created_at'],
                'updated_at': item_data['updated_at'],
                'inventory': {
                    'id': inventory_data['id'],
                    'state': inventory_data['state'],
                    'confidence': inventory_data['confidence'],
                    'last_updated': inventory_data['updated_at']
                }
            }
            
        except (ValidationError, AuthorizationError):
            raise
        except Exception as e:
            logger.error(f"Error creating item: {e}", exc_info=True)
            raise Exception(f"Failed to create item: {str(e)}")
    
    async def get_household_items(
        self,
        household_id: str,
        user_id: str,
        location: Optional[Location] = None,
        state: Optional[State] = None,
        category: Optional[Category] = None,
        sort_by: str = 'name',
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get all items for a household with optional filters
        
        Args:
            household_id: Household UUID
            user_id: User UUID making the request
            location: Optional location filter
            state: Optional state filter
            category: Optional category filter
            sort_by: Sort field (name, state, last_updated)
            limit: Max items to return
            offset: Pagination offset
            
        Returns:
            Dictionary with items list and total count
            
        Raises:
            AuthorizationError: If user is not a member
        """
        # Verify user is a member of the household
        await self._verify_household_member(household_id, user_id)
        
        try:
            # Build query with joins
            query = self.supabase.table('items')\
                .select('*, inventory!inner(*)')\
                .eq('household_id', household_id)
            
            # Apply filters
            if location:
                query = query.eq('location', location.value)
            
            if category:
                query = query.eq('category', category.value)
            
            if state:
                query = query.eq('inventory.state', state.value)
            
            # Apply sorting
            if sort_by == 'name':
                query = query.order('name')
            elif sort_by == 'state':
                query = query.order('inventory.state')
            elif sort_by == 'last_updated':
                query = query.order('inventory.updated_at', desc=True)
            
            # Apply pagination
            query = query.range(offset, offset + limit - 1)
            
            # Execute query
            response = query.execute()
            
            if not response.data:
                return {'items': [], 'total': 0}
            
            # Transform data
            items = []
            for row in response.data:
                inventory = row['inventory'][0] if row['inventory'] else None
                items.append({
                    'id': row['id'],
                    'household_id': row['household_id'],
                    'name': row['name'],
                    'category': row['category'],
                    'location': row['location'],
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at'],
                    'inventory': {
                        'id': inventory['id'],
                        'state': inventory['state'],
                        'confidence': inventory['confidence'],
                        'last_updated': inventory['updated_at']
                    } if inventory else None
                })
            
            logger.info(f"Retrieved {len(items)} items for household {household_id}")
            
            return {
                'items': items,
                'total': len(items)
            }
            
        except AuthorizationError:
            raise
        except Exception as e:
            logger.error(f"Error fetching items for household {household_id}: {e}", exc_info=True)
            raise Exception(f"Failed to fetch items: {str(e)}")
    
    async def get_item_by_id(
        self,
        item_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Get a specific item by ID with inventory details
        
        Args:
            item_id: Item UUID
            user_id: User UUID making the request
            
        Returns:
            Item details with inventory
            
        Raises:
            NotFoundError: If item not found
            AuthorizationError: If user is not a member
        """
        try:
            # Get item with inventory
            response = self.supabase.table('items')\
                .select('*, inventory(*)')\
                .eq('id', item_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(
                    "Item not found",
                    user_message="This item doesn't exist.",
                    next_steps="Check the item ID and try again."
                )
            
            item_data = response.data[0]
            household_id = item_data['household_id']
            
            # Verify user is a member of the household
            await self._verify_household_member(household_id, user_id)
            
            inventory = item_data['inventory'][0] if item_data['inventory'] else None
            
            return {
                'id': item_data['id'],
                'household_id': item_data['household_id'],
                'name': item_data['name'],
                'category': item_data['category'],
                'location': item_data['location'],
                'created_at': item_data['created_at'],
                'updated_at': item_data['updated_at'],
                'inventory': {
                    'id': inventory['id'],
                    'state': inventory['state'],
                    'confidence': inventory['confidence'],
                    'last_updated': inventory['updated_at']
                } if inventory else None
            }
            
        except (NotFoundError, AuthorizationError):
            raise
        except Exception as e:
            logger.error(f"Error fetching item {item_id}: {e}", exc_info=True)
            raise Exception(f"Failed to fetch item: {str(e)}")
    
    async def update_item(
        self,
        item_id: str,
        user_id: str,
        name: Optional[str] = None,
        category: Optional[Category] = None,
        location: Optional[Location] = None
    ) -> Dict[str, Any]:
        """
        Update an item's details
        
        Args:
            item_id: Item UUID
            user_id: User UUID making the request
            name: Optional new name
            category: Optional new category
            location: Optional new location
            
        Returns:
            Updated item
            
        Raises:
            ValidationError: If update data is invalid
            NotFoundError: If item not found
            AuthorizationError: If user is not a member
        """
        # Get item to verify household membership
        item = await self.get_item_by_id(item_id, user_id)
        
        # Build update data
        update_data = {}
        
        if name is not None:
            if not name.strip():
                raise ValidationError(
                    "Item name cannot be empty",
                    user_message="Please provide a name for the item.",
                    next_steps="Enter an item name and try again."
                )
            if len(name) > 255:
                raise ValidationError(
                    "Item name too long",
                    user_message="Item name is too long.",
                    next_steps="Please use a shorter name (max 255 characters)."
                )
            update_data['name'] = name.strip()
        
        if category is not None:
            update_data['category'] = category.value
        
        if location is not None:
            update_data['location'] = location.value
        
        if not update_data:
            # No changes, return current item
            return item
        
        try:
            # Update item
            response = self.supabase.table('items')\
                .update(update_data)\
                .eq('id', item_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(
                    "Item not found",
                    user_message="This item doesn't exist.",
                    next_steps="Check the item ID and try again."
                )
            
            logger.info(f"Item {item_id} updated")
            
            # Return updated item
            return await self.get_item_by_id(item_id, user_id)
            
        except (ValidationError, NotFoundError, AuthorizationError):
            raise
        except Exception as e:
            logger.error(f"Error updating item {item_id}: {e}", exc_info=True)
            raise Exception(f"Failed to update item: {str(e)}")
    
    async def delete_item(
        self,
        item_id: str,
        user_id: str
    ) -> None:
        """
        Delete an item (cascade deletes inventory and events)
        
        Args:
            item_id: Item UUID
            user_id: User UUID making the request
            
        Raises:
            NotFoundError: If item not found
            AuthorizationError: If user is not a member
        """
        # Get item to verify household membership
        item = await self.get_item_by_id(item_id, user_id)
        
        try:
            # Delete item (cascade will delete inventory and events)
            response = self.supabase.table('items')\
                .delete()\
                .eq('id', item_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(
                    "Item not found",
                    user_message="This item doesn't exist.",
                    next_steps="Check the item ID and try again."
                )
            
            logger.info(f"Item {item_id} deleted from household {item['household_id']}")
            
        except (NotFoundError, AuthorizationError):
            raise
        except Exception as e:
            logger.error(f"Error deleting item {item_id}: {e}", exc_info=True)
            raise Exception(f"Failed to delete item: {str(e)}")
    
    async def search_items(
        self,
        household_id: str,
        user_id: str,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fuzzy search items by name using trigram similarity
        
        Args:
            household_id: Household UUID
            user_id: User UUID making the request
            query: Search query
            limit: Max results to return
            
        Returns:
            List of items with similarity scores
            
        Raises:
            AuthorizationError: If user is not a member
        """
        # Verify user is a member of the household
        await self._verify_household_member(household_id, user_id)
        
        if not query or not query.strip():
            return []
        
        try:
            # Use trigram similarity search
            # Note: This requires pg_trgm extension and GIN index on items.name
            response = self.supabase.rpc(
                'search_items_fuzzy',
                {
                    'household_id_param': household_id,
                    'search_query': query.strip(),
                    'result_limit': limit
                }
            ).execute()
            
            if not response.data:
                return []
            
            logger.info(f"Found {len(response.data)} items matching '{query}' in household {household_id}")
            
            return response.data
            
        except AuthorizationError:
            raise
        except Exception as e:
            logger.error(f"Error searching items in household {household_id}: {e}", exc_info=True)
            # Fallback to simple ILIKE search if RPC fails
            try:
                response = self.supabase.table('items')\
                    .select('*')\
                    .eq('household_id', household_id)\
                    .ilike('name', f'%{query.strip()}%')\
                    .limit(limit)\
                    .execute()
                
                return response.data if response.data else []
            except Exception as fallback_error:
                logger.error(f"Fallback search also failed: {fallback_error}")
                return []
    
    async def _verify_household_member(self, household_id: str, user_id: str) -> None:
        """
        Verify that a user is a member of a household
        
        Args:
            household_id: Household UUID
            user_id: User UUID
            
        Raises:
            AuthorizationError: If user is not a member
        """
        try:
            response = self.supabase.table('household_members')\
                .select('id')\
                .eq('household_id', household_id)\
                .eq('user_id', user_id)\
                .execute()
            
            if not response.data:
                raise AuthorizationError(
                    "User is not a member of this household",
                    user_message="You don't have access to this household.",
                    next_steps="Contact the household admin for access."
                )
        except AuthorizationError:
            raise
        except Exception as e:
            logger.error(f"Error verifying household membership: {e}", exc_info=True)
            raise AuthorizationError(
                "Failed to verify household membership",
                user_message="We couldn't verify your access.",
                next_steps="Try again or contact support."
            )
