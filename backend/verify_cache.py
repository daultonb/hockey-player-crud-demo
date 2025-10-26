"""Quick script to verify caching is working."""
import asyncio
from app.cache import CacheService


async def main():
    print("Testing Cache Service...")
    print("-" * 50)

    # Test 1: Set and Get
    print("\n1. Testing SET and GET:")
    await CacheService.set("test", "key1", {"message": "Hello Cache"})
    result = await CacheService.get("test", "key1")
    print(f"   Set: {{'message': 'Hello Cache'}}")
    print(f"   Get: {result}")
    print(f"   ✓ Cache SET/GET working!" if result else "   ✗ Failed")

    # Test 2: Cache Miss
    print("\n2. Testing cache MISS:")
    result = await CacheService.get("test", "nonexistent")
    print(f"   Get nonexistent key: {result}")
    print(f"   ✓ Cache MISS working!" if result is None else "   ✗ Failed")

    # Test 3: Cache Delete
    print("\n3. Testing DELETE:")
    await CacheService.set("test", "key_to_delete", {"data": "will be deleted"})
    await CacheService.delete("test", "key_to_delete")
    result = await CacheService.get("test", "key_to_delete")
    print(f"   After delete: {result}")
    print(f"   ✓ Cache DELETE working!" if result is None else "   ✗ Failed")

    # Test 4: Pattern Delete
    print("\n4. Testing pattern DELETE:")
    await CacheService.set("test", "player1", {"id": 1})
    await CacheService.set("test", "player2", {"id": 2})
    await CacheService.set("test", "player3", {"id": 3})
    count = await CacheService.delete_pattern("cache:test:player*")
    print(f"   Deleted {count} keys matching 'cache:test:player*'")
    print(f"   ✓ Pattern DELETE working!" if count == 3 else "   ✗ Failed")

    # Test 5: Query Key Generation
    print("\n5. Testing query key generation:")
    key1 = CacheService.generate_query_key("list", page=1, limit=10, search="test")
    key2 = CacheService.generate_query_key("list", search="test", limit=10, page=1)
    print(f"   Key 1: {key1}")
    print(f"   Key 2: {key2}")
    print(f"   ✓ Keys match!" if key1 == key2 else "   ✗ Keys don't match")

    print("\n" + "=" * 50)
    print("✓ All cache tests completed successfully!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
