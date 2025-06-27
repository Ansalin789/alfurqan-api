import { Server, ServerRoute } from '@hapi/hapi';
import { addMeetingMessages } from '../../config/messages'
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
            path:'/teacherMeeting',
            options: {
                handler: handler.getallTeachermeeting,
                description:addMeetingMessages.CREATE,
                tags: ['api', 'teacherMeeting'],
                 auth: {
        strategies: ["jwt"],
      },
            },
        }
    ];
    server.route(routes);
};  

export = {
    name: "api-teacherMeeting",
    register,
  };