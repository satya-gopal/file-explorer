import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Tasks from './Tasks';
import AddTask from './AddTask';
import close from '../images/close.png';

const Dashboard = () => {
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [tasks, setTasks] = useState([]);

    

    // Toggle task status and reload tasks
    // const toggleTaskStatus = async (task) => {
    //     if (await saveTask(task)) {
    //         setTasks([...tasks]);  // Trigger re-render by updating state
    //     }
    // };

    // Load tasks from the API
    const loadTasks = async () => {
        setTasks(await getTasks());
    };

    // Toggle the add task modal
    const toggleAddTaskModal = () => {
        setIsAddTaskOpen(!isAddTaskOpen);
    };

    // Add a new task
    const addTask = async (description) => {
        toggleAddTaskModal();
        const task = { description };
        await saveTask(task);
        await loadTasks();
    };

    // Save task (create)
    const saveTask = async (task) => {
        let res = null;
        const options = {
            // method: task?.id ? 'PUT' : 'POST', 
            method: 'POST', 
            body: JSON.stringify(task),
            headers: { "Content-Type": "application/json" }
        };

        // if (task?.id) {
        //     res = await fetch('/api/tasks', options);
        // } else {
            res = await fetch('/api/tasks/add', options);
        // }

        if (res?.status === 200) {
            await loadTasks();
            return true;
        }
        return false;
    };

    // Delete a task
    const deleteTask = async (id) => {
        const res = await fetch(`/api/tasks?id=${id}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" }
        });

        if (res?.status === 200) {
            await loadTasks();
            return true;
        }
        return false;
    };

    const getTasks = async () => {
        const response = await fetch('/api/tasks');
        const body = await response.json();
        if (response.status !== 200) {
            throw new Error(body.message);
        }
        return body;
    };


    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <div>
            <div>
                <div className="add-task">
                    <button onClick={toggleAddTaskModal}>Add New Task</button>
                </div>
                {/* <Tasks tasks={tasks} toggleTaskStatus={toggleTaskStatus} deleteTask={deleteTask} /> */}
                <Tasks tasks={tasks} deleteTask={deleteTask} />

            </div>
            <Modal 
                isOpen={isAddTaskOpen}
                onRequestClose={toggleAddTaskModal}
                className="modal"
                overlayClassName="overlay">
                <div>
                    <img src={close} className="modal-close" alt="close" onClick={toggleAddTaskModal} />
                    <div className="modal-title">
                        <h3>Add Task</h3>
                    </div>
                    <div>
                        <AddTask handleSave={addTask} />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
