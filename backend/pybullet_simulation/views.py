from django.shortcuts import render
from django.http import JsonResponse
import pybullet as p
import pybullet_data


# Global variables for robot_id and joint_indices
robot_id = None
joint_indices = None

def index(request):
    return render(request, 'index.html')


def get_simulation_data(request):
    global robot_id, joint_indices  # Accessing robot_id and joint_indices globally
    if robot_id is not None and joint_indices is not None:
        # Retrieve simulation data and send to the frontend
        # For example: robot position, joint angles, etc.
        # You can use p.getBasePositionAndOrientation(), p.getJointState(), etc.
        # Return data in JSON format
        joint_states = p.getJointStates(robot_id, joint_indices)
        joint_positions = np.array([j[0] for j in joint_states])
        robot_position, _ = p.getBasePositionAndOrientation(robot_id)
        
        simulation_data = {
            'robot_position': robot_position,
            'joint_positions': joint_positions.tolist(),
            # Add more simulation data here...
        }
        print(simulation_data)
        return JsonResponse(simulation_data)
    else:
        return JsonResponse({'error': 'Robot is not initialized'})
    

import time
import numpy as np
import threading

def rob_loop():
    global robot_id, joint_indices  # Accessing robot_id and joint_indices globally
    while True:
        time.sleep(0.01)

        if robot_id is not None and joint_indices is not None:
            joint_states = p.getJointStates(robot_id, joint_indices)
            joint_positions = np.array([j[0] for j in joint_states])
            error = desired_joint_positions - joint_positions
            torque = error * P_GAIN

            p.setJointMotorControlArray(
                bodyIndex=robot_id,
                jointIndices=joint_indices,
                controlMode=p.TORQUE_CONTROL,
                forces=torque,
            )

        p.stepSimulation()


P_GAIN = 50
desired_joint_positions = np.array([1.218, 0.507, -0.187, 1.235, 0.999, 1.279, 0])

width = 1080
height = 800
viewMatrix = p.computeViewMatrixFromYawPitchRoll(cameraTargetPosition=[0,0,1],
                                                  distance=2,
                                                  yaw=0,
                                                  pitch=-10,
                                                  roll=0,
                                                  upAxisIndex=2)
projectionMatrix = p.computeProjectionMatrixFOV(fov=60,
                                                 aspect=float(width)/height,
                                                 nearVal=0.1,
                                                 farVal=100.0)

physicsClient = p.connect(p.GUI)

p.setAdditionalSearchPath(pybullet_data.getDataPath())
p.loadURDF("plane.urdf")
robot_id = p.loadURDF("kuka_iiwa/model.urdf", useFixedBase=True)

num_dofs = 7
joint_indices = range(num_dofs)

# The magic that enables torque control
p.setJointMotorControlArray(
    bodyIndex=robot_id,
    jointIndices=joint_indices,
    controlMode=p.VELOCITY_CONTROL,
    forces=np.zeros(num_dofs),
)

loop_thread = threading.Thread(target=rob_loop)
loop_thread.start()
