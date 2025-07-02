import { Server, ServerRoute } from '@hapi/hapi';
import { addMeetingMessages, evaluationMessages } from '../../config/messages'
import handler from './handler';

const register = async (server:Server): Promise <void> => {
    const routes: ServerRoute[] = [
        {   
            method: 'POST',
            path:'/teacherMeeting',
            options: {
                handler: handler.createTeacherMeeting,
                description:addMeetingMessages.CREATE,
                tags: ['api', 'teacherMeeting']
            },
        },
        {
            method: 'GET',
            path:'/teacherMeeting/{meetingId}',
            options: {
                handler: handler.getTeachermeetingById,
                description:addMeetingMessages.CREATE,
                tags: ['api', 'teacherMeeting'],
                 auth: {
        strategies: ["jwt"],
      },
        },
    },

    {
        method: "GET",
        path: "/teacherMeetinglist",
        options: {
          handler: handler.getallTeachermeeting,
          description: evaluationMessages.LIST,
          tags: ["api", "teacherMeetinglist"],
          auth: {
            strategies: ["jwt"],
          },  
        },
      },
  
    {   
        method: 'PUT',
        path:'/updateTeacherMeeting/{id}',
        options: {
            handler: handler.updateTeacherMeeting,
            description:addMeetingMessages.CREATE,
            tags: ['api', 'teacherMeeting']
        },
    },
    ];
    server.route(routes);
};  

export = {
    name: "api-teacherMeeting",
    register,
  };