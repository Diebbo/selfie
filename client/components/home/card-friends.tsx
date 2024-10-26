import { Avatar, Card, CardBody, Popover, PopoverTrigger, PopoverContent, Input, Button } from "@nextui-org/react";
import { Autocomplete, AutocompleteSection, AutocompleteItem } from "@nextui-org/autocomplete";
import React from "react";
import { People, Person } from "@/helpers/types";
import { TrashIcon } from "../icons/accounts/trash-icon";
interface peopleProp {
  username: string;
  _id: string;
}

const getAllUsernames = async (): Promise<peopleProp[]> => {
  const response = await fetch("/api/users/usernames");

  if (!response.ok) {
    throw new Error("Failed to fetch usernames");
  }

  const data = await response.json();
  return data.usernames;
}

const fetchNewFriend = async (newFriendUsername: string): Promise<Person> => {
  const response = await fetch(`/api/friends/${newFriendUsername}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error("Failed to add new friend");
  }

  const data = await response.json();
  return data;
}

const fetchDeleteFriend = async (id: string) => {
  const response = await fetch(`/api/friends/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Failed to delete friend");
  }
}

const pictureUsers = [
  "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  "https://i.pravatar.cc/150?u=a04258114e29026702d",
  "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
];

interface CardFriendsProps {
  friends: People;
  setFriends: React.Dispatch<React.SetStateAction<People>>;
  currentUserId: string;
}

export const CardFriends = ({ friends, setFriends, currentUserId }: CardFriendsProps) => {
  const [newFriendUser, setNewFriendUsername] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [userErrorMessage, setUserErrorMessage] = React.useState<string | null>(null);
  const [usersCasted, setUsersCasted] = React.useState<peopleProp[]>([]);

  React.useEffect(() => {
    const awaitUsernames = async () => {
      try {
        const peopleUsernames: peopleProp[] = await getAllUsernames();
        const filteredUsernames = peopleUsernames.filter((user) => currentUserId !== user._id && !friends.find((friend) => friend.username === user.username));
        setUsersCasted(filteredUsernames);
      } catch (error) {
        setErrorMessage("Failed to fetch usernames");
      }
    };
    awaitUsernames();
  }, []);

  const handleNewFriend = async () => {
    // Add new friend to the list using their ID
    try {
      const friendToAdd = usersCasted.find((user) => user.username === newFriendUser);
      if (friendToAdd) {
        const newFriend = await fetchNewFriend(friendToAdd.username); // Assuming `fetchNewFriend` accepts username
        setFriends([...friends, newFriend]);
        setNewFriendUsername('');
        setErrorMessage(null);
        const filteredUsernames = usersCasted.filter((user) => user.username !== newFriendUser);
        setUsersCasted(filteredUsernames);
      } else {
        setErrorMessage("Friend not found");
      }
    } catch (error) {
      setErrorMessage("Failed to add new friend");
    }
  };

  const handleDeleteFriend = (id: string) => {
    try {
      const response = fetchDeleteFriend(id);
      setFriends(friends.filter((friend) => friend._id !== id));
      setUserErrorMessage(null);
      // close popover

    } catch (error) {
      setUserErrorMessage("Failed to delete friend");
    }
  }

  return (
    <Card className=" bg-default-50 rounded-xl shadow-md p-5 w-full">
      <CardBody className="py-4 gap-4">
        <div className="flex gap-2.5 justify-center">
          <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
            <span className="text-default-900 text-xl font-semibold">List</span>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-6">
          {friends?.length > 0 ? (
            friends.map((item: Person, index: number) => (
              <Popover key={item._id} showArrow placement="bottom" color="default">
                <PopoverTrigger>
                  <Avatar src={pictureUsers[index % pictureUsers.length]} className="min-w-[40px]" />
                </PopoverTrigger>
                <PopoverContent className="p-3 border-solid">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-semibold flex justify-between items-center">
                      <span className="mr-2">{item.username}</span>
                      <Button size="sm" color="danger" isIconOnly variant="bordered" radius="lg" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFriend(item._id)
                      }}
                      >
                        <TrashIcon size={15} className={"fill-danger"} />
                      </Button>
                    </h4>
                    <p className="text-sm text-italic">{item.email}</p>
                    {userErrorMessage && <p className="text-red-500 text-sm">{userErrorMessage}</p>}
                  </div>
                </PopoverContent>
              </Popover>
            ))
          ) : (
            <div className="flex flex-col gap-2.5 justify-center">
              <span className="text-default-900 text-lg font-semibold">No friends yet</span>
            </div>
          )}
          <Popover color="default" placement="top">
            <PopoverTrigger>
              <Button color="secondary" size="sm" variant="bordered" radius="lg">
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3">
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-semibold">Add a friend</h4>
                <Autocomplete
                  label="New Friend"
                  placeholder="Search a friend"
                  className="max-w-xs"
                  defaultItems={usersCasted.map((user) => ({ label: user.username, value: user._id }))}
                  onInputChange={(value) => setNewFriendUsername(value)}
                >
                  {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                </Autocomplete>
                <Button size="sm" color="success" variant="ghost" radius="lg" onClick={handleNewFriend}>
                  Add
                </Button>
                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardBody>
    </Card>
  );
};
