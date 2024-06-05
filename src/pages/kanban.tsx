import { useAtom } from 'jotai';
import { listsAtom, itemsAtom } from '../atoms';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api } from '../utils/api';
import { useSession } from "next-auth/react";

const Kanban = () => {
  const { data: session } = useSession();
  const [lists, setLists] = useAtom(listsAtom);
  const [items, setItems] = useAtom(itemsAtom);
  const [newList, setNewList] = useState('');

  const { data, refetch, isLoading } = api.list.getAll.useQuery(undefined, {
    enabled: !!session, // Only fetch when the session is available
  });

  const createList = api.list.create.useMutation({
    onSuccess: () => {
      console.log('List created successfully');
      refetch();
    },
    onError: (error) => {
      console.error('Error creating list:', error);
    },
  });

  const deleteList = api.list.delete.useMutation({
    onSuccess: () => {
      console.log('List deleted successfully');
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting list:', error);
    },
  });

  const addItem = api.list.addItem.useMutation({
    onSuccess: () => {
      console.log('Item added successfully');
      refetch();
    },
    onError: (error) => {
      console.error('Error adding item:', error);
    },
  });

  const moveItem = api.list.moveItem.useMutation({
    onSuccess: () => {
      console.log('Item moved successfully');
      refetch();
    },
    onError: (error) => {
      console.error('Error moving item:', error);
    },
  });

  useEffect(() => {
    if (data) {
      console.log('Fetched data:', data);
      setLists(data.map((list) => list.name));
      const itemsMap = data.reduce((acc, list) => {
        acc[list.name] = list.items.map((item) => item.content);
        return acc;
      }, {});
      setItems(itemsMap);
    }
  }, [data, setLists, setItems]);

  const handleAddList = () => {
    if (newList.trim() === '') return;
    console.log('Creating list:', newList);
    createList.mutate({ name: newList });
    setNewList('');
  };

  const handleRemoveList = (listName: string) => {
    const list = data?.find((l) => l.name === listName);
    if (list) {
      console.log('Deleting list:', listName);
      deleteList.mutate({ id: list.id });
    }
  };

  const handleAddItem = (listName: string, content: string) => {
    const list = data?.find((l) => l.name === listName);
    if (list) {
      console.log('Adding item to list:', listName, content);
      addItem.mutate({ listId: list.id, content });
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = source.droppableId;
    const destList = destination.droppableId;

    if (sourceList === destList) {
      const reorderedItems = Array.from(items[sourceList]);
      const [movedItem] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, movedItem);
      setItems({ ...items, [sourceList]: reorderedItems });
    } else {
      const sourceItems = Array.from(items[sourceList]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      const destItems = Array.from(items[destList]);
      destItems.splice(destination.index, 0, movedItem);
      setItems({ ...items, [sourceList]: sourceItems, [destList]: destItems });

      const sourceListData = data?.find((l) => l.name === sourceList);
      const destListData = data?.find((l) => l.name === destList);
      if (sourceListData && destListData) {
        const itemToMove = sourceListData.items[source.index];
        moveItem.mutate({ id: itemToMove.id, toListId: destListData.id });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Lists</h1>
      <input
        type="text"
        value={newList}
        onChange={(e) => setNewList(e.target.value)}
        placeholder="New List"
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleAddList}>Add List</button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {lists.map((list) => (
            <Droppable key={list} droppableId={list}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ border: '1px solid black', padding: '10px', width: '200px' }}
                >
                  <h2>{list}</h2>
                  <button onClick={() => handleRemoveList(list)}>Delete List</button>
                  <List listName={list} addItem={handleAddItem} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

const List = ({ listName, addItem }) => {
  const [items, setItems] = useAtom(itemsAtom);
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim() === '') return;
    addItem(listName, newItem);
    setNewItem('');
  };

  return (
    <div>
      <input
        type="text"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder="New Item"
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleAddItem}>Add Item</button>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {items[listName]?.map((item, index) => (
          <Draggable key={item} draggableId={item} index={index}>
            {(provided) => (
              <li
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  ...provided.draggableProps.style,
                  border: '1px solid gray',
                  padding: '5px',
                  margin: '5px 0',
                  backgroundColor: 'white',
                }}
              >
                {item}
              </li>
            )}
          </Draggable>
        ))}
      </ul>
    </div>
  );
};

export default Kanban;