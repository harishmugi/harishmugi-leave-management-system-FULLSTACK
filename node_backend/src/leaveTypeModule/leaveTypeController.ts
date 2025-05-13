import { Request, ResponseToolkit,ServerRoute } from '@hapi/hapi';
import { LeaveTypeService ,LeaveTypeData} from './leaveTypeServices';
import { LeaveType } from './leaveTypeEntity';
import {LeaveTypeValidator} from './leaveTypeValidator'

export class  LeaveTypeController {

//CREATE LEAVE REQUEST
static async createLeaveType(request: Request, h: ResponseToolkit) {
  const leaveTypeData = request.payload as LeaveTypeData;

  try {
    await LeaveTypeValidator.checkLeaveTypeAlreadyExist(leaveTypeData.leave_type);
    
    const leaveType = await LeaveTypeService.createLeaveType(leaveTypeData);
    
    return h.response({ message: 'Leave type created', leaveType }).code(201);
  } catch (error) {


    if (error.message.includes('already exists')) {
      return h.response({ error: error.message }).code(400); 
    }
    
    console.error('Error:', error);
    
    return h.response({ error: error.message || 'Failed to create leave type' }).code(500);
  }
}


//GET LEAVE REQUEST=======================================================================================================================================


  static async getLeaveType(request: Request, h: ResponseToolkit) {
    try {
      const leaveTypes = await LeaveTypeService.getAllLeaveType();
      return h.response(leaveTypes).code(200);
    } catch (error) {


   

      console.error('Error fetching leaveTypes:', error);
      return h.response({ error: 'Failed to fetch leaveTypes' }).code(500);
    }
  }



  //UPDATE========================================================================================================================================

  static async updateLeaveType(request: Request, h: ResponseToolkit) {
    const id = request.params.id;
    const updateData = request.payload as Partial<LeaveType>;

    try {
      const updatedLeaveType = await LeaveTypeService.updateLeaveType(id, updateData);

      if (!updatedLeaveType) {
        return h.response({ error: 'Leave type not found' }).code(404);
      }

      return h.response({ message: 'Leave type updated', leaveType: updatedLeaveType }).code(200);
    } catch (error) {
      console.error('Error updating leave type:', error);
      return h.response({ error: 'Failed to update leave type' }).code(500);
    }
  }


//DELETE========================================================================================================================================


  static async deleteLeaveType(request: Request, h: ResponseToolkit) {
    const id = request.params.id;

    try {
      const deleted = await LeaveTypeService.deleteLeaveType(id);

      if (!deleted) {
        return h.response({ error: 'Leave type not found' }).code(404);
      }

      return h.response({ message: 'Leave type deleted successfully' }).code(200);
    } catch (error) {
      console.error('Error deleting leave type:', error);
      return h.response({ error: 'Failed to delete leave type' }).code(500);
    }
  }
}

//ROUTES==========================================================================================================================================
export const LeaveTypeRoute:ServerRoute[]=[
  {
    method: 'POST',
    path: '/leaveType',
    handler:  LeaveTypeController.createLeaveType
},

{
  method: 'GET',
  path: '/leaveTypes',
  handler:  LeaveTypeController.getLeaveType
},

{
  method: 'PUT',
  path: '/leaveType/{id}',
  handler:  LeaveTypeController.updateLeaveType,
},

{
  method: 'DELETE',
  path: '/leaveType/{id}',
  handler:  LeaveTypeController.deleteLeaveType,
}
//crud
]