import { Avatar, Card, CardBody, Popover, PopoverTrigger, PopoverContent, Input, Button, CardHeader } from "@nextui-org/react";
import React from "react";
import { People, Person } from "@/helpers/types";

const pictureUsers = [
  "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  "https://i.pravatar.cc/150?u=a04258114e29026702d",
  "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
];

interface CardAgentsProps {
  friends: People;
  setFriends: React.Dispatch<React.SetStateAction<People>>;
}

export const CardAgents = ({ friends, setFriends }: CardAgentsProps) => {
  const [newFriendUsername, setNewFriendUsername] = React.useState<string>('');
  const handleNewFriend = async () => {
    // Add new friend to the list
    const res = await fetch(`/api/friends/${newFriendUsername}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      // Update the list of friends
      const newFriend = await res.json();
      setFriends([...friends, newFriend]);
      setNewFriendUsername('');
    } else {
      console.error('Failed to add', newFriendUsername);
    }
  };
  return (
    <Card className=" bg-default-50 rounded-xl shadow-md px-4 py-6 w-full">
      <CardBody className="py-4 gap-4">
        <div className="flex gap-2.5 justify-center">
          <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
            <span className="text-default-900 text-xl font-semibold">
              List
            </span>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-6">
          {
            friends && friends.length > 0 ? friends.map((item: Person, index: number) => (
              <Popover key={index} showArrow placement="bottom" color="secondary">
                <PopoverTrigger>
                  <Avatar src={pictureUsers[index % pictureUsers.length]} className="min-w-[40px]"/>
                </PopoverTrigger>
                <PopoverContent className="p-3 border-solid">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-semibold">{item.username}</h4>
                    <p className="text-sm text-italic">
                      {item.email}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            )) : (
              <div className="flex flex-col gap-2.5 justify-center">
                <span className="text-default-900 text-lg font-semibold">
                  No friends yet
                </span>
              </div>
            )
          }
          <Popover color="default" placement="bottom">
            <PopoverTrigger>
              <Button color="secondary" size="sm" variant="bordered" radius="lg">
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-1">
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-semibold">Add a friend</h4>
                <Input placeholder="Username" value={newFriendUsername} onChange={(e) => setNewFriendUsername(e.target.value)} />
                <Button size="sm" variant="ghost" radius="lg" onClick={() => handleNewFriend()}>
                  Add
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardBody>
    </Card>
  );
};
