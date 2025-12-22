import { Server, ServerRoute } from "@hapi/hapi";
import handler from "./handler";


const register = async (server: Server): Promise<void> => {
  const routes: ServerRoute[] = [
    
    // CREATE GROUP 
    {
      method: "POST",
      path: "/groupmessage",
      options: {
        handler: handler.createGroup,
        tags: ["api", "groupmessage"],
        description: "Create new group + first message",
        
      },
    },

    // ADD PARTICIPANTS
    {
      method: "PUT",
      path: "/groupmessage/add-participants/{groupId}",
      options: {
        handler: handler.handleAddParticipants,
        tags: ["api", "groupmessage"],
        description: "Add participants to an existing group",
       
      },
    },
{
      method: "POST",
      path: "/groupmessage/send-message",
      options: {
        handler: handler.sendMessage,
        tags: ["api", "groupmessage"],
        description: "Send message to an existing group",
       
      },
    },
   
    // REMOVE PARTICIPANTS
    {
      method: "PUT",
      path: "/groupmessage/remove-participants/{groupId}",
      options: {
        handler: handler.handleRemoveParticipants,
        tags: ["api", "groupmessage"],
        description: "Remove participants from an existing group",
       
      },
    },

   
    // CLEAR CONVERSATION
    {
      method: "PUT",
      path: "/groupmessage/clear-conversation",
      options: {
        handler: handler.handleClearConversation,
        tags: ["api", "groupmessage"],
        description: "Clear all messages in a group",
       
      },
    },

    
    // SOFT DELETE GROUP
    {
      method: "PUT",
      path: "/groupmessage/soft-delete-group",
      options: {
        handler: handler.handleSoftDeleteGroup,
        tags: ["api", "groupmessage"],
        description: "Soft delete the group + its messages",
       
      },
    },

    //GET MESSAGE
    {
  method: "GET",
  path: "/groupmessage/{groupId}",
  options: {
    handler: handler.getGroupChatHandler,
    tags: ["api", "groupmessage"],
    // auth: {
    //   strategies: ["jwt"],
    // },
    
  },
}

  ];

  server.route(routes);
};

export = {
  name: "api-groupmessage",
  register,
};
